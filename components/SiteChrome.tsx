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
 * Copyright appears on every page except Tech admin and the parking public home
 * (which embeds it in the contact footer).
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
  const isParkingPublicHome =
    pathname === "/parking-guardamar-centro" || pathname === "/parking";
  const isTech =
    pathname === "/guardamar-click" || pathname.startsWith("/guardamar-click/");
  const isTechAdmin =
    pathname === "/guardamar-click/admin" || pathname.startsWith("/guardamar-click/admin/");
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isAnicca = pathname === "/anicca" || pathname.startsWith("/anicca/");
  const showAccent = isBlog;
  const showHeaderFooter = !isParking && !isTech && !isBlog;
  // Parking home embeds copyright in pk-contact; keep the strip on legal/admin.
  const showCopyright = !showHeaderFooter && !isTechAdmin && !isParkingPublicHome;

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
      ) : showCopyright ? (
        <div
          style={{
            padding: "20px 16px 28px",
            background: isParking ? "#fafaf8" : undefined,
          }}
        >
          <SiteCopyright />
        </div>
      ) : null}
    </>
  );
}
