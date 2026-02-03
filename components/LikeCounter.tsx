"use client";

import { useEffect, useState } from "react";

/**
 * Simple local like counter with a playful message.
 * Value is kept in localStorage so it survives refreshes.
 */
export default function LikeCounter({
  flag,
  countryCode,
  variant = "card",
}: {
  flag?: string;
  countryCode?: string;
  variant?: "card" | "inline";
}) {
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
        padding: variant === "card" ? "24px" : 0,
        borderRadius: variant === "card" ? "16px" : 0,
        border: variant === "card" ? "1px solid var(--border)" : "none",
        background: variant === "card" ? "var(--card)" : "transparent",
        display: "grid",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: variant === "card" ? "flex-start" : "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              I like it because it is free
              <span aria-hidden="true" style={{ fontSize: 18 }}>♥</span>
            </h3>
            {flag ? (
              <span
                aria-label={`flag ${countryCode || ""}`}
                style={{ fontSize: 16, display: "inline-flex", alignItems: "center" }}
              >
                {flag}
              </span>
            ) : null}
            {flag ? (
              <span
                style={{
                  fontSize: 12,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {countryCode || "??"}
              </span>
            ) : null}
          </div>
          {variant === "card" && (
            <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.5, fontSize: 15 }}>
              Tap the button and watch the number climb. It&apos;s just for fun, and it lives in your browser.
            </p>
          )}
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
      </div>
    </section>
  );
}
