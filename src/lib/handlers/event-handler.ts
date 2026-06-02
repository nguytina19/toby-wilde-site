import { slack, getQuestionChannel, getReviewChannel, getDocReviewChannels, getRadarChannels } from "@/lib/slack";
import { generateDraftAnswer } from "@/lib/generate-answer";
import { findReviewer } from "@/lib/routing";
import { storeAnswer } from "@/lib/answer-store";
import { ConfidenceLevel, ConfidenceResult } from "@/lib/confidence";
import { logQuestion, storeLogId, getLogId, updateLogEntry } from "@/lib/question-log";
import { handleDocReview } from "@/lib/doc-review-handler";
import { handleRadarScan } from "@/lib/radar-handler";
import { detectNotionLinks } from "@/lib/doc-links";
import { resolveNotionUserId } from "@/lib/user-mapping";

export interface SlackMessageEvent {
  type?: string;
  subtype?: string;
  bot_id?: string;
  channel: string;
  user: string;
  ts: string;
  text?: string;
  thread_ts?: string;
}

// Entry point: routes a Slack `message` event to either the question
// flow or the doc-review flow based on channel. Called by the Bolt
// Socket Mode listener in src/lib/bolt-app.ts.
export async function handleMessageEvent(event: SlackMessageEvent): Promise<void> {
  if (event.type !== "message" || event.subtype || event.bot_id) return;

  if (event.channel === getQuestionChannel()) {
    await handleMessage({
      text: event.text || "",
      user: event.user,
      channel: event.channel,
      ts: event.ts,
      thread_ts: event.thread_ts,
    });
    return;
  }

  if (
    getDocReviewChannels().includes(event.channel) &&
    detectNotionLinks(event.text || "").length > 0
  ) {
    await handleDocReview({
      text: event.text || "",
      user: event.user,
      channel: event.channel,
      ts: event.ts,
    });
    return;
  }

  if (
    getRadarChannels().includes(event.channel) &&
    detectNotionLinks(event.text || "").length > 0
  ) {
    await handleRadarScan({
      text: event.text || "",
      user: event.user,
      channel: event.channel,
      ts: event.ts,
    });
  }
}

interface ThreadInfo {
  fullHistory: string;
  originalQuestion: string;
  messageCount: number;
}

async function getThreadInfo(channel: string, threadTs: string): Promise<ThreadInfo> {
  const result = await slack.conversations.replies({
    channel,
    ts: threadTs,
    limit: 50,
  });

  if (!result.messages || result.messages.length <= 1) {
    return { fullHistory: "", originalQuestion: "", messageCount: 0 };
  }

  const originalQuestion = result.messages[0].text || "";
  const messageCount = result.messages.length - 1; // exclude the new follow-up

  const history = result.messages.map((msg) => {
    const who = msg.bot_id ? "Legal Bot" : `<@${msg.user}>`;
    return `${who}: ${msg.text}`;
  });

  return {
    fullHistory: history.join("\n\n"),
    originalQuestion,
    messageCount,
  };
}

const confidenceIndicators: Record<ConfidenceLevel, { emoji: string; label: string }> = {
  high: { emoji: "🟢", label: "High Confidence" },
  medium: { emoji: "🟡", label: "Medium Confidence" },
  low: { emoji: "🔴", label: "Low Confidence" },
};

const CHANGE_REQUEST_SIGNALS = [
  "redline", "redlines", "redlining",
  "non-standard", "nonstandard",
  "change clause", "modify clause", "edit clause", "amend clause",
  "nda change", "nda edit", "nda redline", "modify nda", "edit nda",
  "addendum", "supplemental undertaking",
  "order form edit", "order form change", "of edit",
  "carry over", "prior terms", "prior agreement", "existing msa",
  "customer paper", "customer template", "customer form", "customer contract",
  "special terms", "negotiated terms", "old exceptions",
  "msa change", "msa edit", "msa redline", "modify msa",
  "dpa change", "dpa edit",
];

function isChangeRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return CHANGE_REQUEST_SIGNALS.some((signal) => lower.includes(signal));
}

const SFDC_LINK_RE = /https?:\/\/[^\s>|]*(?:salesforce\.com|force\.com|my\.salesforce)[^\s>|]*/i;

function detectSfdcLink(text: string): string | null {
  const cleaned = text.replace(/<(https?:\/\/[^|>]+)(?:\|[^>]*)?>/g, "$1");
  const match = cleaned.match(SFDC_LINK_RE);
  return match ? match[0] : null;
}

