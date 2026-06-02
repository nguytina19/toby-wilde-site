import { App, LogLevel } from "@slack/bolt";
import { handleMessageEvent } from "./handlers/event-handler";
import { handleBlockActions, handleViewSubmission } from "./handlers/interactivity-handler";
import { startCxEscalationPoller } from "./cx-escalation-handler";
import { startLegalIssuesPoller } from "./legal-issues-handler";

// One bot process = one Bolt App = one outbound WebSocket to Slack.
// Slack delivers events down the socket; we ACK + dispatch to the same
// business logic the HTTP webhooks used to run.
//
// `single-replica` deployment is important: with multiple replicas each
// pod gets its own socket session and every event would be processed N
// times. gen_kustomization.py keeps web at replicas: 1 for slackbots.

let app: App | null = null;

// Next.js bundles `instrumentation.ts` and App Router route handlers into
// separate server-runtime chunks. A plain `let boltReady` in this file
// gives each chunk its own copy: `startBoltApp()` (called from
// instrumentation) flips its copy to true, but `isBoltReady()` (called
// from app/api/health/route.ts) reads a different copy that stays false
// forever, and probes 503 until the startup budget burns. Hang the flag
// off globalThis so both isolates observe the same state.
declare global {
  var __legalQaBoltReady: boolean | undefined;
}

function setBoltReady(value: boolean): void {
  globalThis.__legalQaBoltReady = value;
}

// True once Bolt's socket session is open and dispatching events. Read by
// /api/health so kubelet probes reflect actual readiness, not just "the
// HTTP server bound to port 80."
export function isBoltReady(): boolean {
  return globalThis.__legalQaBoltReady === true;
}

function createApp(): App {
  return new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    logLevel: LogLevel.INFO,
  });
}

export async function startBoltApp(): Promise<void> {
  if (app) return;

  if (!process.env.SLACK_APP_TOKEN) {
    console.error("[bolt] SLACK_APP_TOKEN is not set; skipping Bolt startup");
    return;
  }

  app = createApp();

  app.message(async ({ event }) => {
    try {
      await handleMessageEvent(event as unknown as Parameters<typeof handleMessageEvent>[0]);
    } catch (err) {
      console.error("[bolt] message handler error:", err);
    }
  });

  // One listener per action_id keeps Bolt's typed dispatch happy while the
  // shared handleBlockActions routes by action_id internally.
  const actionIds = [
    "legal_approve",
    "legal_deny",
    "legal_edit",
    "legal_reassign",
    "legal_generate_draft",
    "cx_approve",
    "cx_decline",
    "cx_edit",
    "legal_issue_status_update",
    "legal_issue_open_notion",
  ] as const;

  for (const id of actionIds) {
    app.action(id, async ({ ack, body }) => {
      await ack();
      try {
        await handleBlockActions(body as unknown as Parameters<typeof handleBlockActions>[0]);
      } catch (err) {
        console.error(`[bolt] action ${id} error:`, err);
      }
    });
  }

  for (const id of ["legal_edit_modal", "legal_reassign_modal", "cx_edit_modal"] as const) {
    app.view(id, async ({ ack, body }) => {
      await ack();
      try {
        await handleViewSubmission(body as unknown as Parameters<typeof handleViewSubmission>[0]);
      } catch (err) {
        console.error(`[bolt] view ${id} error:`, err);
      }
    });
  }

  await app.start();
  setBoltReady(true);
  console.log("[bolt] Slack Socket Mode listener started");

  startCxEscalationPoller();
  startLegalIssuesPoller();
}
