import { fetchNotionPage } from "./doc-fetcher";

let cachedPlaybook: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;

function getPlaybookPageId(): string {
  return process.env.NOTION_PLAYBOOK_PAGE_ID!;
}

export async function getPlaybookContent(): Promise<string> {
  const now = Date.now();
  if (cachedPlaybook && now - cacheTimestamp < CACHE_TTL) {
    return cachedPlaybook;
  }

  const page = await fetchNotionPage(getPlaybookPageId());
  cachedPlaybook = page.content;
  cacheTimestamp = now;
  return cachedPlaybook;
}
