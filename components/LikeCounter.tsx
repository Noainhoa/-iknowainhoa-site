"use client";

import { useEffect, useState } from "react";

/**
 * Simple local like counter with a playful message.
 * Value is kept in localStorage so it survives refreshes.
 */
export default function LikeCounter() {
  const [count, setCount] = useState<number | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = localStorage.getItem("iknowainhoa-like-counter");
    setCount(stored ? Number(stored) : 0);
  }, []);

  // Persist whenever the count changes after hydration.
  useEffect(() => {
    if (count === null) return;
    localStorage.setItem("iknowainhoa-like-counter", String(count));
  }, [count]);

  const increment = () => {
    setCount((prev) => (prev ?? 0) + 1);
  };

  return (
    <section
      style={{
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        background: "var(--card)",
        display: "grid",
        gap: "12px",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 14, letterSpacing: 0.4, textTransform: "uppercase", opacity: 0.6 }}>
          Tiny counter
        </p>
        <h3 style={{ margin: "6px 0 4px 0", fontSize: 22, fontWeight: 700 }}>
          I like it because it is free
        </h3>
        <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.5, fontSize: 15 }}>
          Tap the button and watch the number climb. It&apos;s just for fun, and it lives in your browser.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={increment}
          disabled={count === null}
          style={{
            padding: "12px 18px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--primary)",
            color: "var(--primary-contrast)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            opacity: count === null ? 0.7 : 1,
          }}
        >
          Count me in
        </button>
        <div
          style={{
            minWidth: 72,
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px dashed var(--border)",
            background: "var(--muted)",
            fontSize: 18,
            fontWeight: 700,
            textAlign: "center",
          }}
          aria-live="polite"
        >
          {count === null ? "…" : count}
        </div>
      </div>
    </section>
  );
}
