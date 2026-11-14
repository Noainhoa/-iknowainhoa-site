import type { Locale } from "@/lib/i18n/shared";
import { PARKING_CONDITIONS_PATH } from "@/lib/parking/conditionsContent";
import { PARKING_PRIVACY_PATH } from "@/lib/parking/privacyContent";

export { PARKING_PRIVACY_PATH, PARKING_CONDITIONS_PATH };
export const PARKING_ORIGIN = "https://iknowainhoa.com";
export const PARKING_PATH = "/parking-guardamar-centro";

/** Verified garage entrance coordinates (WGS84). */
export const PARKING_GEO = {
  latitude: 38.08556260856233,
  longitude: -0.6488313283580208,
} as const;

export {
  PARKING_GOOGLE_MAPS_URL,
  PARKING_GOOGLE_RATING,
  PARKING_GOOGLE_REVIEWS,
  parkingGoogleQuote,
  type ParkingGoogleReview,
} from "@/lib/parking/googleReviews";

/** Absolute public parking URL (Spanish = bare path). */
export function parkingCanonicalUrl(locale: Locale): string {
  if (locale === "es") return `${PARKING_ORIGIN}${PARKING_PATH}`;
  return `${PARKING_ORIGIN}${PARKING_PATH}?lang=${locale}`;
}

/** Relative parking href for in-app links. */
export function parkingHref(locale: Locale): string {
  if (locale === "es") return PARKING_PATH;
  return `${PARKING_PATH}?lang=${locale}`;
}

export function parkingPrivacyCanonicalUrl(locale: Locale): string {
  if (locale === "es") return `${PARKING_ORIGIN}${PARKING_PRIVACY_PATH}`;
  return `${PARKING_ORIGIN}${PARKING_PRIVACY_PATH}?lang=${locale}`;
}

export function parkingPrivacyHref(locale: Locale): string {
  if (locale === "es") return PARKING_PRIVACY_PATH;
  return `${PARKING_PRIVACY_PATH}?lang=${locale}`;
}

export function parkingConditionsCanonicalUrl(locale: Locale): string {
  if (locale === "es") return `${PARKING_ORIGIN}${PARKING_CONDITIONS_PATH}`;
  return `${PARKING_ORIGIN}${PARKING_CONDITIONS_PATH}?lang=${locale}`;
}

export function parkingConditionsHref(locale: Locale): string {
  if (locale === "es") return PARKING_CONDITIONS_PATH;
  return `${PARKING_CONDITIONS_PATH}?lang=${locale}`;
}

export function parkingHreflangMap(): Record<string, string> {
  return {
    es: parkingCanonicalUrl("es"),
    en: parkingCanonicalUrl("en"),
    fr: parkingCanonicalUrl("fr"),
    "x-default": parkingCanonicalUrl("es"),
  };
}

export function parkingPrivacyHreflangMap(): Record<string, string> {
  return {
    es: parkingPrivacyCanonicalUrl("es"),
    en: parkingPrivacyCanonicalUrl("en"),
    fr: parkingPrivacyCanonicalUrl("fr"),
    "x-default": parkingPrivacyCanonicalUrl("es"),
  };
}

export function parkingConditionsHreflangMap(): Record<string, string> {
  return {
    es: parkingConditionsCanonicalUrl("es"),
    en: parkingConditionsCanonicalUrl("en"),
    fr: parkingConditionsCanonicalUrl("fr"),
    "x-default": parkingConditionsCanonicalUrl("es"),
  };
}

/** True when a parking public page should drop `lang` from the URL. */
export function shouldStripParkingLangParam(
  pathname: string,
  lang: string | null
): boolean {
  const path = pathname.toLowerCase();
  const isPublicParking =
    path === PARKING_PATH ||
    path === PARKING_PRIVACY_PATH ||
    path === PARKING_CONDITIONS_PATH;
  if (!isPublicParking || lang == null) return false;
  if (lang === "es") return true;
  return lang !== "en" && lang !== "fr";
}
