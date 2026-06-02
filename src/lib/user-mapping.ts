import { Client } from "@notionhq/client";
import { slack } from "./slack";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

interface NotionUser {
  id: string;
  name: string;
  email: string;
}

let notionUsersCache: NotionUser[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function getNotionUsers(): Promise<NotionUser[]> {
  const now = Date.now();
  if (notionUsersCache && now - cacheTimestamp < CACHE_TTL) {
    return notionUsersCache;
  }

  const users: NotionUser[] = [];
  let cursor: string | undefined;

  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await notion.users.list({
      start_cursor: cursor,
      page_size: 100,
    });

    for (const user of response.results) {
      if (user.type === "person" && user.person?.email) {
        users.push({
          id: user.id,
          name: user.name || "",
          email: user.person.email.toLowerCase(),
        });
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  notionUsersCache = users;
  cacheTimestamp = now;
  return users;
}

const slackEmailCache = new Map<string, string>();

export async function getSlackUserEmail(slackUserId: string): Promise<string | null> {
  const cached = slackEmailCache.get(slackUserId);
  if (cached) return cached;

  try {
    const result = await slack.users.info({ user: slackUserId });
    const email = result.user?.profile?.email;
    if (email) {
      slackEmailCache.set(slackUserId, email.toLowerCase());
      return email.toLowerCase();
    }
  } catch (err) {
    console.error("[user-mapping] Failed to get Slack user info:", err);
  }

  return null;
}

export async function resolveNotionUserId(slackUserId: string): Promise<string | null> {
  const email = await getSlackUserEmail(slackUserId);
  if (!email) return null;

  const notionUsers = await getNotionUsers();
  const match = notionUsers.find((u) => u.email === email);
  return match ? match.id : null;
}

export async function resolveNotionUserByName(name: string): Promise<string | null> {
  const notionUsers = await getNotionUsers();
  const lower = name.toLowerCase();
  const exact = notionUsers.find((u) => u.name.toLowerCase() === lower);
  if (exact) return exact.id;
  const partial = notionUsers.find(
    (u) => u.name.toLowerCase().includes(lower) || lower.includes(u.name.toLowerCase())
  );
  return partial?.id ?? null;
}
