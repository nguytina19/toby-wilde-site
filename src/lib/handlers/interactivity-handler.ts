import { slack } from "@/lib/slack";
import { getAnswer, storeAnswer } from "@/lib/answer-store";
import { getAllReviewers } from "@/lib/routing";
import { generateDraftAnswer } from "@/lib/generate-answer";
import { ConfidenceLevel, ConfidenceResult } from "@/lib/confidence";
import { updateLogEntry } from "@/lib/question-log";
import { handleCxApprove, handleCxDecline, handleCxEditApproval } from "@/lib/cx-escalation-handler";
import { handleLegalIssueStatusUpdate } from "@/lib/legal-issues-handler";

// Entry point: routes a Slack `block_actions` payload (button click)
// to the right handler. Called by the Bolt Socket Mode listener.
export async function handleBlockActions(payload: {
  actions: Array<{ action_id: string; value: string; selected_option?: { value: string } }>;
  user: { id: string };
  message: { ts: string; blocks: Record<string, unknown>[]; metadata?: { event_payload?: { pageId?: string } } };
  channel: { id: string };
  trigger_id: string;
}): Promise<void> {
  const action = payload.actions[0];

  if (action.action_id === "legal_issue_status_update") {
    const newStatus = action.selected_option?.value;
    const pageId = payload.message.metadata?.event_payload?.pageId;
    if (!newStatus || !pageId) return;
    await handleLegalIssueStatusUpdate(
      pageId,
      newStatus,
      payload.user.id,
      payload.message.ts,
      payload.channel.id,
    );
    return;
  }

  if (action.action_id === "legal_issue_open_notion") return;

  const metadata = JSON.parse(action.value);
  const reviewer = payload.user.id;

  if (metadata.answerId) {
    metadata.answer = getAnswer(metadata.answerId) || "";
  }

  if (action.action_id === "cx_approve") {
    const rec = getAnswer(metadata.recommendation) || metadata.recommendation || "";
    await handleCxApprove(metadata.pageId, rec);
    await slack.chat.update({
      channel: payload.channel.id,
      ts: payload.message.ts,
      text: `✅ <@${reviewer}> approved the CX escalation decision.`,
      blocks: [],
    });
    return;
  }
  if (action.action_id === "cx_decline") {
    await handleCxDecline(metadata.pageId);
    await slack.chat.update({
      channel: payload.channel.id,
      ts: payload.message.ts,
      text: `❌ <@${reviewer}> declined the draft — ticket set to manual review.`,
      blocks: [],
    });
    return;
  }
  if (action.action_id === "cx_edit") {
    const rec = getAnswer(metadata.recommendation) || metadata.recommendation || "";
    await openCxEditModal(
      payload.trigger_id,
      metadata,
      rec,
      payload.message.ts,
      payload.channel.id,
    );
    return;
  }
  if (action.action_id === "legal_generate_draft") {
    await handleGenerateDraft(
      metadata,
      payload.message.ts,
      payload.channel.id,
      payload.message.blocks,
    );
    return;
  }
  if (action.action_id === "legal_edit") {
    await openEditModal(
      payload.trigger_id,
      metadata,
      payload.message.ts,
      payload.channel.id,
    );
    return;
  }
  if (action.action_id === "legal_reassign") {
    const blocksId = storeAnswer(JSON.stringify(payload.message.blocks));
    await openReassignModal(
      payload.trigger_id,
      metadata,
      payload.message.ts,
      payload.channel.id,
      blocksId,
    );
    return;
  }
  await handleAction(
    action.action_id,
    metadata,
    reviewer,
    payload.message.ts,
    payload.channel.id,
  );
}

// Entry point: handles a `view_submission` (modal submit).
export async function handleViewSubmission(payload: {
  view: {
    callback_id: string;
    private_metadata: string;
    state: { values: Record<string, Record<string, { value?: string; selected_option?: { value: string; text: { text: string } } }>> };
  };
  user: { id: string };
}): Promise<void> {
  const callbackId = payload.view.callback_id;
  const privateMetadata = JSON.parse(payload.view.private_metadata);
  const reviewer = payload.user.id;

  if (callbackId === "legal_edit_modal") {
    const editedAnswer = payload.view.state.values.answer_block.edited_answer.value || "";
    await handleEditedApproval(privateMetadata, editedAnswer, reviewer);
    return;
  }
  if (callbackId === "cx_edit_modal") {
    const editedDecision = payload.view.state.values.cx_decision_block.cx_edited_decision.value || "";
    await handleCxEditApproval(privateMetadata.pageId, editedDecision);
    await slack.chat.update({
      channel: privateMetadata.reviewChannel,
      ts: privateMetadata.reviewMessageTs,
      text: `✅ <@${reviewer}> edited and approved the CX escalation decision.`,
      blocks: [],
    });
    return;
  }
  if (callbackId === "legal_reassign_modal") {
    const sel = payload.view.state.values.reassign_block.reassign_select.selected_option;
    if (!sel) return;
    await handleReassign(privateMetadata, sel.value, sel.text.text, reviewer);
  }
}

