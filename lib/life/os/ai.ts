import "server-only";
import type { NoaAnswer, OsEntry, OsInboxAiOutput } from "@/lib/life/os/types";
import { OS_ENTRY_TYPES, isOsEntryType } from "@/lib/life/os/types";

export type { NoaAnswer };

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

function getOpenAiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || null;
}

export function isOsAiConfigured(): boolean {
  return Boolean(getOpenAiKey());
}

const inboxFields = ["observation", "possible_type", "candidate_title", "hypothesis", "question_to_investigate", "confidence"];
const answerFields = ["answer", "fact", "interpretation", "feeling_state", "relevant_principle", "suggested_next_step", "uncertainty"];

async function chatJson(system: string, user: string, fields: string[]): Promise<Record<string, unknown>> {
  const apiKey = getOpenAiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    signal: AbortSignal.timeout(25_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL,
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "os_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              ...Object.fromEntries(fields.map((field) => [field, {
                type: "string",
                ...(field === "possible_type" ? { enum: OS_ENTRY_TYPES } : {}),
              }])),
              unknowns: { type: "array", items: { type: "string" } },
            },
            required: [...fields, "unknowns"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    // Provider errors can echo credentials or private input. Never propagate their body.
    throw new Error(`OpenAI request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response.");

  const raw: unknown = JSON.parse(content);
  validateOutput(raw, fields);
  return raw;
}

function validateOutput(raw: unknown, fields: string[]): asserts raw is Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid AI output.");
  }
  const value = raw as Record<string, unknown>;
  if (fields.some((field) => typeof value[field] !== "string") ||
      !Array.isArray(value.unknowns) || value.unknowns.some((item) => typeof item !== "string")) {
    throw new Error("Invalid AI output.");
  }
}

export function normalizeInboxAiOutput(raw: unknown): OsInboxAiOutput {
  validateOutput(raw, inboxFields);
  const possibleType = String(raw.possible_type);
  if (!isOsEntryType(possibleType) || !String(raw.observation).trim() || !String(raw.candidate_title).trim()) {
    throw new Error("Invalid AI candidate.");
  }
  return {
    observation: String(raw.observation).trim(),
    possible_type: possibleType,
    candidate_title: String(raw.candidate_title).trim(),
    hypothesis: String(raw.hypothesis).trim(),
    unknowns: raw.unknowns as string[],
    question_to_investigate: String(raw.question_to_investigate).trim(),
    confidence: String(raw.confidence).trim(),
  };
}

export async function processInboxRawText(rawText: string): Promise<OsInboxAiOutput> {
  const system = [
    "You help Ainhoa turn a raw personal observation into a structured OS candidate.",
    "Return JSON only.",
    "This output is an AI interpretation, not approved truth.",
    "Do not diagnose. Do not invent certainty. Prefer modest hypotheses.",
    "possible_type must be one of: constitution, belief, pattern, goal, training, selection, regulation, precedent.",
    "Fields: observation, possible_type, candidate_title, hypothesis, unknowns (string[]), question_to_investigate, confidence.",
  ].join(" ");

  const raw = await chatJson(
    system,
    `Raw observation:\n${rawText}`,
    inboxFields
  );
  return normalizeInboxAiOutput(raw);
}

export async function askNoa(params: {
  question: string;
  entries: OsEntry[];
  training: OsEntry | null;
}): Promise<NoaAnswer> {
  const compactEntries = params.entries.map((entry) => ({
    id: entry.id,
    code: entry.entryCode,
    type: entry.type,
    title: entry.title,
    status: entry.status,
    summary: entry.summary,
    body: entry.body,
  }));

  const system = [
    "You are NOA, a private retrieval/reasoning layer over Ainhoa's approved personal OS.",
    "Answer briefly and concretely for a phone screen.",
    "Use only the provided approved OS material. Do not invent new approved beliefs.",
    "Do not act like a therapist, diagnose, or invent deep explanations.",
    "Distinguish fact, interpretation, feeling/state, relevant principle, suggested next step, and unknowns.",
    "Mark uncertainty when evidence is insufficient.",
    "Never claim a hypothesis is fact. Never silently modify the OS.",
    "Return JSON with keys: answer, fact, interpretation, feeling_state, relevant_principle, suggested_next_step, unknowns (string[]), uncertainty.",
  ].join(" ");

  const user = JSON.stringify(
    {
      question: params.question,
      active_training: params.training
        ? {
            id: params.training.id,
            code: params.training.entryCode,
            title: params.training.title,
            summary: params.training.summary,
            body: params.training.body,
            review_at: params.training.reviewAt,
          }
        : null,
      approved_os_entries: compactEntries,
    },
    null,
    2
  );

  const raw = await chatJson(system, user, answerFields);
  if (!String(raw.answer).trim()) throw new Error("AI returned an empty answer.");
  return {
    answer: String(raw.answer || "").trim(),
    fact: String(raw.fact || "").trim(),
    interpretation: String(raw.interpretation || "").trim(),
    feeling_state: String(raw.feeling_state || "").trim(),
    relevant_principle: String(raw.relevant_principle || "").trim(),
    suggested_next_step: String(raw.suggested_next_step || "").trim(),
    unknowns: raw.unknowns as string[],
    uncertainty: String(raw.uncertainty || "").trim(),
  };
}
