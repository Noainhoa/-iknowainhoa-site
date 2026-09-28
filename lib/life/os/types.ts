export const OS_ENTRY_TYPES = [
  "constitution",
  "belief",
  "pattern",
  "goal",
  "training",
  "selection",
  "regulation",
  "precedent",
] as const;

export type OsEntryType = (typeof OS_ENTRY_TYPES)[number];

export const OS_ENTRY_STATUSES = [
  "exposed",
  "rebuilding",
  "testing",
  "integrated",
  "archived",
  "active",
] as const;

export type OsEntryStatus = (typeof OS_ENTRY_STATUSES)[number];

export const OS_REVIEW_STATES = ["draft", "reviewed", "approved"] as const;
export type OsReviewState = (typeof OS_REVIEW_STATES)[number];

export const OS_INBOX_DECISIONS = ["approved", "rejected", "pending"] as const;
export type OsInboxDecision = (typeof OS_INBOX_DECISIONS)[number];

export type OsInboxAiOutput = {
  observation: string;
  possible_type: OsEntryType | string;
  candidate_title: string;
  hypothesis: string;
  unknowns: string[];
  question_to_investigate: string;
  confidence: string;
  summary?: string;
};

export type OsEntry = {
  id: string;
  userId: string;
  entryCode: string | null;
  type: OsEntryType;
  title: string;
  status: OsEntryStatus;
  reviewState: OsReviewState;
  summary: string | null;
  body: Record<string, unknown>;
  identifiedAt: string | null;
  reviewAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OsInboxItem = {
  id: string;
  userId: string;
  rawText: string;
  processed: boolean;
  aiOutput: OsInboxAiOutput | null;
  decision: OsInboxDecision | null;
  entryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DbOsEntry = {
  id: string;
  user_id: string;
  entry_code: string | null;
  type: OsEntryType;
  title: string;
  status: OsEntryStatus;
  review_state: OsReviewState;
  summary: string | null;
  body: Record<string, unknown> | null;
  identified_at: string | null;
  review_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbOsInbox = {
  id: string;
  user_id: string;
  raw_text: string;
  processed: boolean;
  ai_output: OsInboxAiOutput | null;
  decision: OsInboxDecision | null;
  entry_id: string | null;
  created_at: string;
  updated_at: string;
};

export function mapOsEntry(row: DbOsEntry): OsEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryCode: row.entry_code,
    type: row.type,
    title: row.title,
    status: row.status,
    reviewState: row.review_state,
    summary: row.summary,
    body: row.body ?? {},
    identifiedAt: row.identified_at,
    reviewAt: row.review_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOsInbox(row: DbOsInbox): OsInboxItem {
  return {
    id: row.id,
    userId: row.user_id,
    rawText: row.raw_text,
    processed: row.processed,
    aiOutput: row.ai_output,
    decision: row.decision,
    entryId: row.entry_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isOsEntryType(value: string): value is OsEntryType {
  return (OS_ENTRY_TYPES as readonly string[]).includes(value);
}

export type NoaAnswer = {
  answer: string;
  fact: string;
  interpretation: string;
  feeling_state: string;
  relevant_principle: string;
  suggested_next_step: string;
  unknowns: string[];
  uncertainty: string;
};
