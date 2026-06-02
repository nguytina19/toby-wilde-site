import { Client } from "@notionhq/client";
import { DocReviewResult, RiskLevel } from "./doc-review";
import { resolveNotionUserByName } from "./user-mapping";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function getRadarDatabaseId(): string {
  return process.env.NOTION_RADAR_DATABASE_ID!;
}

export interface RadarReportParams {
  docTitle: string;
  docUrl: string;
  docType: string;
  review: DocReviewResult;
  slackMessageLink: string;
  channelName: string;
  assigneeName: string;
}

function mapPrivacyLevel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    High: "🔴 High",
    Medium: "🟡 Medium",
    Low: "🟢 Low",
    None: "🟢 Low",
  };
  return map[level];
}

function mapPatentLevel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    High: "🔴 Urgent",
    Medium: "🟡 Medium",
    Low: "🟢 None",
    None: "🟢 None",
  };
  return map[level];
}

function mapSubprocessorLevel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    High: "🔴 Multiple Vendors",
    Medium: "🟡 New Vendor",
    Low: "🟢 None",
    None: "🟢 None",
  };
  return map[level];
}

function mapDataGovernanceLevel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    High: "🔴 High Risk",
    Medium: "🟡 Novel",
    Low: "🟢 Standard",
    None: "🟢 Standard",
  };
  return map[level];
}

function mapCommercialLevel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    High: "🔴 High",
    Medium: "🟡 Medium",
    Low: "🟢 Low",
    None: "🟢 Low",
  };
  return map[level];
}

function buildRiskFlags(review: DocReviewResult): { name: string }[] {
  const flags: { name: string }[] = [];
  const mapping: [keyof DocReviewResult["pillars"], string][] = [
    ["privacy", "Privacy Risk"],
    ["patent", "Patent Risk"],
    ["subprocessor", "Subprocessor Risk"],
    ["dataGovernance", "Data Governance Risk"],
    ["commercial", "Commercial Risk"],
  ];
  for (const [key, label] of mapping) {
    const level = review.pillars[key].level;
    if (level === "Medium" || level === "High") {
      flags.push({ name: label });
    }
  }
  return flags;
}

function deriveComplexity(review: DocReviewResult): string {
  const levels = Object.values(review.pillars).map((p) => p.level);
  const highCount = levels.filter((l) => l === "High").length;
  const medCount = levels.filter((l) => l === "Medium").length;
  if (highCount >= 2 || (highCount >= 1 && medCount >= 2)) return "Complex";
  if (highCount >= 1 || medCount >= 2) return "Moderate";
  return "Simple";
}

function truncate(text: string, max = 2000): string {
  return text.length > max ? text.slice(0, max) : text;
}

export async function createRadarReport(
  params: RadarReportParams
): Promise<{ pageId: string; url: string }> {
  const { docTitle, docUrl, docType, review, slackMessageLink, channelName, assigneeName } = params;

  const riskFlags = buildRiskFlags(review);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: any = {
    "PRD Title": {
      title: [{ text: { content: truncate(`[${docType}] ${docTitle}`) } }],
    },
    "PRD URL": {
      rich_text: [{ text: { content: truncate(docUrl), link: { url: docUrl } } }],
    },
    "Slack Message Link": {
      rich_text: [{ text: { content: truncate(slackMessageLink), link: { url: slackMessageLink } } }],
    },
    "Slack Channel Source": {
      rich_text: [{ text: { content: `#${channelName}` } }],
    },
    "Review Date": {
      date: { start: new Date().toISOString().split("T")[0] },
    },
    "Overall Disposition": {
      select: { name: "Pending Attorney Review" },
    },
    "Complexity": {
      select: { name: deriveComplexity(review) },
    },
    "Privacy Risk Level": {
      select: { name: mapPrivacyLevel(review.pillars.privacy.level) },
    },
    "Patent Risk Level": {
      select: { name: mapPatentLevel(review.pillars.patent.level) },
    },
    "Subprocessor Risk Level": {
      select: { name: mapSubprocessorLevel(review.pillars.subprocessor.level) },
    },
    "Data Governance Risk Level": {
      select: { name: mapDataGovernanceLevel(review.pillars.dataGovernance.level) },
    },
    "Commercial Risk Level": {
      select: { name: mapCommercialLevel(review.pillars.commercial.level) },
    },
  };

  if (riskFlags.length > 0) {
    properties["Risk Flags"] = { multi_select: riskFlags };
  }

  if (assigneeName) {
    const userId = await resolveNotionUserByName(assigneeName);
    if (userId) {
      properties["Attorney Assigned"] = {
        people: [{ id: userId }],
      };
    } else {
      console.warn(`[radar] Could not resolve Notion user for "${assigneeName}", skipping Attorney Assigned`);
    }
  }

  const response = await notion.pages.create({
    parent: { database_id: getRadarDatabaseId() },
    icon: { type: "emoji", emoji: "📋" },
    properties,
  });

  const pageUrl = (response as { url?: string }).url || "";

  const bodyBlocks = buildReportBlocks(params, review);
  if (bodyBlocks.length > 0) {
    await notion.blocks.children.append({
      block_id: response.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: bodyBlocks as any,
    });
  }

  return { pageId: response.id, url: pageUrl };
}

