"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";
import LanguageToggle from "@/components/LanguageToggle";

export default function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const t = getDictionary(locale);
  const navLinks = [
    { href: "/work", label: t.header.work },
    { href: "/blog", label: t.header.blog },
    { href: "/gallery/blue", label: "Gallery" },
    { href: "/contact", label: t.header.contact },
  ];

  // Prevent background scroll when menu is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="header">
      <div className="inner">
        <Link href="/" className="brand">
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
          className="hamburger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <>
          <div className="backdrop" onClick={() => setOpen(false)} />
          <nav className="mobile-panel">
            <div className="mobile-header">
              <Link href="/" className="brand" onClick={() => setOpen(false)}>
                iknowainhoa
              </Link>
              <button className="close" aria-label="Close menu" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className="mobile-links">
              <div style={{ marginBottom: 8 }}>
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
        </>
      )}

      <style jsx>{`
        .header {
          border-bottom: 1px solid var(--border);
          padding: 14px 20px;
          font-family: var(--font-geist-sans);
          position: sticky;
          top: var(--accent-height);
          z-index: 20;
          background: var(--background);
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
        .hamburger {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--card);
          display: none;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 8px;
        }
        .hamburger span {
          display: block;
          width: 18px;
          height: 2px;
          border-radius: 4px;
          background: var(--foreground);
        }
        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 18;
        }
        .mobile-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: min(80vw, 320px);
          background: var(--background);
          z-index: 19;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 30px rgba(0, 0, 0, 0.08);
          padding: 20px;
          gap: 16px;
        }
        .mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .close {
          background: transparent;
          border: none;
          font-size: 26px;
          line-height: 1;
          cursor: pointer;
          color: var(--foreground);
        }
        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-link {
          text-decoration: none;
          color: var(--foreground);
          font-size: 16px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 768px) {
          .nav.desktop {
            display: none;
          }
          .desktop-lang {
            display: none;
          }
          .hamburger {
            display: inline-flex;
          }
        }
      `}</style>
    </header>
  );
}
