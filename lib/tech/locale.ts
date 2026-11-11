import { cookies } from "next/headers";

const LOCALE_COOKIE_KEY = "preferred_locale";

/** Tech Made Easy: Spanish, English, and Dutch. */
export type TechLocale = "es" | "en" | "nl";

export function isTechLocale(value: string | null | undefined): value is TechLocale {
  return value === "es" || value === "en" || value === "nl";
}

/**
 * Explicit ?lang= wins, then the shared cookie when it is es, en, or nl, then Spanish.
 * A French (or other) cookie falls back to Spanish on this service only.
 */
export function resolveTechLocale(
  langParam?: string | null,
  cookieValue?: string | null
): TechLocale {
  if (isTechLocale(langParam)) return langParam;
  if (isTechLocale(cookieValue)) return cookieValue;
  return "es";
}

export async function getTechLocale(langParam?: string | string[]): Promise<TechLocale> {
  const raw = Array.isArray(langParam) ? langParam[0] : langParam;
  const cookieStore = await cookies();
  return resolveTechLocale(raw, cookieStore.get(LOCALE_COOKIE_KEY)?.value);
}

export function localeFromBody(value: unknown): TechLocale {
  if (value === "en" || value === "nl") return value;
  return "es";
}
