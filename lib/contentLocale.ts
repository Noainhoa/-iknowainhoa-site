import type { Locale } from "@/lib/i18n/shared";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

type LocalizedMap = Partial<Record<Locale, string>> & { en?: string; es?: string; fr?: string };

/**
 * Resolve a localized string from frontmatter.
 * Supports:
 * - title + title_es / title_en / title_fr
 * - title: { en: "...", es: "..." }
 * Falls back: requested locale → en → bare field → undefined
 */
export function pickLocalizedField(
  data: Record<string, unknown> | undefined,
  field: string,
  locale: Locale,
  bareFallback?: string
): string | undefined {
  if (!data) return bareFallback?.trim() || undefined;

  const nested = data[field];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const map = nested as LocalizedMap;
    const fromMap =
      (typeof map[locale] === "string" && map[locale]?.trim()) ||
      (typeof map.en === "string" && map.en.trim()) ||
      undefined;
    if (fromMap) return fromMap;
  }

  const keyed = data[`${field}_${locale}`];
  if (typeof keyed === "string" && keyed.trim()) return keyed.trim();

  if (locale !== "en") {
    const enKeyed = data[`${field}_en`];
    if (typeof enKeyed === "string" && enKeyed.trim()) return enKeyed.trim();
  }

  if (typeof nested === "string" && nested.trim()) return nested.trim();
  if (typeof bareFallback === "string" && bareFallback.trim()) return bareFallback.trim();
  return undefined;
}

/**
 * Split markdown body into locale sections marked as:
 *   <!-- lang:en -->
 *   ...
 *   <!-- lang:es -->
 *   ...
 * If no markers, the whole body is the default (used for every locale).
 */
export function splitLocalizedMarkdown(markdown: string): {
  sections: Partial<Record<Locale, string>>;
  defaultBody: string;
} {
  const source = markdown || "";
  const marker = /<!--\s*lang:(en|es|fr)\s*-->/gi;
  const matches = [...source.matchAll(marker)];

  if (matches.length === 0) {
    return { sections: {}, defaultBody: source.trim() };
  }

  const sections: Partial<Record<Locale, string>> = {};
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const locale = match[1].toLowerCase() as Locale;
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? source.length) : source.length;
    const chunk = source.slice(start, end).trim();
    if (chunk) sections[locale] = chunk;
  }

  const defaultBody = sections.en || Object.values(sections).find(Boolean) || source.trim();
  return { sections, defaultBody };
}

export function pickLocalizedMarkdown(markdown: string, locale: Locale): string {
  const { sections, defaultBody } = splitLocalizedMarkdown(markdown);
  return sections[locale] || sections.en || defaultBody;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(markdown);
  return processed.toString();
}
