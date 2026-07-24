import { cookies, headers } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n/shared";

const DEFAULT_LOCALE: Locale = "en";
const LOCALE_COOKIE_KEY = "preferred_locale";

function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tagRaw, qRaw] = part.trim().split(";q=");
      const tag = tagRaw.toLowerCase();
      const q = qRaw === undefined ? 1 : Number.parseFloat(qRaw);
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("en")) return "en";
  }
  return null;
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  if (isLocale(value)) return value;

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language")) ?? DEFAULT_LOCALE;
}
