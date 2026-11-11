"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import LifeLoginForm from "@/components/life/LifeLoginForm";
import LifeSetPasswordForm from "@/components/life/LifeSetPasswordForm";
import { useLifeAuth } from "@/components/life/useLifeAuth";
import { getLifeAccessToken } from "@/lib/life/os/auth";
import {
  approveOsInboxItem,
  createOsInboxItem,
  fetchOsEntries,
  fetchOsInbox,
  openInboxItems,
  partitionOsEntries,
  rejectOsInboxItem,
} from "@/lib/life/os/db";
import {
  OS_ENTRY_TYPES,
  type OsEntry,
  type OsEntryType,
  type OsInboxAiOutput,
  type OsInboxItem,
} from "@/lib/life/os/types";

type TypeFilter = "all" | OsEntryType;

function labelForInbox(item: OsInboxItem): string {
  if (item.decision === "approved") return "approved";
  if (item.decision === "rejected") return "rejected";
  if (item.processed) return "processed";
  return "unprocessed";
}

function bodyLines(entry: OsEntry): Array<{ label: string; value: string }> {
  const body = entry.body ?? {};
  const lines: Array<{ label: string; value: string }> = [];
  const push = (label: string, value: unknown) => {
    if (value == null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      lines.push({ label, value: value.map(String).join(" · ") });
      return;
    }
    if (typeof value === "object") return;
    lines.push({ label, value: String(value) });
  };

  if (body.source_inbox_id) {
    push("Observation", body.observation);
    push("Hypothesis", body.hypothesis);
    push("Unknowns", body.unknowns);
    push("Question", body.question_to_investigate);
  } else if (entry.type === "constitution") {
    push("Principle", body.principle);
    push("Meaning", body.meaning);
  } else if (entry.type === "belief") {
    push("Old rule", body.old_rule);
    push("Chosen belief", body.chosen_belief);
    push("Behavioural evidence", body.behavioural_evidence);
    push("Bedtime rehearsal", body.bedtime_rehearsal);
  } else if (entry.type === "pattern") {
    push("Observation", body.observation);
    push("Hypothesis", body.hypothesis);
    push("Unknowns", body.unknowns);
    push("Question", body.question_to_investigate);
  } else if (entry.type === "regulation") {
    push("When useful", body.when_useful);
    push("Options", body.options);
    push("Notes", body.notes);
  } else if (entry.type === "precedent") {
    push("What happened", body.what_happened);
    push("What it demonstrates", body.what_it_demonstrates);
    push("Related", body.related_principles);
  } else if (entry.type === "training") {
    push("Linked", body.linked_entry_code ?? body.linked_title);
    push("Chosen belief", body.chosen_belief);
    push("Practice", body.practice_steps);
    push("Sleep question", body.sleep_question);
    push("Review rule", body.review_rule);
  } else {
    push("Summary", entry.summary);
  }

  return lines;
}

