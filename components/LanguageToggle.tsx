"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/shared";
import { trackParkingEvent } from "@/lib/parking/analytics";

const LABELS: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  fr: "FR",
};

function languageHref(
  pathname: string,
  searchParams: { toString(): string },
  locale: Locale
) {
  const params = new URLSearchParams(searchParams.toString());
  // Always set ?lang= so middleware can persist preferred_locale.
  // For Spanish parking pages, middleware then strips ?lang=es to the bare canonical URL.
  params.set("lang", locale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function LanguageToggle({
  locale,
  label,
  locales = ["es", "en", "fr"],
  tone = "default",
}: {
  locale: Locale;
  label?: string;
  /** Languages to show (parking shows all three; main site can pass fewer). */
  locales?: Locale[];
  /** Light text for dark overlay headers (home hero). */
  tone?: "default" | "onDark";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isParking = pathname.toLowerCase().startsWith("/parking-guardamar-centro");

  const ariaLabel =
    label ??
    (locale === "es"
      ? "Seleccionar idioma"
      : locale === "fr"
        ? "Choisir la langue"
        : "Select language");

  return (
    <nav aria-label={ariaLabel}>
      <div
        style={{
          display: "inline-flex",
          gap: 6,
          alignItems: "center",
          fontSize: 12,
        }}
      >
        {locales.map((code, index) => (
          <span key={code} style={{ display: "contents" }}>
            {index > 0 ? (
              <span style={{ opacity: 0.35 }} aria-hidden="true">
                /
              </span>
            ) : null}
            <a
              href={languageHref(pathname, searchParams, code)}
              hrefLang={code}
              lang={code}
              aria-current={locale === code ? "true" : undefined}
              onClick={() => {
                if (isParking && code !== locale) {
                  trackParkingEvent({
                    name: "parking_language_change",
                    language: locale,
                    to: code,
                  });
                }
              }}
              style={{
                textDecoration: "none",
                color:
                  locale === code
                    ? tone === "onDark"
                      ? "#ffffff"
                      : "#005288"
                    : "inherit",
                opacity: locale === code ? 1 : 0.7,
                fontWeight: locale === code ? 700 : 500,
                borderBottom:
                  locale === code
                    ? `2px solid ${tone === "onDark" ? "#ffffff" : "#005288"}`
                    : "2px solid transparent",
                paddingBottom: 1,
              }}
            >
              {LABELS[code]}
            </a>
          </span>
        ))}
      </div>
    </nav>
  );
}
