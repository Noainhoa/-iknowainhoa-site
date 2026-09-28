import type { NoaAnswer, OsEntry, OsInboxAiOutput } from "@/lib/life/os/types";
import { isOsEntryType } from "@/lib/life/os/types";

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

async function chatJson<T>(system: string, user: string): Promise<T> {
  const apiKey = getOpenAiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `OpenAI request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response.");

  return JSON.parse(content) as T;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

export function normalizeInboxAiOutput(raw: Record<string, unknown>): OsInboxAiOutput {
  const possibleType = String(raw.possible_type || "pattern").toLowerCase();
  return {
    observation: String(raw.observation || "").trim(),
    possible_type: isOsEntryType(possibleType) ? possibleType : "pattern",
    candidate_title: String(raw.candidate_title || "").trim(),
    hypothesis: String(raw.hypothesis || "").trim(),
    unknowns: asStringArray(raw.unknowns),
    question_to_investigate: String(raw.question_to_investigate || "").trim(),
    confidence: String(raw.confidence || "medium").trim() || "medium",
    summary: raw.summary ? String(raw.summary).trim() : undefined,
  };
}

export async function processInboxRawText(rawText: string): Promise<OsInboxAiOutput> {
  const system = [
    "You help Ainhoa turn a raw personal observation into a structured OS candidate.",
    "Return JSON only.",
    "This output is an AI interpretation, not approved truth.",
    "Do not diagnose. Do not invent certainty. Prefer modest hypotheses.",
    "possible_type must be one of: constitution, belief, pattern, goal, training, selection, regulation, precedent.",
    "Fields: observation, possible_type, candidate_title, hypothesis, unknowns (string[]), question_to_investigate, confidence, summary.",
  ].join(" ");

  const raw = await chatJson<Record<string, unknown>>(
    system,
    `Raw observation:\n${rawText}`
  );
  const normalized = normalizeInboxAiOutput(raw);
  if (!normalized.observation || !normalized.candidate_title) {
    throw new Error("AI output missing required fields.");
  }
  return normalized;
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

  const raw = await chatJson<Record<string, unknown>>(system, user);
  return {
    answer: String(raw.answer || "").trim(),
    fact: String(raw.fact || "").trim(),
    interpretation: String(raw.interpretation || "").trim(),
    feeling_state: String(raw.feeling_state || "").trim(),
    relevant_principle: String(raw.relevant_principle || "").trim(),
    suggested_next_step: String(raw.suggested_next_step || "").trim(),
    unknowns: asStringArray(raw.unknowns),
    uncertainty: String(raw.uncertainty || "").trim(),
  };
}