async function openEditModal(
  triggerId: string,
  metadata: { channel: string; ts: string; user: string; answer: string; question?: string; logId?: string },
  reviewMessageTs: string,
  reviewChannel: string
) {
  await slack.views.open({
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: "legal_edit_modal",
      title: { type: "plain_text", text: "Edit & Approve" },
      submit: { type: "plain_text", text: "👍 Approve" },
      close: { type: "plain_text", text: "Cancel" },
      private_metadata: JSON.stringify({
        channel: metadata.channel,
        ts: metadata.ts,
        user: metadata.user,
        logId: metadata.logId,
        reviewMessageTs,
        reviewChannel,
      }),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Question from <@${metadata.user}>:*\n> ${metadata.question || "(see review channel)"}`,
          },
        },
        { type: "divider" },
        {
          type: "input",
          block_id: "answer_block",
          label: { type: "plain_text", text: "Draft Answer (edit below)" },
          element: {
            type: "plain_text_input",
            action_id: "edited_answer",
            multiline: true,
            initial_value: metadata.answer,
          },
        },
      ],
    },
  });
}

async function openCxEditModal(
  triggerId: string,
  metadata: { pageId: string; ticket?: string },
  recommendation: string,
  reviewMessageTs: string,
  reviewChannel: string
) {
  await slack.views.open({
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: "cx_edit_modal",
      title: { type: "plain_text", text: "Edit CX Decision" },
      submit: { type: "plain_text", text: "👍 Approve" },
      close: { type: "plain_text", text: "Cancel" },
      private_metadata: JSON.stringify({
        pageId: metadata.pageId,
        reviewMessageTs,
        reviewChannel,
      }),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Ticket:* ${metadata.ticket || "(see review channel)"}`,
          },
        },
        { type: "divider" },
        {
          type: "input",
          block_id: "cx_decision_block",
          label: { type: "plain_text", text: "Decision (edit below)" },
          element: {
            type: "plain_text_input",
            action_id: "cx_edited_decision",
            multiline: true,
            initial_value: recommendation,
          },
        },
      ],
    },
  });
}

async function openReassignModal(
  triggerId: string,
  metadata: { channel: string; ts: string; user: string; question?: string },
  reviewMessageTs: string,
  reviewChannel: string,
  blocksId: string
) {
  const reviewers = await getAllReviewers();

  const options = reviewers.map((r) => {
    const option: { text: { type: "plain_text"; text: string }; value: string; description?: { type: "plain_text"; text: string } } = {
      text: { type: "plain_text", text: r.name },
      value: r.slackId,
    };
    if (r.expertise) {
      option.description = { type: "plain_text", text: r.expertise.slice(0, 75) };
    }
    return option;
  });

  await slack.views.open({
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: "legal_reassign_modal",
      title: { type: "plain_text", text: "Reassign Question" },
      submit: { type: "plain_text", text: "Reassign" },
      close: { type: "plain_text", text: "Cancel" },
      private_metadata: JSON.stringify({
        channel: metadata.channel,
        ts: metadata.ts,
        user: metadata.user,
        question: metadata.question,
        reviewMessageTs,
        reviewChannel,
        blocksId,
      }),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Question from <@${metadata.user}>:*\n${metadata.question || "(see review channel)"}`,
          },
        },
        { type: "divider" },
        {
          type: "input",
          block_id: "reassign_block",
          label: { type: "plain_text", text: "Reassign to" },
          element: {
            type: "static_select",
            action_id: "reassign_select",
            placeholder: { type: "plain_text", text: "Select a team member" },
            options,
          },
        },
      ],
    },
  });
}

async function handleReassign(
  metadata: {
    channel: string;
    ts: string;
    user: string;
    question?: string;
    reviewMessageTs: string;
    reviewChannel: string;
    blocksId: string;
  },
  newReviewerSlackId: string,
  newReviewerName: string,
  reassignedBy: string
) {
  const storedBlocks = getAnswer(metadata.blocksId);
  if (!storedBlocks) {
    console.error("[handleReassign] Could not retrieve stored blocks");
    return;
  }

  const existingBlocks = JSON.parse(storedBlocks) as Record<string, unknown>[];
  const assigneePattern = /\*Assigned to:\*\s*.+/;

  const updatedBlocks = existingBlocks.map((block) => {
    const b = block as { type: string; text?: { type: string; text: string } };
    if (
      b.type === "section" &&
      b.text?.text &&
      assigneePattern.test(b.text.text)
    ) {
      return {
        ...block,
        text: {
          ...b.text,
          text: b.text.text.replace(assigneePattern, `*Assigned to:* *${newReviewerName}*`),
        },
      };
    }
    return block;
  });

  await slack.chat.update({
    channel: metadata.reviewChannel,
    ts: metadata.reviewMessageTs,
    text: `Question from <@${metadata.user}> — assigned to *${newReviewerName}*`,
    blocks: updatedBlocks as never[],
  });
}

async function handleEditedApproval(
  metadata: {
    channel: string;
    ts: string;
    user: string;
    logId?: string;
    reviewMessageTs: string;
    reviewChannel: string;
  },
  editedAnswer: string,
  reviewerId: string
) {
  await slack.chat.postMessage({
    channel: metadata.channel,
    thread_ts: metadata.ts,
    text: `${editedAnswer}\n\n— _Reviewed by <@${reviewerId}>_ ✅`,
  });

  await slack.chat.update({
    channel: metadata.reviewChannel,
    ts: metadata.reviewMessageTs,
    text: `✅ <@${reviewerId}> edited and approved the answer for <@${metadata.user}>'s question.`,
    blocks: [],
  });

  if (metadata.logId) {
    updateLogEntry(metadata.logId, {
      status: "Edited",
      finalAnswer: editedAnswer,
    }).catch(console.error);
  }
}

