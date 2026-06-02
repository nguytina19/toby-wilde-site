import { slack } from "./slack";
import { detectNotionLinks, DocLink } from "./doc-links";
import { fetchNotionPage } from "./doc-fetcher";
import { getPlaybookContent } from "./playbook";
import { analyzeDocument } from "./doc-review";
import { createRadarReport } from "./radar-report";
import { findRadarReviewer } from "./radar-routing";

const processedMessages = new Set<string>();

const channelNameCache = new Map<string, string>();

async function getChannelName(channelId: string): Promise<string> {
  const cached = channelNameCache.get(channelId);
  if (cached) return cached;

  try {
    const info = await slack.conversations.info({ channel: channelId });
    const name = info.channel?.name || channelId;
    channelNameCache.set(channelId, name);
    return name;
  } catch {
    return channelId;
  }
}

export async function handleRadarScan(event: {
  text: string;
  user: string;
  channel: string;
  ts: string;
}) {
  if (processedMessages.has(event.ts)) return;
  processedMessages.add(event.ts);
  setTimeout(() => processedMessages.delete(event.ts), 5 * 60 * 1000);

  const links = detectNotionLinks(event.text);
  console.log("[radar] links detected:", links.length, links.map(l => l.pageId));
  if (links.length === 0) return;

  for (const link of links) {
    try {
      await processRadarDocument(link, event);
    } catch (err) {
      console.error(`[radar] Failed to process ${link.pageId}:`, err);
    }
  }
}

async function processRadarDocument(
  link: DocLink,
  event: { text: string; user: string; channel: string; ts: string }
) {
  console.log("[radar] fetching doc + playbook...");
  const [doc, playbook] = await Promise.all([
    fetchNotionPage(link.pageId),
    getPlaybookContent(),
  ]);
  console.log("[radar] doc fetched:", doc.title, "content length:", doc.content.length);

  console.log("[radar] analyzing document...");
  const review = await analyzeDocument(doc.content, doc.title, playbook);
  console.log("[radar] analysis complete, risk pillars:", Object.entries(review.pillars).map(([k, v]: [string, any]) => `${k}:${v.level}`).join(", "));

  console.log("[radar] resolving reviewer...");
  const [{ name: assignee }, channelName] = await Promise.all([
    findRadarReviewer(doc.title, doc.content),
    getChannelName(event.channel),
  ]);
  console.log("[radar] assignee:", assignee);

  const threadLink = `https://notion.enterprise.slack.com/archives/${event.channel}/p${event.ts.replace(".", "")}`;

  let reportUrl = "";
  try {
    const report = await createRadarReport({
      docTitle: doc.title,
      docUrl: doc.url || link.url,
      docType: review.documentType,
      review,
      slackMessageLink: threadLink,
      channelName,
      assigneeName: assignee,
    });
    reportUrl = report.url;
    console.log("[radar] report created:", reportUrl);
  } catch (err) {
    console.error("[radar] Failed to create Notion report:", err);
  }

  console.log("[radar] done processing", link.pageId);
}
