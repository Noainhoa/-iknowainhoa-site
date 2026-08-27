"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/shared";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SiteCopyright from "@/components/SiteCopyright";

/**
 * Site chrome: header/footer on most pages.
 * Orange/yellow accent strip is blog-only (including nested blog routes).
 * Home overlays the header on the portrait.
 * Parking is a standalone mini-app (no chrome at all).
 * Copyright appears on every page.
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
  const isAnicca = pathname === "/anicca" || pathname.startsWith("/anicca/");
  const showAccent = isBlog;
  const showHeaderFooter = !isParking && !isBlog;

  useEffect(() => {
    document.documentElement.classList.toggle("page-anicca", isAnicca);
    return () => document.documentElement.classList.remove("page-anicca");
  }, [isAnicca]);

  return (
    <>
      {showAccent ? <div className="site-accent" aria-hidden /> : null}
      {showHeaderFooter ? <SiteHeader locale={locale} /> : null}
      {children}
      {showHeaderFooter ? (
        <SiteFooter locale={locale} />
      ) : (
        <div
          style={{
            padding: "20px 16px 28px",
            background: isParking ? "#fafaf8" : undefined,
          }}
        >
          <SiteCopyright />
        </div>
      )}
    </>
  );
}
