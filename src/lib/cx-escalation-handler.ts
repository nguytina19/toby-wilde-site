import { Client } from "@notionhq/client";
import { slack, getCxReviewChannel } from "@/lib/slack";
import { storeAnswer } from "@/lib/answer-store";
import { draftCxDecision } from "@/lib/cx-escalation";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function getCxDatabaseId(): string {
  return process.env.NOTION_CX_DATABASE_ID!;
}

const processedPages = new Set<string>();

interface TicketEntry {
  pageId: string;
  ticket: string;
  scenario: string;
  customerPushback: string;
  complaintBasis: string[];
  stripe: string;
  relatedImpact: string;
  ticketOpenedDate: string;
}

function extractRichText(prop: { rich_text?: { plain_text: string }[] }): string {
  return (prop.rich_text || []).map((rt) => rt.plain_text).join("");
}

async function fetchPendingTickets(): Promise<TicketEntry[]> {
  const dbId = getCxDatabaseId();
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
          { property: "Status", status: { equals: "Requires Legal review" } },
          { property: "Decision", rich_text: { is_empty: true } },
        ],
      },
      sorts: [{ property: "Created time", direction: "ascending" }],
      page_size: 10,
    }),
  }).then((r) => r.json());

  const entries: TicketEntry[] = [];

  for (const page of response.results) {
    if (processedPages.has(page.id)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (page as any).properties;

    const titleParts = props["Ticket"]?.title || [];
    const ticket = titleParts.map((t: { plain_text: string }) => t.plain_text).join("");

    const scenario = extractRichText(props["Scenario"] || {});
    const customerPushback = extractRichText(props["Customer push back"] || {});
    const stripe = extractRichText(props["Stripe"] || {});
    const relatedImpact = extractRichText(props["Related $$$ impact "] || {});

    const complaintBasis = (props["Complaint basis"]?.multi_select || []).map(
      (s: { name: string }) => s.name
    );

    const ticketOpenedDate = props["Ticket opened date"]?.date?.start || "";

    entries.push({
      pageId: page.id,
      ticket,
      scenario,
      customerPushback,
      complaintBasis,
      stripe,
      relatedImpact,
      ticketOpenedDate,
    });
  }

  return entries;
}

const PATTERN_LABELS: Record<string, string> = {
  refund_de_escalate: "💸 Refund to de-escalate",
  refund_seats: "💺 Refund seats only",
  void_invoice: "🧾 Void unpaid invoice",
  push_back: "🛑 Push back / close",
  verify_facts: "🔍 Verify facts first",
  unknown: "❓ Review needed",
};

async function postReviewCard(entry: TicketEntry): Promise<void> {
  console.log("[cx-escalation] Drafting decision for:", entry.ticket);

  const result = await draftCxDecision(
    entry.scenario,
    entry.complaintBasis,
    entry.customerPushback
  );

  const patternLabel = PATTERN_LABELS[result.pattern] || PATTERN_LABELS.unknown;

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "CX Legal Escalation" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `*Ticket:* ${entry.ticket}`,
          `*Complaint:* ${entry.complaintBasis.join(", ") || "Not specified"}`,
          entry.ticketOpenedDate ? `*Opened:* ${entry.ticketOpenedDate}` : "",
          entry.stripe ? `*Stripe:* ${entry.stripe}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Scenario:*\n${entry.scenario.slice(0, 2500)}`,
      },
    },
  ];

  if (entry.customerPushback) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Customer Push Back:*\n${entry.customerPushback.slice(0, 2500)}`,
      },
    });
  }

  blocks.push(
    { type: "divider" },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${patternLabel} — _${result.reasoning}_`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Draft Decision:*\n${result.recommendation}`,
      },
    },
    { type: "divider" },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "👍 Approve" },
          style: "primary",
          action_id: "cx_approve",
          value: JSON.stringify({
            pageId: entry.pageId,
            recommendation: storeAnswer(result.recommendation),
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "👎 Decline" },
          style: "danger",
          action_id: "cx_decline",
          value: JSON.stringify({
            pageId: entry.pageId,
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "✏️ Edit" },
          action_id: "cx_edit",
          value: JSON.stringify({
            pageId: entry.pageId,
            recommendation: storeAnswer(result.recommendation),
            ticket: entry.ticket,
          }),
        },
      ],
    }
  );

  await slack.chat.postMessage({
    channel: getCxReviewChannel(),
    text: `CX Legal Escalation: ${entry.ticket} — ${entry.complaintBasis.join(", ")}`,
    blocks: blocks as never[],
  });

  processedPages.add(entry.pageId);
  console.log("[cx-escalation] Posted review card for:", entry.ticket);
}

async function updateNotionDecision(pageId: string, decision: string, status: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Decision: {
        rich_text: [{ text: { content: decision.slice(0, 2000) } }],
      },
      Status: {
        status: { name: status },
      },
    },
  });
}

export async function handleCxApprove(pageId: string, recommendation: string): Promise<void> {
  await updateNotionDecision(pageId, recommendation, "CX Action Required");
  console.log("[cx-escalation] Approved and updated Notion:", pageId);
}

export async function handleCxDecline(pageId: string): Promise<void> {
  await updateNotionDecision(pageId, "", "In progress - Legal reviewing");
  console.log("[cx-escalation] Declined, set to manual review:", pageId);
}

export async function handleCxEditApproval(pageId: string, editedDecision: string): Promise<void> {
  await updateNotionDecision(pageId, editedDecision, "CX Action Required");
  console.log("[cx-escalation] Edited decision approved:", pageId);
}

export async function pollCxEscalations(): Promise<void> {
  try {
    const tickets = await fetchPendingTickets();
    if (tickets.length === 0) return;

    console.log(`[cx-escalation] Found ${tickets.length} pending ticket(s)`);

    for (const ticket of tickets) {
      try {
        await postReviewCard(ticket);
      } catch (err) {
        console.error("[cx-escalation] Failed to process ticket:", ticket.ticket, err);
      }
    }
  } catch (err) {
    console.error("[cx-escalation] Poll error:", err);
  }
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startCxEscalationPoller(intervalMs = 5 * 60 * 1000): void {
  if (!getCxDatabaseId()) {
    console.log("[cx-escalation] NOTION_CX_DATABASE_ID not set, skipping poller");
    return;
  }
  if (!getCxReviewChannel()) {
    console.log("[cx-escalation] SLACK_CX_REVIEW_CHANNEL not set, skipping poller");
    return;
  }

  console.log(`[cx-escalation] Starting poller (interval: ${intervalMs / 1000}s)`);
  pollCxEscalations();
  pollInterval = setInterval(pollCxEscalations, intervalMs);
}

export function stopCxEscalationPoller(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
