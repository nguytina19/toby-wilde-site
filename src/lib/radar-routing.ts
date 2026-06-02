import { Client } from "@notionhq/client";
import { findReviewer } from "./routing";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const COVERAGE_DB_ID = process.env.NOTION_COVERAGE_PAGE_ID || "152b35e6-e67f-800d-ae00-fa40d4c5a991";

interface CoverageEntry {
  team: string;
  umbrellaTeam: string;
  legalOwners: string[];
  pm: string;
}

let cachedEntries: CoverageEntry[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function loadCoverageEntries(): Promise<CoverageEntry[]> {
  const now = Date.now();
  if (cachedEntries && now - cacheTimestamp < CACHE_TTL) {
    return cachedEntries;
  }

  const entries: CoverageEntry[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: COVERAGE_DB_ID,
      start_cursor: cursor,
      page_size: 100,
    });

    if (!response.results) {
      console.error("[radar-routing] No results from dataSources.query for", COVERAGE_DB_ID, "— response:", JSON.stringify(response).slice(0, 300));
      break;
    }

    for (const row of response.results) {
      const props = (row as Record<string, unknown>).properties as Record<string, unknown>;
      if (!props) continue;

      const team = getText(props, "Team");
      const umbrellaTeam = getText(props, "Umbrella Team");
      const legalOwners = getMultiSelect(props, "Legal Owner");
      const pm = getText(props, "PM");

      if (team) {
        entries.push({ team, umbrellaTeam, legalOwners, pm });
      }
    }

    cursor = response.has_more ? response.next_cursor! : undefined;
  } while (cursor);

  cachedEntries = entries;
  cacheTimestamp = now;
  return entries;
}

function getText(props: Record<string, unknown>, key: string): string {
  const prop = props[key] as {
    type?: string;
    title?: Array<{ plain_text: string }>;
    rich_text?: Array<{ plain_text: string }>;
  } | undefined;
  if (!prop) return "";
  if (prop.type === "title" && prop.title?.length) return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text" && prop.rich_text?.length) return prop.rich_text.map((t) => t.plain_text).join("");
  return "";
}

function getMultiSelect(props: Record<string, unknown>, key: string): string[] {
  const prop = props[key] as {
    type?: string;
    multi_select?: Array<{ name: string }>;
  } | undefined;
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select?.map((o) => o.name) || [];
}

export async function findRadarReviewer(
  docTitle: string,
  docContent: string,
): Promise<{ name: string }> {
  const entries = await loadCoverageEntries();
  const searchText = `${docTitle} ${docContent}`.toLowerCase();

  let bestMatch: CoverageEntry | null = null;
  let bestScore = 0;

  for (const entry of entries) {
    if (entry.legalOwners.length === 0) continue;

    let score = 0;
    const teamLower = entry.team.toLowerCase();
    const teamWords = teamLower.split(/[\s\[\]()]+/).filter(Boolean);

    if (searchText.includes(teamLower)) {
      score += 10;
    } else {
      for (const word of teamWords) {
        if (word.length >= 3 && searchText.includes(word)) {
          score += 2;
        }
      }
    }

    if (entry.umbrellaTeam) {
      const umbrellaLower = entry.umbrellaTeam.toLowerCase();
      if (searchText.includes(umbrellaLower)) {
        score += 3;
      }
    }

    if (entry.pm) {
      const pmNames = entry.pm.replace(/@/g, "").toLowerCase().split(",").map((s) => s.trim());
      for (const pm of pmNames) {
        if (pm && searchText.includes(pm)) {
          score += 5;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return { name: bestMatch.legalOwners[0] };
  }

  const fallback = await findReviewer(docTitle + " " + docContent.slice(0, 500));
  return { name: fallback.name };
}
