import type { LlmBackend } from "./backend";
import { anthropicBackend } from "./anthropic-backend";
import { notionAgentBackend } from "./notion-agent-backend";

export type { LlmBackend, LlmStream } from "./backend";

// Resolved at process start. Pods don't change backends at runtime;
// flipping LLM_BACKEND requires a redeploy.
let cached: LlmBackend | null = null;

export function getLlmBackend(): LlmBackend {
  if (cached) return cached;
  const choice = (process.env.LLM_BACKEND ?? "anthropic").trim();
  switch (choice) {
    case "anthropic":
      cached = anthropicBackend;
      break;
    case "notion-agent":
      cached = notionAgentBackend;
      break;
    default:
      console.error(`[llm] unknown LLM_BACKEND=${choice}; falling back to anthropic`);
      cached = anthropicBackend;
  }
  return cached;
}
