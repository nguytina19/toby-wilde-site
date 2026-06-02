import { ConfidenceLevel } from "./confidence";
import { notion } from "./notion-client";

function getLogDatabaseId(): string {
  return process.env.NOTION_LOG_DATABASE_ID!;
}

export interface QuestionLogEntry {
  question: string;
  draftAnswer: string;
  finalAnswer?: string;
  threadHistory?: string;
  confidence: ConfidenceLevel;
  status: "Pending" | "Approved" | "Edited" | "Declined";
  assignedTo: string;
  askedByNotionId?: string;
  slackLink: string;
  sfdcLink?: string;
  date: string;
}

export async function logQuestion(entry: QuestionLogEntry): Promise<string> {
  const response = await notion.pages.create({
    parent: { database_id: getLogDatabaseId() },
    properties: {
      "Question": {
        title: [{ text: { content: entry.question.slice(0, 2000) } }],
      },
      "Answer": {
        rich_text: [{ text: { content: entry.draftAnswer.slice(0, 2000) } }],
      },
      "Confidence": {
        select: { name: capitalize(entry.confidence) },
      },
      "Status": {
        select: { name: entry.status },
      },
      "Assigned To": {
        rich_text: [{ text: { content: entry.assignedTo } }],
      },
      ...(entry.askedByNotionId ? {
        "Asked By": {
          people: [{ id: entry.askedByNotionId }],
        },
      } : {}),
      "Slack Link": {
        url: entry.slackLink,
      },
      ...(entry.sfdcLink ? { "SFDC Link": { url: entry.sfdcLink } } : {}),
      "Date": {
        date: { start: entry.date },
      },
    },
  });

  return response.id;
}

const logIdStore = new Map<string, string>();

export function storeLogId(threadTs: string, logId: string) {
  logIdStore.set(threadTs, logId);
  setTimeout(() => logIdStore.delete(threadTs), 24 * 60 * 60 * 1000);
}

export function getLogId(threadTs: string): string | undefined {
  return logIdStore.get(threadTs);
}

export async function updateLogEntry(
  pageId: string,
  fields: {
    finalAnswer?: string;
    threadHistory?: string;
    status?: "Pending" | "Approved" | "Edited" | "Declined";
    sfdcLink?: string;
  }
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: any = {};

  if (fields.finalAnswer !== undefined) {
    properties["Final Answer"] = {
      rich_text: [{ text: { content: fields.finalAnswer.slice(0, 2000) } }],
    };
  }

  if (fields.threadHistory !== undefined) {
    properties["Thread History"] = {
      rich_text: [{ text: { content: fields.threadHistory.slice(0, 2000) } }],
    };
  }

  if (fields.status !== undefined) {
    properties["Status"] = {
      select: { name: fields.status },
    };
  }

  if (fields.sfdcLink !== undefined) {
    properties["SFDC Link"] = {
      url: fields.sfdcLink,
    };
  }

  await notion.pages.update({
    page_id: pageId,
    properties,
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
