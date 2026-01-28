"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [label, setLabel] = useState("Copy");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setLabel("Copied!");
      setTimeout(() => setLabel("Copy"), 1400);
    } catch {
      setLabel("Copy failed");
      setTimeout(() => setLabel("Copy"), 1400);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="copy-link-btn inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={`Copy ${text}`}
    >
      {label}
    </button>
  );
}
