import { Client } from "@notionhq/client";
import { slack, getLegalIssuesChannel } from "@/lib/slack";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function getDatabaseId(): string {
  return process.env.NOTION_LEGAL_ISSUES_DATABASE_ID!;
}

const processedPages = new Set<string>();

interface LegalIssueEntry {
  pageId: string;
  name: string;
  issueStatus: string;
  issueType: string;
  priority: string;
  riskLevel: string;
  assignedFunction: string;
  blocking: boolean;
  sourceExcerpt: string;
  recommendedPosition: string;
  nextAction: string;
  approvalRequired: string[];
  dueDate: string;
  notionUrl: string;
}

const STATUS_OPTIONS = [
  { text: "Open", value: "Open" },
  { text: "In Review", value: "In Review" },
  { text: "Waiting on Internal", value: "Waiting on Internal" },
  { text: "Waiting on Counterparty", value: "Waiting on Counterparty" },
  { text: "Resolved", value: "Resolved" },
  { text: "Closed", value: "Closed" },
] as const;

const PRIORITY_EMOJI: Record<string, string> = {
  High: ":red_circle:",
  Medium: ":large_yellow_circle:",
  Low: ":white_circle:",
};

const RISK_EMOJI: Record<string, string> = {
  Critical: ":bangbang:",
  High: ":warning:",
  Medium: ":large_yellow_circle:",
  Low: ":large_green_circle:",
};

// Routing map: Assigned Function → Slack user ID.
// Loaded from a Notion database (NOTION_ROUTING_MAP_DATABASE_ID) with columns:
//   - "Function" (title)  — must match Assigned Function values exactly
//                            (e.g. "Security", "Finance", "Product Legal")
//   - "Slack User ID" (rich_text) — the Slack member ID to tag (e.g. "U09M4TH97PZ")
//
// Cached in memory; refreshed every 10 minutes.
let routingCache: Record<string, string> = {};
let routingCacheExpiry = 0;

async function loadRoutingMap(): Promise<Record<string, string>> {
  const dbId = process.env.NOTION_ROUTING_MAP_DATABASE_ID;
  if (!dbId) return {};

  if (Date.now() < routingCacheExpiry) return routingCache;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 50 }),
    }).then((r) => r.json());

    const map: Record<string, string> = {};
    for (const page of response.results || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props = (page as any).properties;
      const fn = (props["Function"]?.title || [])
        .map((t: { plain_text: string }) => t.plain_text)
        .join("");
      const slackId = (props["Slack User ID"]?.rich_text || [])
        .map((t: { plain_text: string }) => t.plain_text)
        .join("")
        .trim();
      if (fn && slackId) map[fn] = slackId;
    }

    routingCache = map;
    routingCacheExpiry = Date.now() + 10 * 60 * 1000;
    console.log("[legal-issues] Loaded routing map:", Object.keys(map).length, "entries");
    return map;
  } catch (err) {
    console.error("[legal-issues] Failed to load routing map:", err);
    return routingCache;
  }
}

async function getRoutingTarget(assignedFunction: string): Promise<string | undefined> {
  const map = await loadRoutingMap();
  return map[assignedFunction];
}

function extractRichText(prop: { rich_text?: { plain_text: string }[] }): string {
  return (prop.rich_text || []).map((rt) => rt.plain_text).join("");
}

async function fetchNewIssues(): Promise<LegalIssueEntry[]> {
  const dbId = getDatabaseId();
  if (!dbId) return [];

  const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Issue Status", status: { does_not_equal: "Resolved" } },
          { property: "Issue Status", status: { does_not_equal: "Closed" } },
        ],
      },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      page_size: 20,
    }),
  }).then((r) => r.json());

  const entries: LegalIssueEntry[] = [];

  for (const page of response.results) {
    if (processedPages.has(page.id)) continue;
    if (!("properties" in page)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = page.properties as any;

    const titleParts = props["Name"]?.title || [];
    const name = titleParts.map((t: { plain_text: string }) => t.plain_text).join("");

    entries.push({
      pageId: page.id,
      name,
      issueStatus: props["Issue Status"]?.status?.name || "Open",
      issueType: props["Issue Type"]?.select?.name || "Other",
      priority: props["Priority"]?.select?.name || "",
      riskLevel: props["Risk Level"]?.select?.name || "",
      assignedFunction: props["Assigned Function"]?.select?.name || "",
      blocking: props["Blocking"]?.checkbox || false,
      sourceExcerpt: extractRichText(props["Source Excerpt"] || {}),
      recommendedPosition: extractRichText(props["Recommended Position"] || {}),
      nextAction: extractRichText(props["Next Action"] || {}),
      approvalRequired: (props["Approval Required"]?.multi_select || []).map(
        (s: { name: string }) => s.name
      ),
      dueDate: props["Due Date"]?.date?.start || "",
      notionUrl: (page as { url?: string }).url || "",
    });
  }

  return entries;
}

