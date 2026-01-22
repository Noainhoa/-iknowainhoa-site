"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, BadgeCheck, Link as LinkIcon } from "lucide-react";

type Props = {
  /** Optional page URL to return to on cancel; defaults to current location. */
  cancelUrl?: string;
};

export function DonateSlider({ cancelUrl }: Props) {
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const currencies = ["eur", "usd", "gbp"] as const;
  const [currency, setCurrency] = useState<(typeof currencies)[number]>("eur");

  // Guess a sensible default currency from the browser locale.
  useEffect(() => {
    const locale = typeof window !== "undefined" ? window.navigator.language : "en";
    if (locale.toLowerCase().startsWith("en-gb")) setCurrency("gbp");
    else if (locale.toLowerCase().startsWith("en-us")) setCurrency("usd");
    else setCurrency("eur");
  }, []);

  const formattedAmount = useMemo(() => {
    if (amount === "" || !Number.isFinite(Number(amount))) return "";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(amount));
    } catch {
      return `${currency.toUpperCase()} ${amount}`;
    }
  }, [amount, currency]);

  async function handleCheckout() {
    if (loading) return;
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

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

      if (!res.ok) throw new Error("Checkout request failed");

      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">Pay what you want</div>
        <div className="text-xs text-gray-500 uppercase">{currency}</div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              step="0.5"
              placeholder="2"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg font-semibold text-gray-900 shadow-inner focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as (typeof currencies)[number])}
              className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium uppercase text-gray-700 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-gray-900">
            {formattedAmount || "—"}
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-black px-5 text-base font-semibold text-white transition hover:translate-y-[-1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Processing..." : "Support my Journey"}
        </button>

        <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
            <CreditCard size={14} /> Apple Pay
          </span>
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
            <BadgeCheck size={14} /> Google Pay
          </span>
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
            <LinkIcon size={14} /> Link
          </span>
          <span className="text-gray-400">Zero friction checkout</span>
        </div>
      </div>
    </div>
  );
}