function buildReportBlocks(params: RadarReportParams, review: DocReviewResult) {
  type Block = { object: "block"; type: string; [key: string]: unknown };
  const blocks: Block[] = [];

  const riskEmoji: Record<string, string> = {
    High: "🔴",
    Medium: "🟡",
    Low: "🟢",
    None: "⚪",
  };

  const richText = (content: string) => {
    const segments: { type: "text"; text: { content: string }; annotations?: { bold: boolean } }[] = [];
    const parts = content.split(/\*\*(.+?)\*\*/g);
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      if (i % 2 === 1) {
        segments.push({ type: "text", text: { content: parts[i] }, annotations: { bold: true } });
      } else {
        segments.push({ type: "text", text: { content: parts[i] } });
      }
    }
    return segments.length > 0 ? segments : [{ type: "text" as const, text: { content } }];
  };
  const heading1 = (content: string): Block => ({ object: "block", type: "heading_1", heading_1: { rich_text: richText(content) } });
  const heading2 = (content: string): Block => ({ object: "block", type: "heading_2", heading_2: { rich_text: richText(content) } });
  const heading3 = (content: string): Block => ({ object: "block", type: "heading_3", heading_3: { rich_text: richText(content) } });
  const paragraph = (content: string): Block => ({ object: "block", type: "paragraph", paragraph: { rich_text: richText(content) } });
  const divider: Block = { object: "block", type: "divider", divider: {} };
  const numbered = (content: string): Block => ({ object: "block", type: "numbered_list_item", numbered_list_item: { rich_text: richText(content) } });
  const bullet = (content: string): Block => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: richText(content) } });
  const todo = (content: string): Block => ({ object: "block", type: "to_do", to_do: { rich_text: richText(content), checked: false } });

  const reviewDate = new Date().toISOString().split("T")[0];
  const complexity = deriveComplexity(review);

  // Title + metadata
  blocks.push(heading1(`[${params.docType}] ${params.docTitle}`));
  blocks.push(paragraph(`OVERALL DISPOSITION: Pending Attorney Review\nReview Date: ${reviewDate}\nComplexity: ${complexity}\nDocument Type: ${params.docType}`));
  blocks.push(divider);

  // Executive Summary
  blocks.push(heading2("Executive Summary"));
  blocks.push(paragraph(review.summary));
  blocks.push(divider);

  // Risk Flag Summary
  const pillarEntries: [string, keyof DocReviewResult["pillars"]][] = [
    ["Privacy Risk", "privacy"],
    ["Patent Risk", "patent"],
    ["Subprocessor Risk", "subprocessor"],
    ["Data Governance Risk", "dataGovernance"],
    ["Commercial Risk", "commercial"],
  ];

  blocks.push(heading2("Risk Flag Summary"));
  for (const [label, key] of pillarEntries) {
    const pillar = review.pillars[key];
    const summary = pillar.summary ? ` — ${pillar.summary}` : "";
    blocks.push(numbered(`${label}: ${riskEmoji[pillar.level]} ${pillar.level}${summary}`));
  }
  blocks.push(divider);

  // Detailed Risk Analysis
  blocks.push(heading2("Detailed Risk Analysis"));
  let pillarIndex = 1;
  for (const [label, key] of pillarEntries) {
    const pillar = review.pillars[key];
    blocks.push(heading3(`${pillarIndex}. ${label} — ${riskEmoji[pillar.level]} ${pillar.level}`));
    blocks.push(paragraph(pillar.findings));
    pillarIndex++;
  }
  blocks.push(divider);

  // Flagged Sections (combines keyIssues + completenessIssues)
  const flaggedItems = [...review.keyIssues, ...review.completenessIssues];
  if (flaggedItems.length > 0) {
    blocks.push(heading2("Flagged Sections (Incomplete / Missing)"));
    for (const item of flaggedItems) {
      blocks.push(bullet(item));
    }
    blocks.push(divider);
  }

  // Escalation
  const escalationItems = review.escalation || [];
  if (escalationItems.length > 0 || params.assigneeName) {
    blocks.push(heading2("Escalation"));
    if (escalationItems.length > 0) {
      for (const item of escalationItems) {
        blocks.push(bullet(item));
      }
    } else {
      blocks.push(bullet(`${params.assigneeName} — primary reviewer`));
    }
    blocks.push(divider);
  }

  // Follow-Up Conditions
  if (review.followUpConditions.length > 0) {
    blocks.push(heading2("Follow-Up Conditions"));
    for (const condition of review.followUpConditions) {
      blocks.push(todo(condition));
    }
    blocks.push(divider);
  }

  // Source Documents
  blocks.push(heading2("Source Documents"));
  blocks.push(bullet(`Slack message in #${params.channelName}: ${params.slackMessageLink}`));
  blocks.push(bullet(`Document: ${params.docUrl}`));

  return blocks;
}
