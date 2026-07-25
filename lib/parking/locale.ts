import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n/shared";

const LOCALE_COOKIE_KEY = "preferred_locale";

/**
 * Locale for the parking page only.
 * Prefer explicit ?lang=, then cookie, then Spanish (primary audience).
 */
export async function getParkingLocale(
  langParam?: string | string[]
): Promise<Locale> {
  const raw = Array.isArray(langParam) ? langParam[0] : langParam;
  if (isLocale(raw)) return raw;

  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  if (isLocale(value)) return value;

  return "es";
}
