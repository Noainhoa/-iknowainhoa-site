"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/shared";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/** Hide global header/footer on blog routes — blog uses its own Seth-style shell. */
export default function SiteChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Parking is a standalone mini-app (no site header/footer).
  const hideChrome =
    pathname === "/parking-guardamar-centro" ||
    pathname.startsWith("/parking-guardamar-centro/") ||
    pathname === "/parking" ||
    pathname.startsWith("/parking/");

  return (
    <>
      {!hideChrome ? <SiteHeader locale={locale} /> : null}
      {children}
      {!hideChrome ? <SiteFooter /> : null}
    </>
  );
}