function confidenceBadge(confidence: ConfidenceResult): string {
  const { emoji, label } = confidenceIndicators[confidence.level];
  return `${emoji} *${label}* — _${confidence.reason}_`;
}

const processedEvents = new Set<string>();

const reviewMessageStore = new Map<string, { channel: string; ts: string; blocks: Record<string, unknown>[] }>();

function storeReviewMessage(threadTs: string, channel: string, ts: string, blocks: Record<string, unknown>[]) {
  reviewMessageStore.set(threadTs, { channel, ts, blocks });
  setTimeout(() => reviewMessageStore.delete(threadTs), 24 * 60 * 60 * 1000);
}

async function handleMessage(event: {
  text: string;
  user: string;
  channel: string;
  ts: string;
  thread_ts?: string;
}) {
  if (processedEvents.has(event.ts)) return;
  processedEvents.add(event.ts);
  setTimeout(() => processedEvents.delete(event.ts), 5 * 60 * 1000);

  const isFollowUp = !!event.thread_ts;
  const threadTs = event.thread_ts || event.ts;

  if (isFollowUp) {
    const sfdcLink = detectSfdcLink(event.text);
    if (sfdcLink) {
      await handleSfdcReply(event, threadTs, sfdcLink);
    } else {
      await handleFollowUp(event, threadTs);
    }
  } else {
    await handleNewQuestion(event, threadTs);
  }
}

async function handleSfdcReply(
  event: { text: string; user: string; channel: string; ts: string },
  threadTs: string,
  sfdcLink: string
) {
  await slack.chat.postMessage({
    channel: event.channel,
    thread_ts: threadTs,
    text: `✅ Thanks! SFDC link has been attached to this request.`,
  });

  const stored = reviewMessageStore.get(threadTs);
  if (stored) {
    const sfdcBlock: Record<string, unknown> = {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `📎 *SFDC:* <${sfdcLink}|View in Salesforce>` },
      ],
    };

    const dividerIdx = stored.blocks.findIndex(
      (b, i) => (b as { type: string }).type === "divider" && i > 0
    );
    const updatedBlocks = [...stored.blocks];
    updatedBlocks.splice(dividerIdx + 1, 0, sfdcBlock);

    await slack.chat.update({
      channel: stored.channel,
      ts: stored.ts,
      text: `New legal question from <@${event.user}>`,
      blocks: updatedBlocks as never[],
    });

    stored.blocks = updatedBlocks;
  }

  const logId = getLogId(threadTs);
  if (logId) {
    updateLogEntry(logId, { sfdcLink }).catch(console.error);
  }
}

async function findThreadAssignee(channel: string, threadTs: string): Promise<{ name: string; slackId: string } | null> {
  const result = await slack.conversations.replies({
    channel,
    ts: threadTs,
    limit: 50,
  });

  if (!result.messages) return null;

  // Bot messages use <@SLACKID> mentions — extract the last one
  const mentionPattern = /<@(U[A-Z0-9]+)>/;
  const assignKeywords = /assigned to|has been notified|reassigned to/;

  let latestSlackId: string | null = null;

  for (const msg of result.messages) {
    if (!msg.bot_id) continue;
    const text = msg.text || "";
    if (!assignKeywords.test(text)) continue;
    const match = text.match(mentionPattern);
    if (match) {
      latestSlackId = match[1];
    }
  }

  if (!latestSlackId) return null;
  return { name: latestSlackId, slackId: latestSlackId };
}

async function reviewerHasEngaged(channel: string, threadTs: string, askerId: string): Promise<boolean> {
  const result = await slack.conversations.replies({
    channel,
    ts: threadTs,
    limit: 50,
  });

  if (!result.messages) return false;

  return result.messages.some(
    (msg) => !msg.bot_id && msg.user !== askerId && msg.ts !== threadTs
  );
}

