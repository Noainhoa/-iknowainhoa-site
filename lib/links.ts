import { site } from "@/lib/site";

/**
 * Site-wide hyperlink behavior:
 * - Same origin (and relative paths): same tab
 * - mailto: / tel: / #: same tab
 * - Other http(s) destinations: new tab + rel="noopener noreferrer"
 */

function siteHostname(origin = site.url): string {
  try {
    return new URL(origin).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "iknowainhoa.com";
  }
}

/** True when the href leaves this site (not same-origin, not mailto/tel/#). */
export function isExternalHref(href: string, origin = site.url): boolean {
  const value = href.trim();
  if (!value) return false;
  if (
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("#") ||
    value.startsWith("sms:")
  ) {
    return false;
  }
  // Site-relative path
  if (value.startsWith("/") && !value.startsWith("//")) return false;

  try {
    const absolute = value.startsWith("//") ? `https:${value}` : value;
    const url = new URL(absolute, origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.hostname.replace(/^www\./i, "").toLowerCase() !== siteHostname(origin);
  } catch {
    return false;
  }
}

/** Spread onto <a> / <Link> for consistent new-tab behavior. */
export function externalAnchorProps(href: string): {
  target?: "_blank";
  rel?: "noopener noreferrer";
} {
  if (!isExternalHref(href)) return {};
  return { target: "_blank", rel: "noopener noreferrer" };
}

/** Rewrite HTML so external <a href> tags open in a new tab. */
export function openExternalLinksInNewTab(html: string, origin = site.url): string {
  return html.replace(/<a\b([^>]*)>/gi, (full, attrs: string) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
    if (!hrefMatch) return full;

    const href = hrefMatch[2].trim();
    if (!isExternalHref(href, origin)) return full;

    let next = attrs;
    if (!/\btarget\s*=/i.test(next)) {
      next += ' target="_blank"';
    }
    if (!/\brel\s*=/i.test(next)) {
      next += ' rel="noopener noreferrer"';
    } else if (!/noopener/i.test(next) || !/noreferrer/i.test(next)) {
      next = next.replace(/\brel\s*=\s*(["'])(.*?)\1/i, (_m, q: string, value: string) => {
        const parts = new Set(value.split(/\s+/).filter(Boolean));
        parts.add("noopener");
        parts.add("noreferrer");
        return `rel=${q}${[...parts].join(" ")}${q}`;
      });
    }

    return `<a${next}>`;
  });
}
