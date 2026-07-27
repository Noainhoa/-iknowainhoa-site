import type { Locale } from "@/lib/i18n/shared";
import { PARKING_PRIVACY_PATH } from "@/lib/parking/privacyContent";

export { PARKING_PRIVACY_PATH };
export const PARKING_ORIGIN = "https://iknowainhoa.com";
export const PARKING_PATH = "/parking-guardamar-centro";

/** Verified garage entrance coordinates (WGS84). */
export const PARKING_GEO = {
  latitude: 38.08556260856233,
  longitude: -0.6488313283580208,
} as const;

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

/** True when a parking public page should drop `lang` from the URL. */
export function shouldStripParkingLangParam(
  pathname: string,
  lang: string | null
): boolean {
  const path = pathname.toLowerCase();
  const isPublicParking =
    path === PARKING_PATH || path === PARKING_PRIVACY_PATH;
  if (!isPublicParking || lang == null) return false;
  if (lang === "es") return true;
  return lang !== "en" && lang !== "fr";
}
