import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const ROUTING_RULES_ID = "277b35e6-e67f-805e-a208-000b6bf68ebd";

interface RoutingRule {
  name: string;
  slackId: string;
  email: string;
  signals: string[];
  topics: string[];
  expertise: string;
  region?: string;
}

let cachedRules: RoutingRule[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function loadRoutingRules(): Promise<RoutingRule[]> {
  const now = Date.now();
  if (cachedRules && now - cacheTimestamp < CACHE_TTL) {
    return cachedRules;
  }

  const result = await notion.dataSources.query({
    data_source_id: ROUTING_RULES_ID,
    page_size: 50,
  });

  const rules: RoutingRule[] = [];

  for (const row of result.results) {
    const props = (row as Record<string, unknown>).properties as Record<string, unknown>;
    if (!props) continue;

    const name = getText(props, "Legal team member");
    const slackId = getText(props, "Slack ID");
    const email = getEmail(props, "Email Address");
    const signals = getText(props, "Deterministic signals");
    const topics = getText(props, "Topics covered");
    const expertise = getText(props, "Subject-matter expertise");
    const region = getText(props, "region");

    if (!name || !slackId || name === "TEMPLATE ROW - Copy this format") continue;

    rules.push({
      name,
      slackId,
      email,
      signals: signals.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean),
      topics: topics.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean),
      expertise,
      region: region || undefined,
    });
  }

  cachedRules = rules;
  cacheTimestamp = now;
  return rules;
}

// Pre-warm cache on module load
loadRoutingRules().catch(() => {});

function getText(props: Record<string, unknown>, key: string): string {
  const prop = props[key] as { type?: string; title?: Array<{ plain_text: string }>; rich_text?: Array<{ plain_text: string }>; select?: { name: string } } | undefined;
  if (!prop) return "";
  if (prop.type === "title" && prop.title?.length) return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text" && prop.rich_text?.length) return prop.rich_text.map((t) => t.plain_text).join("");
  if (prop.type === "select" && prop.select) return prop.select.name;
  return "";
}

function getEmail(props: Record<string, unknown>, key: string): string {
  const prop = props[key] as { type?: string; email?: string } | undefined;
  if (prop?.type === "email" && prop.email) return prop.email;
  return "";
}

export async function findReviewer(question: string): Promise<{ name: string; slackId: string }> {
  const rules = await loadRoutingRules();
  const q = question.toLowerCase();

  let bestMatch: RoutingRule | null = null;
  let bestScore = 0;

  for (const rule of rules) {
    let score = 0;

    for (const signal of rule.signals) {
      if (q.includes(signal)) {
        score += 2;
      }
    }

    for (const topic of rule.topics) {
      if (q.includes(topic)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (bestMatch) {
    return { name: bestMatch.name, slackId: bestMatch.slackId };
  }

  // Fallback: return Marion (general routing/triage)
  const fallback = rules.find((r) => r.name === "Marion");
  if (fallback) {
    return { name: fallback.name, slackId: fallback.slackId };
  }

  return { name: "Legal Team", slackId: "" };
}

export async function getAllReviewers(): Promise<{ name: string; slackId: string; expertise: string }[]> {
  const rules = await loadRoutingRules();
  return rules
    .filter((r) => r.slackId)
    .map((r) => ({ name: r.name.split(/\s+/)[0], slackId: r.slackId, expertise: r.expertise }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
