"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BlogAvatarLoop from "@/components/blog/BlogAvatarLoop";
import LanguageToggle from "@/components/LanguageToggle";
import { getBlogNavSections } from "@/lib/blogNav";
import { activeBlogMoon, moonMaskDataUri } from "@/lib/blogMoon";
import { externalAnchorProps, isExternalHref } from "@/lib/links";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";

function NavSections({
  locale,
  onNavigate,
}: {
  locale: Locale;
  onNavigate?: () => void;
}) {
  const sections = getBlogNavSections(locale);
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="blog-nav-block">
          <h2 className="blog-nav-heading">{section.title}</h2>
          <ul className="blog-nav-list">
            {section.links.map((link) => (
              <li key={`${section.id}-${link.href}-${link.label}`}>
                {isExternalHref(link.href) ||
                link.href.startsWith("mailto:") ||
                link.href.startsWith("tel:") ||
                link.external ? (
                  <a
                    className="blog-nav-link"
                    href={link.href}
                    {...externalAnchorProps(link.href)}
                    onClick={onNavigate}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link className="blog-nav-link" href={link.href} onClick={onNavigate}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="10.5" cy="10.5" r="6.25" stroke="currentColor" strokeWidth="2.4" />
      <path d="M15.8 15.8L21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function SearchBox({
  locale,
  onNavigate,
}: {
  locale: Locale;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const id = useId();
  const t = getDictionary(locale).blog;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/blog?q=${encodeURIComponent(query)}` : "/blog");
    onNavigate?.();
  }

  return (
    <form className="blog-search" onSubmit={onSubmit} role="search">
      <label className="blog-search-label" htmlFor={id}>
        {t.search}
      </label>
      <div className="blog-search-row">
        <input
          id={id}
          className="blog-search-input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        <button className="blog-search-btn" type="submit" aria-label={t.search}>
          <SearchIcon />
        </button>
      </div>
    </form>
  );
}

function Brand({
  locale,
  avatarSources,
}: {
  locale: Locale;
  avatarSources: string[];
}) {
  const moon = activeBlogMoon;
  const t = getDictionary(locale).blog;

  return (
    <Link href="/" className="blog-brand">
      <span
        className="blog-avatar-wrap"
        aria-hidden
        style={{ ["--moon-mask" as string]: moonMaskDataUri(moon) }}
      >
        <span className="blog-avatar">
          <BlogAvatarLoop sources={avatarSources} />
        </span>
        <svg className="blog-avatar-edge" viewBox={moon.viewBox} aria-hidden>
          <g transform={moon.transform}>
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth={moon.strokeWidth}
              strokeLinejoin="round"
              d={moon.path}
            />
          </g>
        </svg>
      </span>
      <span className="blog-brand-copy">
        <span className="blog-brand-line">{t.brandLine1}</span>
        <span className="blog-brand-line">{t.brandLine2}</span>
      </span>
    </Link>
  );
}

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

export default function BlogShell({
  children,
  avatarSources = [],
  locale,
}: {
  children: React.ReactNode;
  avatarSources?: string[];
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const t = getDictionary(locale).blog;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keep main content below the fixed mobile header — height varies with avatar/brand.
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const shell = sidebar?.closest(".blog-shell") as HTMLElement | null;
    if (!sidebar || !shell) return;

    const syncBarHeight = () => {
      shell.style.setProperty("--blog-mobile-bar-height", `${sidebar.offsetHeight}px`);
    };

    syncBarHeight();
    const observer = new ResizeObserver(syncBarHeight);
    observer.observe(sidebar);
    window.addEventListener("resize", syncBarHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncBarHeight);
    };
  }, []);

  return (
    <div className={`blog-shell${open ? " is-menu-open" : ""}`}>
      <aside
        ref={sidebarRef}
        className="blog-sidebar"
        role={open ? "dialog" : undefined}
        aria-label={open ? t.menu : undefined}
      >
        <div className="blog-sidebar-header">
          <Brand locale={locale} avatarSources={avatarSources} />
          <button
            type="button"
            className="blog-menu-btn"
            aria-label={open ? t.closeMenu : t.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
        <div className="blog-sidebar-body">
          <div style={{ marginBottom: 16 }}>
            <LanguageToggle locale={locale} locales={["es", "en"]} />
          </div>
          <SearchBox locale={locale} onNavigate={() => setOpen(false)} />
          <NavSections locale={locale} onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      <div className="blog-main">{children}</div>
    </div>
  );
}
