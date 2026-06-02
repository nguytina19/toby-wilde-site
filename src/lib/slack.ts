import { WebClient } from "@slack/web-api";
import { createHmac, timingSafeEqual } from "crypto";

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export function getQuestionChannel(): string {
  return process.env.SLACK_QUESTION_CHANNEL!;
}

export function getReviewChannel(): string {
  return process.env.SLACK_REVIEW_CHANNEL!;
}

export function getDmRecipient(): string | undefined {
  return process.env.SLACK_DM_USER;
}

export function getDocReviewChannels(): string[] {
  const raw = process.env.SLACK_DOC_REVIEW_CHANNELS;
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function getRadarChannels(): string[] {
  const raw = process.env.SLACK_RADAR_CHANNELS;
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function getCxReviewChannel(): string {
  return process.env.SLACK_CX_REVIEW_CHANNEL!;
}

export function getLegalIssuesChannel(): string {
  return process.env.SLACK_LEGAL_ISSUES_CHANNEL!;
}

let dmChannelCache: string | null = null;

export async function openDmChannel(userId: string): Promise<string> {
  if (dmChannelCache) return dmChannelCache;
  const result = await slack.conversations.open({ users: userId });
  dmChannelCache = result.channel!.id!;
  return dmChannelCache;
}

export function isSlackRetry(headers: { get(name: string): string | null }): boolean {
  return headers.get("x-slack-retry-num") !== null;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; status: 400 | 401; reason: string };

export function verifySlackRequest(args: {
  body: string;
  timestamp: string | null;
  signature: string | null;
  signingSecret: string;
}): VerifyResult {
  const { body, timestamp, signature, signingSecret } = args;

  if (!timestamp || !signature) {
    return { ok: false, status: 400, reason: "missing_headers" };
  }

  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) {
    return { ok: false, status: 400, reason: "bad_timestamp" };
  }

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (ts < fiveMinutesAgo) {
    return { ok: false, status: 401, reason: "stale_timestamp" };
  }

  const expected =
    "v0=" +
    createHmac("sha256", signingSecret).update(`v0:${timestamp}:${body}`).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) {
    return { ok: false, status: 401, reason: "bad_signature" };
  }

  return timingSafeEqual(expectedBuf, actualBuf)
    ? { ok: true }
    : { ok: false, status: 401, reason: "bad_signature" };
}
