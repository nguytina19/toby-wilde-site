import { Client } from "@notionhq/client";

if (!process.env.NOTION_API_KEY) {
  console.error("[notion-client] NOTION_API_KEY is not set; Notion calls will fail at auth");
}

export const notion = new Client({ auth: process.env.NOTION_API_KEY });