function buildSlackCard(entry: LegalIssueEntry): Record<string, unknown>[] {
  const priorityEmoji = PRIORITY_EMOJI[entry.priority] || "";
  const riskEmoji = RISK_EMOJI[entry.riskLevel] || "";

  const metaLines = [
    `*Issue Type:* ${entry.issueType}`,
    `*Priority:* ${priorityEmoji} ${entry.priority || "Not set"}`,
    `*Status:* ${entry.issueStatus}`,
    entry.assignedFunction ? `*Function:* ${entry.assignedFunction}` : "",
    entry.riskLevel ? `*Risk:* ${riskEmoji} ${entry.riskLevel}` : "",
    entry.blocking ? `*:rotating_light: Blocking*` : "",
    entry.dueDate ? `*Due:* ${entry.dueDate}` : "",
    entry.approvalRequired.length > 0
      ? `*Approval Required:* ${entry.approvalRequired.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `Legal Issue: ${entry.name}`.slice(0, 150) },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: metaLines },
    },
  ];

  if (entry.sourceExcerpt) {
    blocks.push(
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Source:*\n${entry.sourceExcerpt.slice(0, 2500)}`,
        },
      }
    );
  }

  if (entry.recommendedPosition) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Recommended Position:*\n${entry.recommendedPosition.slice(0, 2500)}`,
      },
    });
  }

  if (entry.nextAction) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Next Action:*\n${entry.nextAction.slice(0, 2500)}`,
      },
    });
  }

  blocks.push(
    { type: "divider" },
    {
      type: "actions",
      elements: [
        {
          type: "static_select",
          action_id: "legal_issue_status_update",
          placeholder: { type: "plain_text", text: "Update Status..." },
          initial_option: STATUS_OPTIONS.find((o) => o.value === entry.issueStatus)
            ? {
                text: {
                  type: "plain_text" as const,
                  text: entry.issueStatus,
                },
                value: entry.issueStatus,
              }
            : undefined,
          options: STATUS_OPTIONS.map((o) => ({
            text: { type: "plain_text" as const, text: o.text },
            value: o.value,
          })),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Open in Notion" },
          url: entry.notionUrl,
          action_id: "legal_issue_open_notion",
        },
      ],
    }
  );

  return blocks;
}

async function postIssueCard(entry: LegalIssueEntry): Promise<void> {
  const channel = getLegalIssuesChannel();
  const blocks = buildSlackCard(entry);

  const routingTarget = await getRoutingTarget(entry.assignedFunction);
  let fallbackText = `Legal Issue: ${entry.name} — ${entry.issueType} (${entry.priority})`;
  if (routingTarget) {
    fallbackText = `<@${routingTarget}> ${fallbackText}`;
  }

  await slack.chat.postMessage({
    channel,
    text: fallbackText,
    blocks: blocks as never[],
    metadata: {
      event_type: "legal_issue",
      event_payload: { pageId: entry.pageId },
    },
  });

  processedPages.add(entry.pageId);
  console.log("[legal-issues] Posted card for:", entry.name);
}

export async function updateIssueStatus(pageId: string, newStatus: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Issue Status": {
        status: { name: newStatus },
      },
    },
  });
  console.log("[legal-issues] Updated status to", newStatus, "for", pageId);
}

export async function handleLegalIssueStatusUpdate(
  pageId: string,
  newStatus: string,
  userId: string,
  messageTs: string,
  channelId: string
): Promise<void> {
  await updateIssueStatus(pageId, newStatus);

  const response = await notion.pages.retrieve({ page_id: pageId });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = (response as any).properties;
  const titleParts = props["Name"]?.title || [];
  const name = titleParts.map((t: { plain_text: string }) => t.plain_text).join("");

  const entry: LegalIssueEntry = {
    pageId,
    name,
    issueStatus: newStatus,
    issueType: props["Issue Type"]?.select?.name || "Other",
    priority: props["Priority"]?.select?.name || "",
    riskLevel: props["Risk Level"]?.select?.name || "",
    assignedFunction: props["Assigned Function"]?.select?.name || "",
    blocking: props["Blocking"]?.checkbox || false,
    sourceExcerpt: extractRichText(props["Source Excerpt"] || {}),
    recommendedPosition: extractRichText(props["Recommended Position"] || {}),
    nextAction: extractRichText(props["Next Action"] || {}),
    approvalRequired: (props["Approval Required"]?.multi_select || []).map(
      (s: { name: string }) => s.name
    ),
    dueDate: props["Due Date"]?.date?.start || "",
    notionUrl: (response as { url?: string }).url || "",
  };

  const blocks = buildSlackCard(entry);

  // Prepend a context block showing who updated and when
  blocks.splice(1, 0, {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Status updated to *${newStatus}* by <@${userId}>`,
      },
    ],
  });

  await slack.chat.update({
    channel: channelId,
    ts: messageTs,
    text: `Legal Issue: ${name} — updated to ${newStatus}`,
    blocks: blocks as never[],
  });
}

export async function pollLegalIssues(): Promise<void> {
  try {
    const issues = await fetchNewIssues();
    if (issues.length === 0) return;

    console.log(`[legal-issues] Found ${issues.length} new issue(s)`);

    for (const issue of issues) {
      try {
        await postIssueCard(issue);
      } catch (err) {
        console.error("[legal-issues] Failed to post issue:", issue.name, err);
      }
    }
  } catch (err) {
    console.error("[legal-issues] Poll error:", err);
  }
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startLegalIssuesPoller(intervalMs = 5 * 60 * 1000): void {
  if (!getDatabaseId()) {
    console.log("[legal-issues] NOTION_LEGAL_ISSUES_DATABASE_ID not set, skipping poller");
    return;
  }
  if (!getLegalIssuesChannel()) {
    console.log("[legal-issues] SLACK_LEGAL_ISSUES_CHANNEL not set, skipping poller");
    return;
  }

  console.log(`[legal-issues] Starting poller (interval: ${intervalMs / 1000}s)`);
  pollLegalIssues();
  pollInterval = setInterval(pollLegalIssues, intervalMs);
}

export function stopLegalIssuesPoller(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
