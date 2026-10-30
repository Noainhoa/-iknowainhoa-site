import { TECH_PATH } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";

export const TECH_ORIGIN = "https://iknowainhoa.com";

export function techCanonicalUrl(locale: TechLocale): string {
  if (locale === "es") return `${TECH_ORIGIN}${TECH_PATH}`;
  return `${TECH_ORIGIN}${TECH_PATH}?lang=en`;
}

/** Spanish URLs stay bare. English keeps ?lang=en. French and other langs are stripped. */
export function shouldStripTechLangParam(pathname: string, lang: string | null): boolean {
  const path = pathname.toLowerCase();
  if (path !== TECH_PATH || lang == null) return false;
  return lang !== "en";
}
