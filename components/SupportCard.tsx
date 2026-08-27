"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";

const presetAmounts = [5, 10, 25];
type Currency = "eur" | "usd" | "gbp";
const SYMBOLS: Record<Currency, string> = {
  eur: "€",
  usd: "$",
  gbp: "£",
};

type Props = {
  locale?: Locale;
  buttonText?: string;
  cancelUrl?: string;
  variant?: "default" | "compact";
  hideBadges?: boolean;
};

export function SupportCard({
  locale = "en",
  buttonText,
  cancelUrl,
  variant = "default",
}: Props) {
  const copy = getDictionary(locale).support;
  const resolvedButtonText = buttonText ?? copy.contributeFor;
  const [currency, setCurrency] = useState<Currency>("eur");
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
  const compact = variant === "compact";

  async function handleCheckout() {
    const numericAmount = Number(displayAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert(copy.enterAmount);
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
      alert(copy.checkoutFail);
      setLoading(false);
    }
  }

  return (
    <div
      className={[
        "mx-auto flex w-full max-w-[960px] flex-nowrap items-center justify-between gap-3 overflow-x-auto rounded-full bg-neutral-100",
        compact ? "px-3.5 py-2.5" : "px-5 py-3.5",
      ].join(" ")}
    >
      <div className="flex shrink-0 items-center gap-2.5">
        <Heart
          className="shrink-0 text-neutral-900"
          size={compact ? 18 : 20}
          strokeWidth={1.75}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="m-0 text-[0.95rem] font-bold leading-tight tracking-tight text-neutral-900 whitespace-nowrap">
            {copy.title}
          </p>
          <p className="mt-0.5 mb-0 hidden text-[0.75rem] leading-snug text-neutral-500 whitespace-nowrap sm:block">
            {copy.subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div
          className="inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white p-1"
          role="group"
          aria-label={copy.chooseAmount}
        >
          {presetAmounts.map((amount) => {
            const active = selectedAmount === amount && !isCustom;
            return (
              <button
                key={amount}
                type="button"
                className={[
                  "cursor-pointer rounded-full border-0 px-3 py-2 text-sm font-medium leading-none whitespace-nowrap transition-colors",
                  active
                    ? "bg-neutral-900 text-white"
                    : "bg-transparent text-neutral-900 hover:bg-neutral-100",
                ].join(" ")}
                onClick={() => {
                  setSelectedAmount(amount);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
              >
                {symbol}
                {amount}
              </button>
            );
          })}

          <span className="mx-1 h-4 w-px shrink-0 bg-neutral-200" aria-hidden />

          <button
            type="button"
            className={[
              "cursor-pointer rounded-full border-0 px-3 py-2 text-sm font-medium leading-none whitespace-nowrap transition-colors",
              isCustom
                ? "bg-neutral-900 text-white"
                : "bg-transparent text-neutral-900 hover:bg-neutral-100",
            ].join(" ")}
            onClick={() => {
              setIsCustom(true);
              setSelectedAmount(null);
            }}
          >
            {isCustom ? (
              <span className="inline-flex items-center gap-0.5">
                <span>{symbol}</span>
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="…"
                  aria-label={copy.customAmount}
                  autoFocus
                  className="w-10 appearance-none border-0 bg-transparent p-0 text-sm font-medium text-inherit outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </span>
            ) : (
              copy.custom
            )}
          </button>
        </div>

        <button
          type="button"
          className="cursor-pointer rounded-full border-0 bg-neutral-900 px-4 py-2.5 text-sm font-semibold leading-none whitespace-nowrap text-white transition enabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          onClick={handleCheckout}
          disabled={!displayAmount || loading}
        >
          {loading
            ? copy.processing
            : `${resolvedButtonText} ${symbol}${displayAmount || "…"}`}
        </button>
      </div>
    </div>
  );
}
