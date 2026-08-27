"use client";

import { FormEvent, useState } from "react";

type LifeLoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  busy: boolean;
  error: string | null;
};

export default function LifeLoginForm({ onSubmit, busy, error }: LifeLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Sign in to Life</h2>
      <p className="mt-1 text-sm text-gray-600">Private personal data. Authentication required.</p>
      <form className="mt-4 flex flex-col gap-3" onSubmit={(event) => void handleSubmit(event)}>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
