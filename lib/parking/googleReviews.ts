import type { Locale } from "@/lib/i18n/shared";

/** Google Business Profile / Maps listing (stable short link). */
export const PARKING_GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/n1NLod2HCPh9pNYA6";

/** Aggregate rating from the live Google listing — update when reviews change. */
export const PARKING_GOOGLE_RATING = {
  ratingValue: 5,
  reviewCount: 1,
} as const;

export type ParkingGoogleReview = {
  id: string;
  author: string;
  quote: Record<Locale, string>;
};

/**
 * Curated Google reviews shown on the parking page.
 * Add entries here when new reviews appear; the strip auto-rotates for 2+.
 */
export const PARKING_GOOGLE_REVIEWS: ParkingGoogleReview[] = [
  {
    id: "jose-flores",
    author: "Jose Flores",
    quote: {
      es: "Todo perfecto, máxima atención y amabilidad. Muy recomendable.",
      en: "Everything was perfect, excellent service and friendliness. Highly recommended.",
      fr: "Tout était parfait, un service et une amabilité excellents. Je recommande vivement.",
    },
  },
];

export function parkingGoogleQuote(
  review: ParkingGoogleReview,
  locale: Locale
): string {
  return review.quote[locale] ?? review.quote.en;
}
