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
  const path = pathname.toLowerCase();
  const isParkingPublic =
    path === "/parking-guardamar-centro" ||
    path === "/parking-guardamar-centro/privacidad";

  // Spanish parking pages use the bare path as the canonical URL.
  if (isParkingPublic && locale === "es") {
    params.delete("lang");
  } else {
    params.set("lang", locale);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function LanguageToggle({
  locale,
  label,
  locales = ["es", "en", "fr"],
}: {
  locale: Locale;
  label?: string;
  /** Languages to show (parking shows all three; main site can pass fewer). */
  locales?: Locale[];
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
                color: "inherit",
                opacity: locale === code ? 1 : 0.55,
                fontWeight: locale === code ? 700 : 500,
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
