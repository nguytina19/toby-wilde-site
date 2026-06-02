import Anthropic from "@anthropic-ai/sdk";
import type { LlmBackend, LlmStream } from "./backend";

const anthropic = new Anthropic();

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 512;

export const anthropicBackend: LlmBackend = {
  name: "anthropic",
  async streamReply({ systemPrompt, userMessage, maxTokens }) {
    const stream = anthropic.messages.stream({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    return {
      async *textStream() {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            yield event.delta.text;
          }
        }
      },
      async final() {
        return stream.finalText();
      },
    };
  },
};