function EntryCard({ entry }: { entry: OsEntry }) {
  const lines = bodyLines(entry);
  return (
    <article className="border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-medium text-gray-900">
          {entry.entryCode ? `${entry.entryCode} — ` : ""}
          {entry.title}
        </h3>
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {entry.type} · {entry.status} · {entry.reviewState}
        </p>
      </div>
      {entry.summary ? <p className="mt-2 text-sm text-gray-700">{entry.summary}</p> : null}
      {lines.length > 0 ? (
        <dl className="mt-3 space-y-2">
          {lines.map((line) => (
            <div key={line.label}>
              <dt className="text-xs uppercase tracking-wide text-gray-500">{line.label}</dt>
              <dd className="text-sm text-gray-800">{line.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

function emptyAiDraft(): OsInboxAiOutput {
  return {
    observation: "",
    possible_type: "pattern",
    candidate_title: "",
    hypothesis: "",
    unknowns: [],
    question_to_investigate: "",
    confidence: "medium",
  };
}

export default function LifeOsShell() {
  const auth = useLifeAuth();
  return <LifeOsSession key={auth.userId ?? "signed-out"} auth={auth} />;
}

function LifeOsSession({ auth }: { auth: ReturnType<typeof useLifeAuth> }) {
  const {
    configured,
    supabase,
    sessionEmail,
    userId,
    authBusy,
    authError,
    recoveryMode,
    finishRecovery,
    handleLogin,
    handleSignOut,
  } = auth;

  const [entries, setEntries] = useState<OsEntry[]>([]);
  const [inbox, setInbox] = useState<OsInboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [drafts, setDrafts] = useState<Record<string, OsInboxAiOutput>>({});

  const reload = useCallback(async () => {
    if (!supabase || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const [nextEntries, nextInbox] = await Promise.all([
        fetchOsEntries(supabase),
        fetchOsInbox(supabase),
      ]);
      setEntries(nextEntries);
      setInbox(nextInbox);
      const nextDrafts: Record<string, OsInboxAiOutput> = {};
      for (const item of nextInbox) {
        if (item.aiOutput) nextDrafts[item.id] = { ...item.aiOutput };
      }
      setDrafts(nextDrafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load OS data.");
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (userId) void reload();
  }, [userId, reload]);

  const partitions = useMemo(() => partitionOsEntries(entries), [entries]);
  const openInbox = useMemo(() => openInboxItems(inbox), [inbox]);
  const filteredActive = useMemo(() => {
    if (typeFilter === "all") return partitions.active;
    return partitions.active.filter((entry) => entry.type === typeFilter);
  }, [partitions.active, typeFilter]);

  async function handleCapture(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !userId || !rawText.trim()) return;
    setBusyId("capture");
    setError(null);
    try {
      await createOsInboxItem(supabase, userId, rawText.trim());
      setRawText("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save inbox item.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleProcess(item: OsInboxItem) {
    if (!supabase) return;
    setBusyId(item.id);
    setError(null);
    try {
      const token = await getLifeAccessToken(supabase);
      if (!token) throw new Error("Missing session token.");
      const response = await fetch("/api/life/os/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inboxId: item.id }),
      });
      const payload = (await response.json()) as { item?: OsInboxItem; error?: string };
      if (!response.ok) throw new Error(payload.error || "Process failed.");
      if (payload.item?.aiOutput) {
        setDrafts((prev) => ({ ...prev, [item.id]: { ...payload.item!.aiOutput! } }));
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Process failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleApprove(item: OsInboxItem) {
    if (!supabase || !userId) return;
    const draft = drafts[item.id] ?? item.aiOutput ?? emptyAiDraft();
    if (!draft.candidate_title.trim() || !draft.observation.trim()) {
      setError("Edit the candidate title and observation before approving.");
      return;
    }
    setBusyId(`approve-${item.id}`);
    setError(null);
    try {
      await approveOsInboxItem(supabase, userId, item, draft);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(item: OsInboxItem) {
    if (!supabase) return;
    setBusyId(`reject-${item.id}`);
    setError(null);
    try {
      await rejectOsInboxItem(supabase, item.id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed.");
    } finally {
      setBusyId(null);
    }
  }

  function updateDraft(id: string, patch: Partial<OsInboxAiOutput>) {
    setDrafts((prev) => {
      const base = prev[id] ?? emptyAiDraft();
      return { ...prev, [id]: { ...base, ...patch } };
    });
  }

  if (!configured) {
    return (
      <p className="text-sm text-gray-600">
        Configure Life Supabase env vars, then run <code className="text-xs">supabase/life-os.sql</code>.
      </p>
    );
  }

  if (recoveryMode) {
    return <LifeSetPasswordForm onDone={finishRecovery} />;
  }

  if (!sessionEmail) {
    return <LifeLoginForm onSubmit={handleLogin} busy={authBusy} error={authError} />;
  }

  const training = partitions.training;
  const trainingBody = training?.body ?? {};

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Ainhoa OS</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">OS</h1>
          <p className="mt-1 text-sm text-gray-600">Private operating system — review before anything becomes true.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Link href="/life" className="hover:text-gray-900">
            Timeline
          </Link>
          <Link href="/life/noa" className="hover:text-gray-900">
            NOA
          </Link>
          <button type="button" onClick={() => void handleSignOut()} className="hover:text-gray-900">
            Sign out
          </button>
        </nav>
      </header>

      {error ? (
        <p className="whitespace-pre-wrap border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading && entries.length === 0 ? <p className="text-sm text-gray-500">Loading…</p> : null}

      <section className="space-y-3">
        <div className="border-b border-gray-100 pb-1">
          <h2 className="text-lg font-semibold text-gray-900">Today</h2>
          <p className="text-sm text-gray-600">Current active training focus.</p>
        </div>
        {training ? (
          <div className="border border-gray-200 bg-gray-50 px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Linked belief / pattern</p>
            <p className="mt-1 text-base font-medium text-gray-900">
              {String(trainingBody.linked_entry_code ?? "")}
              {trainingBody.linked_title ? ` — ${String(trainingBody.linked_title)}` : ""}
            </p>
            <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Chosen belief / working statement</p>
            <p className="mt-1 text-sm text-gray-800">{String(trainingBody.chosen_belief ?? training.summary ?? "")}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Small training instruction</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-gray-800">
              {Array.isArray(trainingBody.practice_steps)
                ? trainingBody.practice_steps.map((step) => (
                    <li key={String(step)}>{String(step)}</li>
                  ))
                : null}
            </ol>
            {trainingBody.sleep_question ? (
              <p className="mt-3 text-sm text-gray-700">
                Sleep question: {String(trainingBody.sleep_question)}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-gray-600">
              Next review:{" "}
              {training.reviewAt
                ? new Date(training.reviewAt).toLocaleDateString()
                : "not set"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No active training item.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="border-b border-gray-100 pb-1">
          <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-600">Raw or AI-processed items waiting for review.</p>
        </div>

        <form onSubmit={(event) => void handleCapture(event)} className="space-y-3">
          <label className="block text-sm text-gray-700">
            Capture a raw thought
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={4}
              className="mt-1 w-full border border-gray-300 px-3 py-2 text-base"
              placeholder="I keep asking for workout advice but still haven’t trained consistently for more than 3 days."
            />
          </label>
          <button
            type="submit"
            disabled={busyId !== null || !rawText.trim()}
            className="border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busyId === "capture" ? "Saving…" : "Add to Inbox"}
          </button>
        </form>

        <div className="space-y-4">
          {openInbox.length === 0 ? (
            <p className="text-sm text-gray-500">Inbox is empty.</p>
          ) : (
            openInbox.map((item) => {
              const draft = drafts[item.id] ?? item.aiOutput;
              return (
                <article key={item.id} className="border border-gray-200 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {labelForInbox(item)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">{item.rawText}</p>

                  {!item.processed ? (
                    <button
                      type="button"
                      onClick={() => void handleProcess(item)}
                      disabled={busyId !== null}
                      className="mt-3 border border-gray-300 px-3 py-2 text-sm text-gray-800 disabled:opacity-60"
                    >
                      {busyId === item.id ? "Processing…" : "Process"}
                    </button>
                  ) : null}

                  {draft ? (
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      <p className="text-xs uppercase tracking-wide text-amber-800">
                        AI interpretation — not yet approved
                      </p>
                      <label className="block text-sm text-gray-700">
                        Candidate title
                        <input
                          value={draft.candidate_title}
                          onChange={(event) =>
                            updateDraft(item.id, { candidate_title: event.target.value })
                          }
                          className="mt-1 w-full border border-gray-300 px-3 py-2"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Possible type
                        <select
                          value={
                            OS_ENTRY_TYPES.includes(draft.possible_type as OsEntryType)
                              ? draft.possible_type
                              : "pattern"
                          }
                          onChange={(event) =>
                            updateDraft(item.id, {
                              possible_type: event.target.value as OsEntryType,
                            })
                          }
                          className="mt-1 w-full border border-gray-300 px-3 py-2"
                        >
                          {OS_ENTRY_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm text-gray-700">
                        Observation
                        <textarea
                          value={draft.observation}
                          onChange={(event) =>
                            updateDraft(item.id, { observation: event.target.value })
                          }
                          rows={3}
                          className="mt-1 w-full border border-gray-300 px-3 py-2"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Hypothesis
                        <textarea
                          value={draft.hypothesis}
                          onChange={(event) =>
                            updateDraft(item.id, { hypothesis: event.target.value })
                          }
                          rows={3}
                          className="mt-1 w-full border border-gray-300 px-3 py-2"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Unknowns (comma-separated)
                        <input
                          value={(draft.unknowns ?? []).join(", ")}
                          onChange={(event) =>
                            updateDraft(item.id, {
                              unknowns: event.target.value
                                .split(",")
                                .map((part) => part.trim())
                                .filter(Boolean),
                            })
                          }
                          className="mt-1 w-full border border-gray-300 px-3 py-2"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Question to investigate
                        <textarea
                          value={draft.question_to_investigate}
                          onChange={(event) =>
                            updateDraft(item.id, {
                              question_to_investigate: event.target.value,
                            })
                          }
                          rows={2}
                          className="mt-1 w-full border border-gray-300 px-3 py-2"
                        />
                      </label>
                      <p className="text-xs text-gray-500">Confidence: {draft.confidence}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleApprove(item)}
                          disabled={busyId !== null}
                          className="border border-gray-900 bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60"
                        >
                          {busyId === `approve-${item.id}` ? "Approving…" : "Approve into OS"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleReject(item)}
                          disabled={busyId !== null}
                          className="border border-gray-300 px-3 py-2 text-sm text-gray-800 disabled:opacity-60"
                        >
                          Reject
                        </button>
                        {!item.processed ? null : (
                          <button
                            type="button"
                            onClick={() => void handleProcess(item)}
                            disabled={busyId !== null}
                            className="border border-gray-300 px-3 py-2 text-sm text-gray-800 disabled:opacity-60"
                          >
                            Re-process
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Active</h2>
            <p className="text-sm text-gray-600">Approved OS entries with active statuses.</p>
          </div>
          <label className="text-sm text-gray-600">
            Type
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              className="ml-2 border border-gray-300 px-2 py-1"
            >
              <option value="all">All</option>
              <option value="constitution">Constitution</option>
              <option value="belief">Belief</option>
              <option value="pattern">Pattern</option>
              <option value="goal">Goal</option>
              <option value="training">Training</option>
              <option value="selection">Selection</option>
              <option value="regulation">Regulation</option>
              <option value="precedent">Precedent</option>
            </select>
          </label>
        </div>
        <div className="space-y-3">
          {filteredActive.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="border-b border-gray-100 pb-1">
          <h2 className="text-lg font-semibold text-gray-900">Integrated</h2>
        </div>
        {partitions.integrated.length === 0 ? (
          <p className="text-sm text-gray-500">None yet.</p>
        ) : (
          partitions.integrated.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        )}
      </section>

      <section className="space-y-3">
        <div className="border-b border-gray-100 pb-1">
          <h2 className="text-lg font-semibold text-gray-900">Archive</h2>
        </div>
        {partitions.archive.length === 0 ? (
          <p className="text-sm text-gray-500">None yet.</p>
        ) : (
          partitions.archive.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        )}
      </section>
    </div>
  );
}
