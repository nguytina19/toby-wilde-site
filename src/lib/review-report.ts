import { Client } from "@notionhq/client";
import { DocReviewResult, RiskLevel } from "./doc-review";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function getReviewDatabaseId(): string {
  return process.env.NOTION_REVIEW_DATABASE_ID!;
}

export interface ReviewReportParams {
  docTitle: string;
  docUrl: string;
  docType: string;
  review: DocReviewResult;
  slackLink: string;
  requester: string;
  assignedTo: string;
}

function overallDisposition(review: DocReviewResult): string {
  const levels = Object.values(review.pillars).map((p) => p.level);
  if (levels.includes("High")) return "Hold";
  if (levels.includes("Medium")) return "Pending Attorney Review";
  return "Cleared";
}

const privacyRiskMap: Record<RiskLevel, string> = {
  High: "🔴 High",
  Medium: "🟡 Medium",
  Low: "🟢 Low",
  None: "Not Assessed",
};

const patentRiskMap: Record<RiskLevel, string> = {
  High: "🔴 Urgent",
  Medium: "📋 Medium",
  Low: "🟢 None",
  None: "Not Assessed",
};

const subprocessorRiskMap: Record<RiskLevel, string> = {
  High: "🔴 Multiple Vendors",
  Medium: "🟡 New Vendor",
  Low: "🟢 None",
  None: "Not Assessed",
};

const dataGovRiskMap: Record<RiskLevel, string> = {
  High: "🔴 High Risk",
  Medium: "🟡 Novel",
  Low: "🟢 Standard",
  None: "Not Assessed",
};

const commercialRiskMap: Record<RiskLevel, string> = {
  High: "🔴 High",
  Medium: "🟡 Medium",
  Low: "🟢 Low",
  None: "Not Assessed",
};

export async function createReviewReport(
  params: ReviewReportParams
): Promise<{ pageId: string; url: string }> {
  const { docTitle, docUrl, docType, review, slackLink, requester, assignedTo } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: any = {
    "PRD Title": {
      title: [{ text: { content: `[${docType}] ${docTitle}`.slice(0, 2000) } }],
    },
    "PRD URL": {
      rich_text: [{ text: { content: docUrl || "" } }],
    },
    "Overall Disposition": { select: { name: overallDisposition(review) } },
    "Attorney Assigned": {
      rich_text: [{ text: { content: assignedTo } }],
    },
    "Slack Message Link": {
      rich_text: [{ text: { content: slackLink || "" } }],
    },
    "Review Date": { date: { start: new Date().toISOString().split("T")[0] } },
    "Privacy Risk Level": { select: { name: privacyRiskMap[review.pillars.privacy.level] } },
    "Patent Risk Level": { select: { name: patentRiskMap[review.pillars.patent.level] } },
    "Subprocessor Risk Level": { select: { name: subprocessorRiskMap[review.pillars.subprocessor.level] } },
    "Data Governance Risk Level": { select: { name: dataGovRiskMap[review.pillars.dataGovernance.level] } },
    "Commercial Risk Level": { select: { name: commercialRiskMap[review.pillars.commercial.level] } },
    "Executive Summary": {
      rich_text: [{ text: { content: review.summary.slice(0, 2000) } }],
    },
    "Flagged Sections": {
      rich_text: [{ text: { content: review.keyIssues.join("\n").slice(0, 2000) } }],
    },
    "Follow-Up Conditions": {
      rich_text: [{ text: { content: review.followUpConditions.join("\n").slice(0, 2000) } }],
    },
  };

  const response = await notion.pages.create({
    parent: { database_id: getReviewDatabaseId() },
    properties,
  });

  const pageUrl = (response as { url?: string }).url || "";

  const bodyBlocks = buildReportBlocks(review);
  if (bodyBlocks.length > 0) {
    await notion.blocks.children.append({
      block_id: response.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: bodyBlocks as any,
    });
  }

  return { pageId: response.id, url: pageUrl };
}

function buildReportBlocks(review: DocReviewResult) {
  const blocks: { object: "block"; type: string; [key: string]: unknown }[] = [];

  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: "Executive Summary" } }] },
  });
  blocks.push({
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [{ type: "text", text: { content: review.summary } }] },
  });

  if (review.keyIssues.length > 0) {
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "Key Issues" } }] },
    });
    for (const issue of review.keyIssues) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: issue } }] },
      });
    }
  }

  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: "Risk Assessment" } }] },
  });

  const pillarNames: Record<string, string> = {
    privacy: "Privacy",
    patent: "Patent",
    subprocessor: "Subprocessor",
    dataGovernance: "Data Governance",
    commercial: "Commercial",
  };

  const riskEmoji: Record<string, string> = {
    High: "🔴",
    Medium: "🟡",
    Low: "🟢",
    None: "⚪",
  };

  for (const [key, label] of Object.entries(pillarNames)) {
    const pillar = review.pillars[key as keyof typeof review.pillars];
    blocks.push({
      object: "block",
      type: "heading_3",
      heading_3: { rich_text: [{ type: "text", text: { content: `${riskEmoji[pillar.level]} ${label} — ${pillar.level}` } }] },
    });
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: pillar.findings } }] },
    });
  }

  if (review.completenessIssues.length > 0) {
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "Completeness Issues" } }] },
    });
    for (const issue of review.completenessIssues) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: issue } }] },
      });
    }
  }

  if (review.followUpConditions.length > 0) {
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "Follow-Up Conditions" } }] },
    });
    for (const condition of review.followUpConditions) {
      blocks.push({
        object: "block",
        type: "to_do",
        to_do: { rich_text: [{ type: "text", text: { content: condition } }], checked: false },
      });
    }
  }

  return blocks;
}
