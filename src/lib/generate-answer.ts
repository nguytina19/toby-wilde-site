import Anthropic from "@anthropic-ai/sdk";
import { searchNotionDocs, SourceDoc } from "./notion";
import { computeConfidence, ConfidenceResult, jaccardSimilarity } from "./confidence";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a legal team assistant. Answer questions using the provided internal documentation.

When searching for sources to support your answer, use this priority order:
1. Legal Help Center pages
2. Legal Ask Knowledge Base — prefer Verified rows with the most recent Last Verified date. If multiple candidates, choose the closest semantic match to the requester's wording. Link exactly one row, never a collection.
3. Sales docs (in order of preference):
   - FY26 Sales Process
   - Sales Guides
   - Sharing Domain Information with Prospects & Customers
   - Contracting at Notion
   - Security Customer Request Intake
   - Trust Portal Guide (Conveyor)
   - Conveyor Questionnaire Eliminator Guide
   - Renewal Quotes
   - How to process an Early Renewal (Rip & Replace)
   - How True-up Automation Works
   - Understanding True Up & Add ons
   - Add-on (Amendment) Quotes
   - AI Sales Playbook
   - Customer "Paper" (Contract/Template/Form) Policy
   - Regional Sales
   - FY 2026 Sales Assisted Deal Guides
   - How to work with Legal, Finance and Procurement in the Buying Process
   - All Content Page
   - Security & Privacy
   - HIPAA Compliance with Notion
4. Notion Prod Terms hub and all nested pages
5. If nothing fits, proceed without a source link

Be concise and accurate.
Do NOT reference source documents by name or title in your answer — sources are appended separately and automatically.
Do NOT include links or URLs in your answer.
If the docs don't contain enough information to answer, say so clearly.
When answering follow-up questions, use the thread history for context so your answer is coherent with the prior conversation.

Length and tone:
- Aim for 3–5 bullet points total. Most answers should be under 100 words.
- Each bullet: max 20 words. One clear point per bullet — no compound sentences.
- Lead with the bottom line — state the answer or recommendation first, then support it.
- No sub-bullets or nested lists.
- Cut filler like "Great question", "Here's how to handle it", or "Hope that helps". Start with substance.
- Strip qualifiers and hedging ("it's worth noting that", "you may want to consider", "generally speaking"). Be direct.
- If the question has a yes/no answer, say yes or no first.
- Do not restate the question or paraphrase what the user asked.
- Only include a "Recommendation" section if the answer isn't already a clear recommendation.

Formatting rules (this will be posted in Slack, NOT markdown):
- Never use # or ## headers. Use *bold text* on its own line for section titles instead.
- Use bullet points (•) for structure. Avoid numbered lists unless order matters.
- Use *bold* for emphasis sparingly.
- Do not use section headers unless the answer genuinely has distinct parts (e.g., "If X" vs "If Y"). Most answers need zero headers.
- Do not use code blocks or markdown tables.`;

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "have", "has", "had", "can", "could", "will",
  "would", "shall", "should", "may", "might", "must", "to", "of", "in",
  "for", "on", "with", "at", "by", "from", "as", "into", "about",
  "and", "or", "but", "not", "no", "if", "how", "what", "when", "where",
  "who", "which", "that", "this", "it", "its", "we", "our", "i", "my",
  "you", "your", "they", "their", "there", "up", "out",
]);

function summarizeTitle(title: string): string {
  const words = title
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w.toLowerCase()));

  const kept = words.slice(0, 3).map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );

  return kept.length > 0 ? kept.join(" ") : title.slice(0, 30);
}

export async function generateDraftAnswer(
  question: string,
  threadHistory?: string
): Promise<{
  answer: string;
  sources: SourceDoc[];
  confidence: ConfidenceResult;
}> {
  const { context, sources, signals } = await searchNotionDocs(question);
  const confidence = computeConfidence(question, signals);

  let userContent = `Question: ${question}\n\nInternal documentation:\n${context || "No relevant documents found."}`;

  if (threadHistory) {
    userContent = `Thread history:\n${threadHistory}\n\nFollow-up question: ${question}\n\nInternal documentation:\n${context || "No relevant documents found."}`;
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  let answer =
    message.content[0].type === "text"
      ? message.content[0].text
      : "Unable to generate an answer.";

  const relevantSources = sources.filter(
    (s) => jaccardSimilarity(question, s.title) >= 0.15
  );
  if (relevantSources.length > 0) {
    const sourceLinks = relevantSources
      .map((s, i) => `${i + 1}. <${s.url}|${summarizeTitle(s.title)}>`)
      .join("\n");
    answer += `\n\n*Sources:*\n${sourceLinks}`;
  }

  return { answer, sources, confidence };
}
