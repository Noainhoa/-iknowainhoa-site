"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/shared";

function languageHref(pathname: string, searchParams: { toString(): string }, locale: Locale) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("lang", locale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function LanguageToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefEs = languageHref(pathname, searchParams, "es");
  const hrefEn = languageHref(pathname, searchParams, "en");

  return (
    <div style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12 }}>
      <a
        href={hrefEs}
        style={{
          textDecoration: "none",
          color: "inherit",
          opacity: locale === "es" ? 1 : 0.55,
          fontWeight: locale === "es" ? 700 : 500,
        }}
      >
        ES
      </a>
      <span style={{ opacity: 0.35 }}>/</span>
      <a
        href={hrefEn}
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
  );
}

