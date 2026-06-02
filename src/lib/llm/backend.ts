// Generic streaming-LLM interface. Backed by Anthropic today; Phase 9
// adds the Notion Agent Service backend without touching call sites.
// Promotion candidate: lift to packages/slackbot-utils-ts/ when a second
// slackbot needs this.

export interface LlmStream {
  // Async iterator of text deltas. May yield as little as one chunk
  // (whole answer) or many (Anthropic/Notion-agent streaming). Consumers
  // must drain the iterator before calling final().
  textStream(): AsyncIterable<string>;
  // The full committed text after the stream closes. Awaitable after the
  // iterator drains.
  final(): Promise<string>;
}

export interface LlmBackend {
  name: "anthropic" | "notion-agent";
  streamReply(args: {
    systemPrompt: string;
    userMessage: string;
    maxTokens?: number;
  }): Promise<LlmStream>;
}
