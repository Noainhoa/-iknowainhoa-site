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
      <svg viewBox="0 0 28 28" aria-hidden="true" fill="none">
        <rect x="0" y="12.5" width="28" height="3" fill="currentColor" transform="rotate(45 14 14)" />
        <rect x="0" y="12.5" width="28" height="3" fill="currentColor" transform="rotate(-45 14 14)" />
      </svg>
    );
  }

  return (
    <>
      <span />
      <span />
      <span />
    </>
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

  // Keep page content below the fixed mobile bar (height varies).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncBarHeight = () => {
      const bar = header.querySelector(".header-bar") as HTMLElement | null;
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
      <div className="header-spacer" aria-hidden />
      <header
        ref={headerRef}
        className={`header${open ? " is-menu-open" : ""}`}
        role={open ? "dialog" : undefined}
        aria-label={open ? "Site menu" : undefined}
      >
        <div className="header-bar">
          <div className="inner">
            <Link href="/" className="brand" onClick={() => setOpen(false)}>
              iknowainhoa
            </Link>

            <nav className="nav desktop">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="lang desktop-lang">
              <LanguageToggle locale={locale} locales={["es", "en"]} />
            </div>

            <button
              type="button"
              className="menu-btn"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>

        <nav className="mobile-body" aria-label="Site links">
          <div className="mobile-links">
            <div className="mobile-lang">
              <LanguageToggle locale={locale} locales={["es", "en"]} />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <style jsx>{`
          .header-spacer {
            display: none;
          }
          .header {
            border-bottom: 1px solid var(--border);
            font-family: var(--font-geist-sans);
            position: sticky;
            top: var(--accent-height);
            z-index: 50;
            background: var(--background);
          }
          .header-bar {
            padding: 14px 20px;
          }
          .inner {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .brand {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            text-decoration: none;
            color: inherit;
          }
          .nav {
            display: flex;
            gap: 24px;
          }
          .nav-link {
            text-decoration: none;
            color: var(--foreground-muted);
            font-size: 14px;
            transition: color 0.2s;
          }
          .nav-link:hover {
            color: var(--foreground);
          }
          .menu-btn {
            display: none;
            flex-shrink: 0;
            place-content: center;
            width: 42px;
            height: 42px;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            color: var(--foreground);
            cursor: pointer;
            gap: 5px;
          }
          .menu-btn :global(svg) {
            width: 30px;
            height: 30px;
            display: block;
          }
          .menu-btn span {
            display: block;
            width: 28px;
            height: 3px;
            background: var(--foreground);
          }
          .mobile-body {
            display: none;
          }
          .mobile-links {
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-width: 800px;
            margin: 0 auto;
            padding: 8px 20px 28px;
          }
          .mobile-lang {
            margin-bottom: 12px;
          }
          .mobile-link {
            text-decoration: none;
            color: var(--foreground);
            font-size: 1.125rem;
            padding: 12px 0;
            border-bottom: 1px solid var(--border);
          }
          @media (max-width: 768px) {
            .header-spacer {
              display: block;
              height: var(--site-mobile-bar-height, 70px);
            }
            .header {
              position: fixed;
              top: var(--accent-height);
              left: 0;
              right: 0;
              bottom: auto;
              overflow: hidden;
            }
            .nav.desktop {
              display: none;
            }
            .desktop-lang {
              display: none;
            }
            .menu-btn {
              display: grid;
            }
            .header.is-menu-open {
              bottom: 0;
              height: calc(100vh - var(--accent-height));
              max-height: calc(100vh - var(--accent-height));
              overflow-y: auto;
              border-bottom: none;
            }
            .header.is-menu-open .mobile-body {
              display: block;
            }
          }
        `}</style>
      </header>
    </>
  );
}
