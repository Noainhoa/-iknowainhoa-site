"use client";

import Link from "next/link";
import LifeLoginForm from "@/components/life/LifeLoginForm";
import LifeTimeline from "@/components/life/timeline/LifeTimeline";
import { useLifeSession } from "@/components/life/useLifeSession";

export default function LifeTimelineShell() {
  const {
    configured,
    sessionEmail,
    authBusy,
    authError,
    groups,
    loading,
    loadError,
    handleLogin,
  } = useLifeSession();

  if (!configured) {
    return (
      <p className="text-sm text-gray-600">
        Configure <code className="text-xs">NEXT_PUBLIC_LIFE_SUPABASE_URL</code> and{" "}
        <code className="text-xs">NEXT_PUBLIC_LIFE_SUPABASE_PUBLISHABLE_KEY</code>, then run{" "}
        <code className="text-xs">supabase/life.sql</code> in the ainhoa-life project.
      </p>
    );
  }

  if (!sessionEmail) {
    return <LifeLoginForm onSubmit={handleLogin} busy={authBusy} error={authError} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Life</h1>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Link href="/life/os" className="hover:text-gray-900">
            OS
          </Link>
          <Link href="/life/noa" className="hover:text-gray-900">
            NOA
          </Link>
          <Link href="/life/manage" className="hover:text-gray-900">
            Manage
          </Link>
        </nav>
      </header>

      {loadError ? (
        <p className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      {loading && groups.length === 0 ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <LifeTimeline groups={groups} />
      )}
    </div>
  );
}
