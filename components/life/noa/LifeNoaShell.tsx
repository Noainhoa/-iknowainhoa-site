"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import LifeLoginForm from "@/components/life/LifeLoginForm";
import LifeSetPasswordForm from "@/components/life/LifeSetPasswordForm";
import { useLifeAuth } from "@/components/life/useLifeAuth";
import { getLifeAccessToken } from "@/lib/life/os/auth";
import type { NoaAnswer } from "@/lib/life/os/types";

type UsedEntry = {
  id: string;
  entryCode: string | null;
  type: string;
  title: string;
  summary: string | null;
  status: string;
};

export default function LifeNoaShell() {
  const auth = useLifeAuth();
  return <LifeNoaSession key={auth.userId ?? "signed-out"} auth={auth} />;
}

function LifeNoaSession({ auth }: { auth: ReturnType<typeof useLifeAuth> }) {
  const {
    configured,
    supabase,
    sessionEmail,
    authBusy,
    authError,
    recoveryMode,
    finishRecovery,
    handleLogin,
    handleSignOut,
  } = auth;

  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<NoaAnswer | null>(null);
  const [used, setUsed] = useState<UsedEntry[]>([]);
  const [showUsed, setShowUsed] = useState(false);

  async function handleAsk(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !question.trim()) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    setUsed([]);
    setShowUsed(false);
    try {
      const token = await getLifeAccessToken(supabase);
      if (!token) throw new Error("Missing session token.");
      const response = await fetch("/api/life/noa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: question.trim() }),
      });
      const payload = (await response.json()) as {
        answer?: NoaAnswer;
        used?: UsedEntry[];
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "NOA request failed.");
      setAnswer(payload.answer ?? null);
      setUsed(payload.used ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NOA request failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <p className="text-sm text-gray-600">
        Configure Life Supabase env vars to use NOA.
      </p>
    );
  }

  if (recoveryMode) {
    return <LifeSetPasswordForm onDone={finishRecovery} />;
  }

  if (!sessionEmail) {
    return <LifeLoginForm onSubmit={handleLogin} busy={authBusy} error={authError} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Ainhoa OS</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">NOA</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ask a current-life question. Answers use only approved OS material.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Link href="/life/os" className="hover:text-gray-900">
            OS
          </Link>
          <Link href="/life" className="hover:text-gray-900">
            Timeline
          </Link>
          <button type="button" onClick={() => void handleSignOut()} className="hover:text-gray-900">
            Sign out
          </button>
        </nav>
      </header>

      <form onSubmit={(event) => void handleAsk(event)} className="space-y-3">
        <label className="block text-sm text-gray-700">
          Current question
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={5}
            className="mt-1 w-full border border-gray-300 px-3 py-3 text-base leading-relaxed"
            placeholder="I’m angry and want to send another message. Should I?"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="w-full border border-gray-900 bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Thinking…" : "Ask NOA"}
        </button>
      </form>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {answer ? (
        <section className="space-y-4 border border-gray-200 px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Answer</h2>
            <p className="mt-2 whitespace-pre-wrap text-base text-gray-900">{answer.answer}</p>
          </div>
          <dl className="space-y-3 border-t border-gray-100 pt-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Fact</dt>
              <dd className="mt-1 text-gray-800">{answer.fact || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Interpretation</dt>
              <dd className="mt-1 text-gray-800">{answer.interpretation || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Feeling / state</dt>
              <dd className="mt-1 text-gray-800">{answer.feeling_state || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Relevant principle</dt>
              <dd className="mt-1 text-gray-800">{answer.relevant_principle || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Suggested next step</dt>
              <dd className="mt-1 text-gray-800">{answer.suggested_next_step || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Unknowns</dt>
              <dd className="mt-1 text-gray-800">
                {answer.unknowns?.length ? answer.unknowns.join(" · ") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Uncertainty</dt>
              <dd className="mt-1 text-gray-800">{answer.uncertainty || "—"}</dd>
            </div>
          </dl>

          <div className="border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={() => setShowUsed((value) => !value)}
              className="text-sm text-gray-700 underline-offset-2 hover:underline"
            >
              {showUsed ? "Hide relevant OS material used" : "Relevant OS material used"}
            </button>
            {showUsed ? (
              <ul className="mt-3 space-y-2">
                {used.length === 0 ? (
                  <li className="text-sm text-gray-500">No entries selected.</li>
                ) : (
                  used.map((entry) => (
                    <li key={entry.id} className="border border-gray-100 px-3 py-2 text-sm">
                      <p className="font-medium text-gray-900">
                        {entry.entryCode ? `${entry.entryCode} — ` : ""}
                        {entry.title}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {entry.type} · {entry.status}
                      </p>
                      {entry.summary ? (
                        <p className="mt-1 text-gray-700">{entry.summary}</p>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
