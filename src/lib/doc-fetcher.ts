import { notion } from "./notion-client";

export interface FetchedDoc {
  title: string;
  content: string;
  url: string;
}

export async function fetchNotionPage(pageId: string): Promise<FetchedDoc> {
  const page = await notion.pages.retrieve({ page_id: pageId });
  const title = extractPageTitle(page);
  const url = (page as { url?: string }).url || "";

  const blocks = await fetchAllBlocks(pageId);
  const content = blocksToText(blocks);

  return { title, content: content.slice(0, 100_000), url };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPageTitle(page: any): string {
  if (!page.properties) return "Untitled";
  for (const prop of Object.values(page.properties) as { type?: string; title?: Array<{ plain_text: string }> }[]) {
    if (prop.type === "title" && prop.title?.length) {
      return prop.title.map((t) => t.plain_text).join("");
    }
  }
  return "Untitled";
}

interface BlockWithChildren {
  id: string;
  type: string;
  has_children: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  children?: BlockWithChildren[];
}

async function fetchAllBlocks(blockId: string): Promise<BlockWithChildren[]> {
  const blocks: BlockWithChildren[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    const page = response.results as BlockWithChildren[];
    const childResults = await Promise.all(
      page.map((block) => (block.has_children ? fetchAllBlocks(block.id) : Promise.resolve(undefined))),
    );
    for (let i = 0; i < page.length; i++) {
      const block = page[i];
      const children = childResults[i];
      if (children) block.children = children;
      blocks.push(block);
    }

    cursor = response.has_more ? response.next_cursor! : undefined;
  } while (cursor);

  return blocks;
}

function richTextToPlain(richText: Array<{ plain_text: string }> | undefined): string {
  if (!richText) return "";
  return richText.map((t) => t.plain_text).join("");
}

function blocksToText(blocks: BlockWithChildren[], depth = 0): string {
  const indent = "  ".repeat(depth);
  const parts: string[] = [];

  for (const block of blocks) {
    const data = block[block.type];
    if (!data) continue;

    switch (block.type) {
      case "paragraph":
        parts.push(`${indent}${richTextToPlain(data.rich_text)}`);
        break;
      case "heading_1":
        parts.push(`\n${indent}# ${richTextToPlain(data.rich_text)}`);
        break;
      case "heading_2":
        parts.push(`\n${indent}## ${richTextToPlain(data.rich_text)}`);
        break;
      case "heading_3":
        parts.push(`\n${indent}### ${richTextToPlain(data.rich_text)}`);
        break;
      case "bulleted_list_item":
        parts.push(`${indent}- ${richTextToPlain(data.rich_text)}`);
        break;
      case "numbered_list_item":
        parts.push(`${indent}1. ${richTextToPlain(data.rich_text)}`);
        break;
      case "to_do":
        parts.push(`${indent}[${data.checked ? "x" : " "}] ${richTextToPlain(data.rich_text)}`);
        break;
      case "toggle":
        parts.push(`${indent}> ${richTextToPlain(data.rich_text)}`);
        break;
      case "callout":
        parts.push(`${indent}> ${richTextToPlain(data.rich_text)}`);
        break;
      case "quote":
        parts.push(`${indent}> ${richTextToPlain(data.rich_text)}`);
        break;
      case "code":
        parts.push(`${indent}\`\`\`\n${indent}${richTextToPlain(data.rich_text)}\n${indent}\`\`\``);
        break;
      case "divider":
        parts.push(`${indent}---`);
        break;
      case "child_page":
        parts.push(`${indent}[Page: ${data.title}]`);
        break;
      case "table_row":
        parts.push(`${indent}| ${(data.cells || []).map((c: Array<{ plain_text: string }>) => richTextToPlain(c)).join(" | ")} |`);
        break;
      default:
        if (data.rich_text) {
          parts.push(`${indent}${richTextToPlain(data.rich_text)}`);
        }
    }

    if (block.children?.length) {
      parts.push(blocksToText(block.children, depth + 1));
    }
  }

  return parts.filter(Boolean).join("\n");
}
