export type AniccaAnalyticsEvent =
  | { name: "anicca_view" }
  | { name: "anicca_variant_select"; variantId: string }
  | { name: "anicca_checkout_click"; variantId: string }
  | { name: "anicca_checkout_blocked"; variantId: string; reason: "sold_out" | "no_payment_url" };

/** Compatible stub — hook into site analytics when available (same pattern as parking). */
export function trackAniccaEvent(event: AniccaAnalyticsEvent): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[anicca]", event);
  }
  // TODO: forward to existing analytics when the site adds a provider
}
