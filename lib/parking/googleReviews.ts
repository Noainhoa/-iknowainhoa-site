import type { Locale } from "@/lib/i18n/shared";

/** Google Business Profile / Maps listing (stable short link). */
export const PARKING_GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/n1NLod2HCPh9pNYA6";

/** Aggregate rating from the live Google listing — update when reviews change. */
export const PARKING_GOOGLE_RATING = {
  ratingValue: 4.5,
  reviewCount: 2,
} as const;

export type ParkingGoogleReview = {
  id: string;
  author: string;
  quote: Record<Locale, string>;
};

/**
 * Curated Google reviews shown on the parking page.
 * Keep source wording exact for the original language; other locales are translations.
 * The strip auto-rotates (and shows arrows) for 2+.
 */
export const PARKING_GOOGLE_REVIEWS: ParkingGoogleReview[] = [
  {
    id: "geert-sikkens",
    author: "Geert Sikkens",
    quote: {
      // Exact English text from Google Maps.
      en: "Perfect parking close to the postoffice and 5 minutes walk to the beach. Only for normal cars, because the cealing behind the entrance is to low for a van.",
      es: "Parking perfecto cerca de Correos y a 5 minutos andando de la playa. Solo para coches normales, porque el techo detrás de la entrada es demasiado bajo para una furgoneta.",
      fr: "Parking parfait près de la poste et à 5 minutes à pied de la plage. Uniquement pour les voitures normales, car le plafond derrière l’entrée est trop bas pour un van.",
    },
  },
  {
    id: "jose-flores",
    author: "Jose Flores",
    quote: {
      // Exact Spanish text from Google Maps.
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
