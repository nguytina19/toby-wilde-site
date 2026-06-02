import { slack } from "./slack";
import type { LlmBackend } from "./llm";

// Slack rate-limits chat.update at ~10/min/channel. 1.5s debounce gives
// us ~40/min in the worst case so we batch updates and lean on
// rate-limit error handling as a final guard.
const UPDATE_DEBOUNCE_MS = 1500;
const THINKING_TEXT = "🤔 Thinking…";

interface StreamReplyArgs {
  channel: string;
  thread_ts?: string;
  backend: LlmBackend;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  // Decorates the live buffer before each chat.update. Lets callers
  // prefix/suffix the streamed text (e.g. "*Draft Answer:*\n<text>").
  formatPartial?: (partial: string) => string;
  // Decorates the final committed text on the last chat.update.
  formatFinal?: (final: string) => string;
}

interface StreamReplyResult {
  ts: string;
  text: string;
}

// Posts "🤔 Thinking…" to a channel/thread, debounces chat.update as the
// LLM streams output, then writes the final answer with formatFinal.
// Returns the message ts so callers can keep operating on it.
export async function streamReplyToSlack(args: StreamReplyArgs): Promise<StreamReplyResult> {
  const formatPartial = args.formatPartial ?? ((p) => p);
  const formatFinal = args.formatFinal ?? ((f) => f);

  const initial = await slack.chat.postMessage({
    channel: args.channel,
    thread_ts: args.thread_ts,
    text: THINKING_TEXT,
  });
  const ts = initial.ts;
  if (!ts) throw new Error("chat.postMessage returned no ts");

  const stream = await args.backend.streamReply({
    systemPrompt: args.systemPrompt,
    userMessage: args.userMessage,
    maxTokens: args.maxTokens,
  });

  let buffer = "";
  let lastFlushAt = 0;
  let inflight: Promise<void> | null = null;

  const flush = async (text: string) => {
    try {
      await slack.chat.update({ channel: args.channel, ts, text });
    } catch (err) {
      // Rate-limit hits are recoverable: drop the intermediate update,
      // the final flush will overwrite anyway. Anything else is logged
      // but doesn't tank the stream.
      const code = (err as { data?: { error?: string } })?.data?.error;
      if (code === "ratelimited") return;
      console.error("[streaming-reply] chat.update failed:", err);
    }
  };

  for await (const delta of stream.textStream()) {
    buffer += delta;
    const now = Date.now();
    if (now - lastFlushAt >= UPDATE_DEBOUNCE_MS && !inflight) {
      lastFlushAt = now;
      inflight = flush(formatPartial(buffer)).finally(() => {
        inflight = null;
      });
    }
  }

  // Drain any in-flight intermediate update before the final write.
  if (inflight) await inflight;

  const finalText = await stream.final();
  const text = formatFinal(finalText || buffer);
  await flush(text);
  return { ts, text };
}
