import { TECH_PATH } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";

export const TECH_ORIGIN = "https://iknowainhoa.com";
export const TECH_ADMIN_PATH = `${TECH_PATH}/admin`;

/**
 * Keep this module free of node:crypto — middleware imports shouldStripTechLangParam
 * and must remain Edge-compatible.
 */
function isAdminReference(value: string): boolean {
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(value);
}

/** Relative public page href. Spanish stays bare; en/nl keep ?lang=. */
export function techPageHref(locale: TechLocale): string {
  if (locale === "es") return TECH_PATH;
  return `${TECH_PATH}?lang=${locale}`;
}

/** Relative private manage/cancel path. */
export function techBookingManagePath(token: string, locale: TechLocale = "es"): string {
  const base = `${TECH_PATH}/reserva/${encodeURIComponent(token)}`;
  if (locale === "es") return base;
  return `${base}?lang=${locale}`;
}

export function techCanonicalUrl(locale: TechLocale): string {
  if (locale === "es") return `${TECH_ORIGIN}${TECH_PATH}`;
  return `${TECH_ORIGIN}${TECH_PATH}?lang=${locale}`;
}

/** Absolute admin deep link for owner notification emails (auth still required). */
export function techAdminFocusUrl(focus: "booking" | "request", reference: string): string {
  const ref = reference.trim().toUpperCase();
  const params = new URLSearchParams({ focus, ref });
  return `${TECH_ORIGIN}${TECH_ADMIN_PATH}?${params.toString()}`;
}

/** Private customer manage/cancel URL. Pass the raw token only in memory / customer email. */
export function techBookingManageUrl(token: string, locale: TechLocale = "es"): string {
  return `${TECH_ORIGIN}${techBookingManagePath(token, locale)}`;
}

export function parseAdminFocus(
  focus: string | null,
  ref: string | null
): { focus: "booking" | "request"; ref: string } | null {
  if ((focus !== "booking" && focus !== "request") || !ref) return null;
  const normalized = ref.trim().toUpperCase();
  if (!isAdminReference(normalized)) return null;
  return { focus, ref: normalized };
}

/** Spanish URLs stay bare. English and Dutch keep ?lang=. Other langs are stripped. */
export function shouldStripTechLangParam(pathname: string, lang: string | null): boolean {
  const path = pathname.toLowerCase();
  if (path !== TECH_PATH || lang == null) return false;
  return lang !== "en" && lang !== "nl";
}
