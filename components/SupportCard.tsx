"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";

const presetAmounts = [5, 10, 25];
const SUPPORTED: Array<"eur" | "usd" | "gbp"> = ["eur", "usd", "gbp"];
const SYMBOLS: Record<(typeof SUPPORTED)[number], string> = {
  eur: "€",
  usd: "$",
  gbp: "£",
};

type Props = {
  buttonText?: string;
  cancelUrl?: string;
  variant?: "default" | "compact";
  hideBadges?: boolean;
};

export function SupportCard({
  buttonText = "Support with",
  cancelUrl,
  variant = "default",
  hideBadges = false,
}: Props) {
  const [currency, setCurrency] = useState<(typeof SUPPORTED)[number]>("eur");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const locale = typeof window !== "undefined" ? window.navigator.language : "en";
    if (locale.toLowerCase().startsWith("en-gb")) setCurrency("gbp");
    else if (locale.toLowerCase().startsWith("en-us")) setCurrency("usd");
    else setCurrency("eur");
  }, []);

  const displayAmount = useMemo(() => {
    if (isCustom) return customAmount;
    return selectedAmount ?? "";
  }, [isCustom, customAmount, selectedAmount]);

  const symbol = SYMBOLS[currency];

  // Keep currency selection internal; Stripe will handle any card-side conversion.
  function cycleCurrency() {
    const idx = SUPPORTED.indexOf(currency);
    const next = SUPPORTED[(idx + 1) % SUPPORTED.length];
    setCurrency(next);
  }

  async function handleCheckout() {
    const numericAmount = Number(displayAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Please enter an amount greater than 0.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dynamicAmount: numericAmount,
          currency,
          cancelUrl: cancelUrl || window.location.href,
        }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("No checkout URL");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  const padding = variant === "compact" ? 14 : 20;
  const cardWidth = variant === "compact" ? 400 : 440;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: cardWidth,
        margin: "0 auto",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding,
        background: "var(--card)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--muted)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Heart size={16} color="#111827" fill="#111827" />
        </div>
        <h3
          style={{
            fontSize: variant === "compact" ? 16 : 18,
            fontWeight: 600,
            margin: "0 0 4px 0",
            color: "var(--foreground)",
          }}
        >
          Support my work
        </h3>
        <p style={{ fontSize: 12, color: "rgba(107,114,128,0.9)", margin: 0 }}>
          Your support helps me create more content
        </p>
      </div>

      {/* Presets row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setSelectedAmount(amount);
              setIsCustom(false);
              setCustomAmount("");
            }}
            style={{
              flex: 1,
              padding: variant === "compact" ? "9px 8px" : "10px 8px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              border: "1px solid transparent",
              background:
                selectedAmount === amount && !isCustom ? "#111827" : "#f3f4f6",
              color:
                selectedAmount === amount && !isCustom ? "#ffffff" : "#111827",
              boxShadow:
                selectedAmount === amount && !isCustom
                  ? "0 10px 25px rgba(17,24,39,0.12)"
                  : "none",
              transition: "all 150ms ease",
            }}
          >
            {symbol}
            {amount}
          </button>
        ))}

        <button
          onClick={() => {
            setIsCustom(true);
            setSelectedAmount(null);
          }}
          style={{
            flex: 1,
            padding: variant === "compact" ? "9px 8px" : "10px 8px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            border: isCustom ? "1px solid #111827" : "1px solid transparent",
            background: "#f3f4f6",
            color: isCustom ? "#111827" : "#6b7280",
            transition: "all 150ms ease",
          }}
        >
          {isCustom ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{symbol}</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="..."
                style={{
                  background: "transparent",
                  textAlign: "center",
                  outline: "none",
                  border: "none",
                  width: 48,
                  fontSize: 14,
                  color: "#111827",
                }}
                autoFocus
              />
            </div>
          ) : (
            "Other"
          )}
        </button>
      </div>

      {/* Currency hint intentionally hidden; Stripe handles conversion at checkout. */}

      {/* CTA */}
      <button
        onClick={handleCheckout}
        disabled={!displayAmount || loading}
        style={{
          width: "100%",
          padding: variant === "compact" ? "12px 12px" : "14px 12px",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 15,
          background: "#111827",
          color: "#ffffff",
          border: "none",
          cursor: !displayAmount || loading ? "not-allowed" : "pointer",
          opacity: !displayAmount || loading ? 0.6 : 1,
          transition: "transform 150ms ease, box-shadow 150ms ease",
          boxShadow: "0 10px 25px rgba(17,24,39,0.14)",
        }}
      >
        {loading ? "Processing..." : `${buttonText} ${symbol}${displayAmount || "..."}`}
      </button>

      {/* Payment methods */}
      {!hideBadges && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 14,
            color: "#6b7280",
            fontSize: 11,
          }}
        >
          <span>Apple Pay</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#e5e7eb" }} />
          <span>Google Pay</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#e5e7eb" }} />
          <span>Card</span>
        </div>
      )}
    </div>
  );
}
