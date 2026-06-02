export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceResult {
  level: ConfidenceLevel;
  score: number;
  reason: string;
}

export interface PageSignal {
  question: string;
  hasAnswer: boolean;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
  );
}

export function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function computeConfidence(
  userQuery: string,
  pages: PageSignal[]
): ConfidenceResult {
  if (pages.length === 0) {
    return { level: "low", score: 0, reason: "No matching documentation found" };
  }

  let bestSim = 0;
  let bestHasAnswer = false;

  for (const page of pages) {
    const sim = jaccardSimilarity(userQuery, page.question);
    if (sim > bestSim) {
      bestSim = sim;
      bestHasAnswer = page.hasAnswer;
    }
  }

  const score = Math.min(1, bestSim * (bestHasAnswer ? 1.0 : 0.6));

  if (bestSim >= 0.5 && bestHasAnswer) {
    return { level: "high", score, reason: "FAQ hit — close match with existing answer" };
  }

  if (bestSim >= 0.5 && !bestHasAnswer) {
    return { level: "medium", score, reason: "Close match but no existing answer" };
  }

  if (bestSim >= 0.25 && bestHasAnswer) {
    return { level: "medium", score, reason: "Partial match with existing answer" };
  }

  const pagesWithAnswers = pages.filter((p) => p.hasAnswer).length;
  if (pagesWithAnswers >= 2 && bestSim >= 0.25) {
    return { level: "medium", score, reason: "Synthesized from multiple docs" };
  }

  return { level: "low", score, reason: "Weak or no retrieval match" };
}
