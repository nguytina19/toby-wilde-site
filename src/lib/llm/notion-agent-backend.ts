import type { LlmBackend, LlmStream } from "./backend";

// Client for the internal Notion Agent Service. Mirrors the REST + SSE
// shape documented in notion-next/src/agent-service/specs/api/. Auth is
// network-boundary (no headers) per spec; reachability from EKS is the
// open question that gates flipping LLM_BACKEND to notion-agent.
//
// Env vars (all required when LLM_BACKEND=notion-agent):
//   NOTION_AGENT_BASE_URL        - e.g. https://agent-service.internal/
//   NOTION_AGENT_WORKSPACE_ID    - workspace TypeID
//   NOTION_AGENT_PROJECT_ID      - project TypeID
//   NOTION_AGENT_LEGAL_QA_ID     - agent TypeID provisioned via POST /api/v1/agents

interface AgentConfig {
  baseUrl: string;
  workspaceId: string;
  projectId: string;
  agentId: string;
}

function readConfig(): AgentConfig {
  const baseUrl = process.env.NOTION_AGENT_BASE_URL?.trim();
  const workspaceId = process.env.NOTION_AGENT_WORKSPACE_ID?.trim();
  const projectId = process.env.NOTION_AGENT_PROJECT_ID?.trim();
  const agentId = process.env.NOTION_AGENT_LEGAL_QA_ID?.trim();
  if (!baseUrl || !workspaceId || !projectId || !agentId) {
    throw new Error(
      "notion-agent backend requires NOTION_AGENT_BASE_URL, NOTION_AGENT_WORKSPACE_ID, NOTION_AGENT_PROJECT_ID, NOTION_AGENT_LEGAL_QA_ID",
    );
  }
  return { baseUrl, workspaceId, projectId, agentId };
}

interface CreateSessionResponse {
  id: string;
}

async function createSession(
  cfg: AgentConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  // The agent itself carries the system prompt server-side (per spec,
  // agents are provisioned with a `system` field via POST /api/v1/agents).
  // We forward the user message as the initial event content. The
  // systemPrompt parameter is intentionally unused here — kept on the
  // interface so the Anthropic backend can use it inline.
  void systemPrompt;
  const url = new URL("/api/v1/sessions", cfg.baseUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      workspace_id: cfg.workspaceId,
      project_id: cfg.projectId,
      agent: cfg.agentId,
      initial_message: {
        content: [{ type: "text", text: userMessage }],
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`notion-agent createSession ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as CreateSessionResponse;
  return body.id;
}

// Minimal SSE parser. The agent-service emits `event: event\ndata: <json>\n\n`
// frames with periodic `:` keepalive comments. We yield the parsed
// StreamItem JSON for each `event` frame and drop everything else.
async function* sseFrames(body: ReadableStream<Uint8Array>): AsyncIterable<unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = pending.indexOf("\n\n")) !== -1) {
      const frame = pending.slice(0, idx);
      pending = pending.slice(idx + 2);
      const dataLines = frame
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart());
      if (dataLines.length === 0) continue;
      try {
        yield JSON.parse(dataLines.join("\n"));
      } catch {
        // skip malformed frames
      }
    }
  }
}

// Provisional `agent.message` items are cumulative snapshots keyed by
// logical_key. We track the longest snapshot seen so far and yield
// only the new tail as a delta — the consumer wants Anthropic-style
// incremental text.
function isAgentMessageSnapshot(
  item: unknown,
): item is { type: "agent.message"; logical_key: string; text: string } {
  if (typeof item !== "object" || item === null) return false;
  const r = item as Record<string, unknown>;
  return (
    r.type === "agent.message" &&
    typeof r.logical_key === "string" &&
    typeof r.text === "string"
  );
}

async function openStream(cfg: AgentConfig, sessionId: string): Promise<ReadableStream<Uint8Array>> {
  const url = new URL(`/api/v1/sessions/${sessionId}/events/stream`, cfg.baseUrl);
  url.searchParams.set("workspace_id", cfg.workspaceId);
  url.searchParams.set("project_id", cfg.projectId);
  const res = await fetch(url, { headers: { accept: "text/event-stream" } });
  if (!res.ok || !res.body) {
    throw new Error(`notion-agent openStream ${res.status}: ${await res.text()}`);
  }
  return res.body;
}

export const notionAgentBackend: LlmBackend = {
  name: "notion-agent",
  async streamReply({ systemPrompt, userMessage }) {
    const cfg = readConfig();
    const sessionId = await createSession(cfg, systemPrompt, userMessage);
    const body = await openStream(cfg, sessionId);

    let snapshot = "";
    let finalResolve: (v: string) => void = () => {};
    let finalReject: (e: unknown) => void = () => {};
    const finalPromise = new Promise<string>((res, rej) => {
      finalResolve = res;
      finalReject = rej;
    });

    const stream: LlmStream = {
      async *textStream() {
        try {
          for await (const item of sseFrames(body)) {
            if (!isAgentMessageSnapshot(item)) continue;
            const next = item.text;
            if (next.length > snapshot.length) {
              const delta = next.slice(snapshot.length);
              snapshot = next;
              yield delta;
            }
          }
          finalResolve(snapshot);
        } catch (err) {
          finalReject(err);
          throw err;
        }
      },
      async final() {
        return finalPromise;
      },
    };
    return stream;
  },
};