async function handleAction(
  actionId: string,
  metadata: { channel: string; ts: string; user: string; answer?: string; logId?: string },
  reviewerId: string,
  reviewMessageTs: string,
  reviewChannel: string
) {
  const approved = actionId === "legal_approve";

  if (approved && metadata.answer) {
    await slack.chat.postMessage({
      channel: metadata.channel,
      thread_ts: metadata.ts,
      text: `${metadata.answer}\n\n— _Reviewed by <@${reviewerId}>_ ✅`,
    });
  } else if (!approved) {
    await slack.chat.postMessage({
      channel: metadata.channel,
      thread_ts: metadata.ts,
      text: `This question has been reviewed. Please reach out to the legal team directly for further assistance.`,
    });
  } else {
    await slack.chat.postMessage({
      channel: metadata.channel,
      thread_ts: metadata.ts,
      text: `Unable to retrieve the draft answer. Please try again or use Edit & Approve.`,
    });
  }

  await slack.chat.update({
    channel: reviewChannel,
    ts: reviewMessageTs,
    text: approved
      ? `✅ <@${reviewerId}> approved the answer for <@${metadata.user}>'s question.`
      : `❌ <@${reviewerId}> declined <@${metadata.user}>'s question.`,
    blocks: [],
  });

  if (metadata.logId) {
    updateLogEntry(metadata.logId, {
      status: approved ? "Approved" : "Declined",
      finalAnswer: approved ? metadata.answer : undefined,
    }).catch(console.error);
  }
}

const confidenceIndicators: Record<ConfidenceLevel, { emoji: string; label: string }> = {
  high: { emoji: "🟢", label: "High Confidence" },
  medium: { emoji: "🟡", label: "Medium Confidence" },
  low: { emoji: "🔴", label: "Low Confidence" },
};

function confidenceBadge(confidence: ConfidenceResult): string {
  const { emoji, label } = confidenceIndicators[confidence.level];
  return `${emoji} *${label}* — _${confidence.reason}_`;
}

async function handleGenerateDraft(
  metadata: { channel: string; ts: string; user: string; question: string },
  reviewMessageTs: string,
  reviewChannel: string,
  existingBlocks: Record<string, unknown>[]
) {
  const threadResult = await slack.conversations.replies({
    channel: metadata.channel,
    ts: metadata.ts,
    limit: 50,
  });

  let threadHistory: string | undefined;
  if (threadResult.messages && threadResult.messages.length > 1) {
    threadHistory = threadResult.messages
      .map((msg) => {
        const who = msg.bot_id ? "Legal Bot" : `<@${msg.user}>`;
        return `${who}: ${msg.text}`;
      })
      .join("\n\n");
  }

  const { answer, confidence } = await generateDraftAnswer(
    metadata.question,
    threadHistory
  );

  const keepBlocks = existingBlocks.filter(
    (b) => (b as { type: string }).type !== "actions"
  );

  const updatedBlocks = [
    ...keepBlocks,
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: confidenceBadge(confidence) },
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
            channel: metadata.channel,
            ts: metadata.ts,
            user: metadata.user,
            answerId: storeAnswer(answer),
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "👎 Decline" },
          style: "danger",
          action_id: "legal_deny",
          value: JSON.stringify({
            channel: metadata.channel,
            ts: metadata.ts,
            user: metadata.user,
          }),
        },
        {
          type: "button",
          text: { type: "plain_text", text: "✏️ Edit" },
          action_id: "legal_edit",
          value: JSON.stringify({
            channel: metadata.channel,
            ts: metadata.ts,
            user: metadata.user,
            answerId: storeAnswer(answer),
            question: metadata.question,
          }),
        },
      ],
    },
  ];

  await slack.chat.update({
    channel: reviewChannel,
    ts: reviewMessageTs,
    text: `Draft generated for <@${metadata.user}>'s follow-up`,
    blocks: updatedBlocks as never[],
  });
}
