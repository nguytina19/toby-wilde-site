import { Client } from "@notionhq/client";
import { PageSignal } from "./confidence";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

interface NotionPage {
  object: string;
  id: string;
  url: string;
  properties: Record<string, {
    type: string;
    title?: Array<{ plain_text: string }>;
    rich_text?: Array<{ plain_text: string }>;
  }>;
}

export interface SourceDoc {
  title: string;
  url: string;
}

export async function searchNotionDocs(query: string): Promise<{
  context: string;
  sources: SourceDoc[];
  signals: PageSignal[];
}> {
  const response = await notion.search({
    query,
    page_size: 5,
    filter: { property: "object", value: "page" },
  });

  const pages: string[] = [];
  const sources: SourceDoc[] = [];
  const signals: PageSignal[] = [];

  for (const result of response.results) {
    if (result.object !== "page") continue;
    const page = result as unknown as NotionPage;

    const question = extractProperty(page, "Question (Clean)")
      || extractProperty(page, "title")
      || extractTitle(page);
    const answer = extractProperty(page, "Answer (Full)") || "";
    const url = page.url || "";

    let entry = `Title: ${question}`;
    if (answer) entry += `\nExisting Answer: ${answer}`;
    pages.push(entry);

    if (url && question) {
      sources.push({ title: question, url });
    }

    signals.push({ question, hasAnswer: answer.length > 0 });
  }

  return {
    context: pages.join("\n\n---\n\n"),
    sources,
    signals,
  };
}

function extractProperty(page: NotionPage, name: string): string {
  const prop = page.properties[name];
  if (!prop) return "";

  if (prop.type === "title" && prop.title?.length) {
    return prop.title.map((t) => t.plain_text).join("");
  }
  if (prop.type === "rich_text" && prop.rich_text?.length) {
    return prop.rich_text.map((t) => t.plain_text).join("");
  }
  return "";
}

function extractTitle(page: NotionPage): string {
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "title" && prop.title?.length) {
      return prop.title.map((t) => t.plain_text).join("");
    }
  }
  return "Untitled";
}
