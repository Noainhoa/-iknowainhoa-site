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

function CaretIcon() {
  return (
    <svg className="site-nav-caret" viewBox="0 0 12 12" aria-hidden="true" fill="none">
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AboutMenu({
  locale,
  onNavigate,
}: {
  locale: Locale;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const t = getDictionary(locale);

  const cancelClose = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const show = () => {
    cancelClose();
    setOpen(true);
  };

  const hideSoon = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => {
    setOpen(false);
    cancelClose();
  }, [pathname]);

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      className={`site-nav-item${open ? " is-open" : ""}`}
      onMouseEnter={show}
      onMouseLeave={hideSoon}
    >
      <Link
        href="/about"
        className="site-nav-link site-nav-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {t.header.about}
        <CaretIcon />
      </Link>
      <div className="site-nav-dropdown" role="menu">
        <div className="site-nav-dropdown-panel">
          <Link
            href="/about"
            role="menuitem"
            className="site-nav-dropdown-link"
            onClick={onNavigate}
          >
            {t.about.title}
          </Link>
          <Link
            href="/contact"
            role="menuitem"
            className="site-nav-dropdown-link"
            onClick={onNavigate}
          >
            {t.header.contact}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const t = getDictionary(locale);
  const isHome = pathname === "/";
  const navLinks = [
    { href: "/guardamar-click", label: t.header.techHelp },
    { href: "/work", label: t.header.work },
    { href: "/blog", label: t.header.blog },
    { href: "/gallery/blue", label: t.header.gallery },
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
        className={`site-header${open ? " is-menu-open" : ""}${isHome ? " site-header--overlay" : ""}`}
        role={open ? "dialog" : undefined}
        aria-label={open ? t.header.siteMenu : undefined}
      >
        <div className="site-header-bar">
          <div className="site-header-inner">
            <Link href="/" className="site-brand" onClick={() => setOpen(false)}>
              {isHome ? <h1 className="site-brand-title">iknowainhoa</h1> : "iknowainhoa"}
            </Link>

            <nav className="site-nav site-nav--desktop" aria-label="Site">
              <AboutMenu locale={locale} />
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="site-lang site-lang--desktop">
              <LanguageToggle
                locale={locale}
                locales={["es", "en"]}
                tone={isHome ? "onDark" : "default"}
              />
            </div>

            <button
              type="button"
              className="site-menu-btn"
              aria-label={open ? t.header.closeMenu : t.header.openMenu}
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
              <LanguageToggle
                locale={locale}
                locales={["es", "en"]}
                tone={isHome ? "onDark" : "default"}
              />
            </div>
            <p className="site-mobile-heading">{t.header.about}</p>
            <Link
              href="/about"
              className="site-mobile-link is-nested"
              onClick={() => setOpen(false)}
            >
              {t.about.title}
            </Link>
            <Link
              href="/contact"
              className="site-mobile-link is-nested"
              onClick={() => setOpen(false)}
            >
              {t.header.contact}
            </Link>
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
