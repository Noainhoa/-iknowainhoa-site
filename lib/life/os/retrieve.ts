import type { OsEntry } from "@/lib/life/os/types";

const STOP = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "should",
  "the",
  "to",
  "what",
  "with",
  "you",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP.has(token));
}

function entryText(entry: OsEntry): string {
  return [
    entry.entryCode ?? "",
    entry.type,
    entry.title,
    entry.summary ?? "",
    entry.status,
    JSON.stringify(entry.body ?? {}),
  ].join(" ");
}

const TYPE_BOOST: Record<string, number> = {
  constitution: 1.2,
  belief: 1.3,
  pattern: 1.4,
  regulation: 1.5,
  selection: 1.2,
  precedent: 1.2,
  goal: 1.1,
  training: 0.8,
};

export function rankOsEntriesForQuestion(
  question: string,
  entries: OsEntry[],
  limit = 8
): OsEntry[] {
  const tokens = tokenize(question);
  if (tokens.length === 0) {
    return entries
      .filter((entry) => entry.type !== "training")
      .slice(0, limit);
  }

  const scored = entries
    .filter((entry) => entry.type !== "training")
    .map((entry) => {
      const haystack = entryText(entry).toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) score += 1;
      }
      score *= TYPE_BOOST[entry.type] ?? 1;
      if (entry.type === "regulation" && /angry|message|activated|urge|send/.test(question.toLowerCase())) {
        score += 2;
      }
      if (
        entry.type === "pattern" &&
        /workout|train|research|advice|exercise/.test(question.toLowerCase())
      ) {
        score += 2;
      }
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // Prefer constitution + regulation + beliefs as a calm fallback set.
    const preferred = entries.filter((entry) =>
      ["constitution", "belief", "regulation", "precedent", "selection"].includes(
        entry.type
      )
    );
    return (preferred.length ? preferred : entries).slice(0, limit);
  }

  return scored.slice(0, limit).map((item) => item.entry);
}
