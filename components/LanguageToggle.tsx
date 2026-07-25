"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/shared";

function languageHref(
  pathname: string,
  searchParams: { toString(): string },
  locale: Locale
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("lang", locale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function LanguageToggle({
  locale,
  label,
}: {
  locale: Locale;
  label?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefEs = languageHref(pathname, searchParams, "es");
  const hrefEn = languageHref(pathname, searchParams, "en");
  const ariaLabel = label ?? (locale === "es" ? "Seleccionar idioma" : "Select language");

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
        <a
          href={hrefEs}
          hrefLang="es"
          lang="es"
          aria-current={locale === "es" ? "true" : undefined}
          style={{
            textDecoration: "none",
            color: "inherit",
            opacity: locale === "es" ? 1 : 0.55,
            fontWeight: locale === "es" ? 700 : 500,
          }}
        >
          ES
        </a>
        <span style={{ opacity: 0.35 }} aria-hidden="true">
          /
        </span>
        <a
          href={hrefEn}
          hrefLang="en"
          lang="en"
          aria-current={locale === "en" ? "true" : undefined}
          style={{
            textDecoration: "none",
            color: "inherit",
            opacity: locale === "en" ? 1 : 0.55,
            fontWeight: locale === "en" ? 700 : 500,
          }}
        >
          EN
        </a>
      </div>
    </nav>
  );
}
