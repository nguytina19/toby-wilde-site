const NOTION_LINK_RE = /https?:\/\/(?:[\w.-]*notion[\w.-]*)\/[^\s>|]*?([a-f0-9]{32})/gi;

export interface DocLink {
  url: string;
  pageId: string;
}

function toUuid(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function detectNotionLinks(text: string): DocLink[] {
  const cleaned = text.replace(/<(https?:\/\/[^|>]+)(?:\|[^>]*)?>/g, "$1");

  const links: DocLink[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = NOTION_LINK_RE.exec(cleaned)) !== null) {
    const hex = match[1];
    if (seen.has(hex)) continue;
    seen.add(hex);
    links.push({ url: match[0], pageId: toUuid(hex) });
  }

  NOTION_LINK_RE.lastIndex = 0;
  return links;
}
