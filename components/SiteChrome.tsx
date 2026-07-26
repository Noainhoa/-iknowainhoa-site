"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/shared";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Site chrome: joy-yellow accent + header/footer.
 * Blog uses its own Seth-style shell (no global header/footer).
 * Parking is a standalone mini-app (no chrome at all).
 */
export default function SiteChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isParking =
    pathname === "/parking-guardamar-centro" ||
    pathname.startsWith("/parking-guardamar-centro/") ||
    pathname === "/parking" ||
    pathname.startsWith("/parking/");
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const showAccent = !isParking;
  const showHeaderFooter = !isParking && !isBlog;

  return (
    <>
      {showAccent ? <div className="site-accent" aria-hidden /> : null}
      {showHeaderFooter ? <SiteHeader locale={locale} /> : null}
      {children}
      {showHeaderFooter ? <SiteFooter /> : null}
    </>
  );
}
