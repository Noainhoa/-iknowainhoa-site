export type AniccaAnalyticsEvent =
  | { name: "anicca_view" }
  | { name: "anicca_variant_selected"; variantId: string }
  | { name: "anicca_checkout_clicked"; variantId: string }
  | { name: "anicca_checkout_blocked"; variantId: string; reason: "sold_out" | "no_payment_url" };

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
};

/**
 * Lightweight funnel events for the first-sale experiment.
 * Forwards to gtag / dataLayer when a provider is present; otherwise logs in development.
 * Stripe Payment Link completion is not attributed from this site (see docs/anicca.md).
 */
export function trackAniccaEvent(event: AniccaAnalyticsEvent): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.debug("[anicca]", event);
  }

  const { name, ...params } = event;
  const w = window as AnalyticsWindow;

  try {
    w.gtag?.("event", name, params);
    w.dataLayer?.push({ event: name, ...params });
  } catch {
    // Analytics must never interrupt checkout.
  }
}
