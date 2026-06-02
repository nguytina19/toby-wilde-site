import { slack, getReviewChannel, getDmRecipient, openDmChannel } from "./slack";
import { detectNotionLinks, DocLink } from "./doc-links";
import { fetchNotionPage } from "./doc-fetcher";
import { getPlaybookContent } from "./playbook";
import { analyzeDocument, DocReviewResult, RiskLevel } from "./doc-review";
import { createReviewReport } from "./review-report";
import { findReviewer } from "./routing";

const processedMessages = new Set<string>();

export async function handleDocReview(event: {
  text: string;
  user: string;
  channel: string;
  ts: string;
}) {
  if (processedMessages.has(event.ts)) return;
  processedMessages.add(event.ts);
  setTimeout(() => processedMessages.delete(event.ts), 5 * 60 * 1000);

  const links = detectNotionLinks(event.text);
  if (links.length === 0) return;

  await slack.chat.postMessage({
    channel: event.channel,
    thread_ts: event.ts,
    text: `📄 Detected ${links.length} document link${links.length > 1 ? "s" : ""}. Starting legal review screening...`,
  });

  for (const link of links) {
    try {
      await processDocument(link, event);
    } catch (err) {
      console.error(`[doc-review] Failed to process ${link.pageId}:`, err);
      await slack.chat.postMessage({
        channel: event.channel,
        thread_ts: event.ts,
        text: `⚠️ Could not review <${link.url}|document> — make sure it's shared with the Notion integration.`,
      });
    }
  }
}

async function processDocument(
  link: DocLink,
  event: { text: string; user: string; channel: string; ts: string }
) {
  const [doc, playbook] = await Promise.all([
    fetchNotionPage(link.pageId),
    getPlaybookContent(),
  ]);

  const review = await analyzeDocument(doc.content, doc.title, playbook);
  const { name: assignee } = await findReviewer(doc.title + " " + review.summary);

  const threadLink = `https://notion.enterprise.slack.com/archives/${event.channel}/p${event.ts.replace(".", "")}`;

  let reportUrl = "";
  let reportPageId = "";
  try {
    const report = await createReviewReport({
      docTitle: doc.title,
      docUrl: doc.url || link.url,
      docType: review.documentType,
      review,
      slackLink: threadLink,
      requester: event.user,
      assignedTo: assignee,
    });
    reportUrl = report.url;
    reportPageId = report.pageId;
  } catch (err) {
    console.error("[doc-review] Failed to create Notion report:", err);
  }

  const blocks = buildSlackBlocks(doc.title, review, assignee, event, link, threadLink, reportUrl);

  await slack.chat.postMessage({
    channel: getReviewChannel(),
    text: `Document review: "${doc.title}" — assigned to *${assignee}*`,
    blocks: blocks as never[],
  });

  const dmUser = getDmRecipient();
  if (dmUser) {
    openDmChannel(dmUser)
      .then((dmChannel) =>
        slack.chat.postMessage({
          channel: dmChannel,
          text: `Document review: "${doc.title}" — assigned to *${assignee}*`,
          blocks: blocks as never[],
        })
      )
      .catch(console.error);
  }

  await slack.chat.postMessage({
    channel: event.channel,
    thread_ts: event.ts,
    text: `✅ Review complete for *${doc.title}*. Assigned to *${assignee}* on the legal team.${reportUrl ? ` <${reportUrl}|View full report>` : ""}`,
  });
}

const riskEmoji: Record<RiskLevel, string> = {
  High: "🔴",
  Medium: "🟡",
  Low: "🟢",
  None: "⚪",
};

function pillarSummaryLine(review: DocReviewResult): string {
  const entries = [
    ["Privacy", review.pillars.privacy.level],
    ["Patent", review.pillars.patent.level],
    ["Subprocessor", review.pillars.subprocessor.level],
    ["Data Gov", review.pillars.dataGovernance.level],
    ["Commercial", review.pillars.commercial.level],
  ] as const;

  return entries
    .map(([name, level]) => `${riskEmoji[level]} ${name}`)
    .join("  |  ");
}

function overallRiskLevel(review: DocReviewResult): RiskLevel {
  const levels = Object.values(review.pillars).map((p) => p.level);
  if (levels.includes("High")) return "High";
  if (levels.includes("Medium")) return "Medium";
  if (levels.some((l) => l !== "None")) return "Low";
  return "None";
}

function buildSlackBlocks(
  title: string,
  review: DocReviewResult,
  assignee: string,
  event: { user: string; channel: string; ts: string },
  link: DocLink,
  threadLink: string,
  reportUrl: string
): Record<string, unknown>[] {
  const overall = overallRiskLevel(review);
  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `📄 Document Review: ${title}`.slice(0, 150) },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*From:* <@${event.user}> | *Assigned to:* *${assignee}* | *Type:* ${review.documentType}`,
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${riskEmoji[overall]} *Overall Risk: ${overall}*`,
      },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: pillarSummaryLine(review) },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Summary:*\n${review.summary}`,
      },
    },
  ];

  if (review.keyIssues.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Key Issues:*\n${review.keyIssues.map((i) => `• ${i}`).join("\n")}`,
      },
    });
  }

  blocks.push({ type: "divider" });

  const linkParts: string[] = [];
  linkParts.push(`<${link.url}|View Document>`);
  linkParts.push(`<${threadLink}|Slack Thread>`);
  if (reportUrl) linkParts.push(`<${reportUrl}|Full Report>`);

  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: linkParts.join("  |  ") }],
  });

  return blocks;
}