async function handleFollowUp(
  event: { text: string; user: string; channel: string; ts: string },
  threadTs: string
) {
  const engaged = await reviewerHasEngaged(event.channel, threadTs, event.user);
  if (engaged) return;

  const threadInfo = await getThreadInfo(event.channel, threadTs);
  const existing = await findThreadAssignee(event.channel, threadTs);
  const reviewer = existing || await findReviewer(event.text);
  const assignee = reviewer.name;
  const threadLink = `https://notion.enterprise.slack.com/archives/${event.channel}/p${threadTs.replace(".", "")}`;

  await slack.chat.postMessage({
    channel: event.channel,
    thread_ts: threadTs,
    text: `⏳ Follow-up noted! A draft response will be posted here shortly.`,
  });

  const { answer, confidence } = await generateDraftAnswer(event.text, threadInfo.fullHistory);

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "Follow-up Question" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*From:* <@${event.user}> | *Assigned to:* *${assignee}*`,
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "🔀 Reassign" },
        action_id: "legal_reassign",
        value: JSON.stringify({
          channel: event.channel,
          ts: threadTs,
          user: event.user,
          question: event.text,
        }),
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Original: "${threadInfo.originalQuestion.replace(/\n/g, " ").slice(0, 150)}" · _${threadInfo.messageCount} prior messages_`,
        },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Follow-up:* <${threadLink}|${event.text.replace(/\n/g, " ")}>`,
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: confidenceBadge(confidence),
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Draft Answer:*\n${answer}`,
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
          action_id: "legal_approve",
          value: JSON.stringify({
            channel: event.channel,
            ts: threadTs,
            user: event.user,
            answerId: storeAnswer(answer),
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "👎 Decline" },
          style: "danger",
          action_id: "legal_deny",
          value: JSON.stringify({
            channel: event.channel,
            ts: threadTs,
            user: event.user,
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "✏️ Edit" },
          action_id: "legal_edit",
          value: JSON.stringify({
            channel: event.channel,
            ts: threadTs,
            user: event.user,
            answerId: storeAnswer(answer),
            question: event.text,
          }),
        },
      ],
    },
  ];

  await slack.chat.postMessage({
    channel: getReviewChannel(),
    text: `Follow-up from <@${event.user}> — assigned to *${assignee}*`,
    blocks: blocks as never[],
  });

}

async function handleNewQuestion(
  event: { text: string; user: string; channel: string; ts: string },
  threadTs: string
) {
  const { name: assignee, slackId: assigneeSlackId } = await findReviewer(event.text);
  const changeRequest = isChangeRequest(event.text);

  let ack = `⏳ Thanks for your question! This has been assigned to the legal team. A response will be posted here shortly.`;
  if (changeRequest) {
    ack += `\n\nIf you haven't already, can you share the *SFDC account link*? This helps Legal quickly assess deal context and route your request.`;
  }

  await slack.chat.postMessage({
    channel: event.channel,
    thread_ts: threadTs,
    text: ack,
  });

  const { answer, confidence } = await generateDraftAnswer(event.text);

  const threadLink = `https://notion.enterprise.slack.com/archives/${event.channel}/p${threadTs.replace(".", "")}`;

  let logId = "";
  try {
    const askedByNotionId = await resolveNotionUserId(event.user).catch(() => null);
    logId = await logQuestion({
      question: event.text,
      draftAnswer: answer,
      confidence: confidence.level,
      status: "Pending",
      assignedTo: assignee,
      askedByNotionId: askedByNotionId || undefined,
      slackLink: threadLink,
      date: new Date().toISOString().split("T")[0],
    });
    storeLogId(threadTs, logId);
  } catch (err) {
    console.error("[logQuestion] Failed to log to Notion:", err);
  }
  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "New Legal Question" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*From:* <@${event.user}> | *Assigned to:* *${assignee}*`,
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "🔀 Reassign" },
        action_id: "legal_reassign",
        value: JSON.stringify({
          channel: event.channel,
          ts: threadTs,
          user: event.user,
          answerId: storeAnswer(answer),
          question: event.text,
        }),
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Question:* <${threadLink}|${event.text.replace(/\n/g, " ")}>`,
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: confidenceBadge(confidence),
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Draft Answer:*\n${answer}`,
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
          action_id: "legal_approve",
          value: JSON.stringify({
            channel: event.channel,
            ts: threadTs,
            user: event.user,
            answerId: storeAnswer(answer),
            logId,
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "👎 Decline" },
          style: "danger",
          action_id: "legal_deny",
          value: JSON.stringify({
            channel: event.channel,
            ts: threadTs,
            user: event.user,
            logId,
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "✏️ Edit" },
          action_id: "legal_edit",
          value: JSON.stringify({
            channel: event.channel,
            ts: threadTs,
            user: event.user,
            answerId: storeAnswer(answer),
            question: event.text,
            logId,
          }),
        },
      ],
    },
  ];

  const reviewMsg = await slack.chat.postMessage({
    channel: getReviewChannel(),
    text: `New legal question from <@${event.user}> — assigned to *${assignee}*`,
    blocks: blocks as never[],
  });

  if (reviewMsg.ts) {
    storeReviewMessage(threadTs, getReviewChannel(), reviewMsg.ts, blocks);
  }
}
