import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeInboxAiOutput } from "@/lib/life/os/ai";
import { getActiveTraining, openInboxItems, partitionOsEntries } from "@/lib/life/os/db";
import { rankOsEntriesForQuestion } from "@/lib/life/os/retrieve";
import type { OsEntry, OsInboxItem } from "@/lib/life/os/types";

function entry(partial: Partial<OsEntry> & Pick<OsEntry, "id" | "type" | "title">): OsEntry {
  return {
    userId: "user",
    entryCode: partial.entryCode ?? null,
    status: partial.status ?? "active",
    reviewState: partial.reviewState ?? "approved",
    summary: partial.summary ?? null,
    body: partial.body ?? {},
    identifiedAt: null,
    reviewAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

test("rankOsEntriesForQuestion boosts workout-related patterns", () => {
  const entries = [
    entry({
      id: "1",
      entryCode: "C-001",
      type: "constitution",
      title: "Wanting does not require a defence",
      summary: "I do not need a defence for wanting what I want.",
    }),
    entry({
      id: "2",
      entryCode: "PT-NEW",
      type: "pattern",
      title: "Advice Before Action",
      summary: "Seeking more workout advice while consistency stays low.",
      body: {
        observation: "I keep researching workouts instead of training.",
      },
    }),
    entry({
      id: "3",
      entryCode: "R-001",
      type: "regulation",
      title: "Low-bandwidth regulation options",
      summary: "Use known regulation options.",
    }),
  ];

  const ranked = rankOsEntriesForQuestion(
    "I keep researching workouts. What should I do today?",
    entries,
    3
  );

  assert.equal(ranked[0]?.id, "2");
});

test("getActiveTraining only returns approved non-archived training", () => {
  const approved = entry({
    id: "t1",
    type: "training",
    title: "Night rehearsal",
    reviewState: "approved",
    status: "active",
  });
  const draft = entry({
    id: "t2",
    type: "training",
    title: "Draft training",
    reviewState: "draft",
    status: "active",
  });
  assert.equal(getActiveTraining([draft, approved])?.id, "t1");
  assert.equal(
    getActiveTraining([
      entry({
        id: "t3",
        type: "training",
        title: "Archived",
        reviewState: "approved",
        status: "archived",
      }),
    ]),
    null
  );
});

test("partitionOsEntries separates active integrated archive", () => {
  const parts = partitionOsEntries([
    entry({ id: "a", type: "belief", title: "Active", status: "rebuilding", reviewState: "approved" }),
    entry({ id: "i", type: "belief", title: "Integrated", status: "integrated", reviewState: "approved" }),
    entry({ id: "x", type: "belief", title: "Archived", status: "archived", reviewState: "approved" }),
    entry({ id: "d", type: "pattern", title: "Draft", status: "active", reviewState: "draft" }),
  ]);
  assert.deepEqual(
    parts.active.map((item) => item.id),
    ["a"]
  );
  assert.deepEqual(
    parts.integrated.map((item) => item.id),
    ["i"]
  );
  assert.deepEqual(
    parts.archive.map((item) => item.id),
    ["x"]
  );
});

test("openInboxItems hides decided items", () => {
  const items = [
    { id: "1", decision: "pending" },
    { id: "2", decision: "approved" },
    { id: "3", decision: "rejected" },
    { id: "4", decision: null },
  ] as OsInboxItem[];
  assert.deepEqual(
    openInboxItems(items).map((item) => item.id),
    ["1", "4"]
  );
});

test("normalizeInboxAiOutput rejects invalid candidate types", () => {
  assert.throws(() => normalizeInboxAiOutput({
    observation: "obs",
    possible_type: "habit",
    candidate_title: "Title",
    hypothesis: "hyp",
    unknowns: ["a"],
    question_to_investigate: "q",
    confidence: "low",
  }), /Invalid AI candidate/);
});
