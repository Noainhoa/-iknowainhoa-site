import { cookies } from "next/headers";

const LOCALE_COOKIE_KEY = "preferred_locale";

/** Tech Made Easy is Spanish and English only. */
export type TechLocale = "es" | "en";

function isTechLocale(value: string | null | undefined): value is TechLocale {
  return value === "es" || value === "en";
}

/**
 * Explicit ?lang= wins, then the shared cookie when it is es or en, then Spanish.
 * A French cookie falls back to Spanish on this service only.
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
  return value === "en" ? "en" : "es";
}
