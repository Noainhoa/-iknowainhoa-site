"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";
import LanguageToggle from "@/components/LanguageToggle";

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="site-menu-icon" viewBox="0 0 28 28" aria-hidden="true" fill="none">
        <rect x="0" y="12.5" width="28" height="3" fill="currentColor" transform="rotate(45 14 14)" />
        <rect x="0" y="12.5" width="28" height="3" fill="currentColor" transform="rotate(-45 14 14)" />
      </svg>
    );
  }

  return (
    <svg className="site-menu-icon" viewBox="0 0 28 28" aria-hidden="true" fill="none">
      <rect x="0" y="5" width="28" height="3" fill="currentColor" />
      <rect x="0" y="12.5" width="28" height="3" fill="currentColor" />
      <rect x="0" y="20" width="28" height="3" fill="currentColor" />
    </svg>
  );
}

export default function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const t = getDictionary(locale);
  const navLinks = [
    { href: "/work", label: t.header.work },
    { href: "/blog", label: t.header.blog },
    { href: "/gallery/blue", label: "Gallery" },
    { href: "/contact", label: t.header.contact },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncBarHeight = () => {
      const bar = header.querySelector(".site-header-bar") as HTMLElement | null;
      document.documentElement.style.setProperty(
        "--site-mobile-bar-height",
        `${bar?.offsetHeight ?? 70}px`
      );
    };

    syncBarHeight();
    const observer = new ResizeObserver(syncBarHeight);
    observer.observe(header);
    window.addEventListener("resize", syncBarHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncBarHeight);
      document.documentElement.style.removeProperty("--site-mobile-bar-height");
    };
  }, []);

  return (
    <>
      <div className="site-header-spacer" aria-hidden />
      <header
        ref={headerRef}
        className={`site-header${open ? " is-menu-open" : ""}`}
        role={open ? "dialog" : undefined}
        aria-label={open ? "Site menu" : undefined}
      >
        <div className="site-header-bar">
          <div className="site-header-inner">
            <Link href="/" className="site-brand" onClick={() => setOpen(false)}>
              iknowainhoa
            </Link>

            <nav className="site-nav site-nav--desktop" aria-label="Site">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="site-lang site-lang--desktop">
              <LanguageToggle locale={locale} locales={["es", "en"]} />
            </div>

            <button
              type="button"
              className="site-menu-btn"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>

        <nav className="site-mobile-body" aria-label="Site links">
          <div className="site-mobile-links">
            <div className="site-mobile-lang">
              <LanguageToggle locale={locale} locales={["es", "en"]} />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="site-mobile-link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
}
