import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n/shared";

const DEFAULT_LOCALE: Locale = "en";
const LOCALE_COOKIE_KEY = "preferred_locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

