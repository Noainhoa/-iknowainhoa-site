"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BlogAvatarLoop from "@/components/blog/BlogAvatarLoop";
import { blogNavSections } from "@/lib/blogNav";
import { activeBlogMoon, moonMaskDataUri } from "@/lib/blogMoon";

function NavSections({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {blogNavSections.map((section) => (
        <section key={section.id} className="blog-nav-block">
          <h2 className="blog-nav-heading">{section.title}</h2>
          <ul className="blog-nav-list">
            {section.links.map((link) => (
              <li key={`${section.id}-${link.href}-${link.label}`}>
                {link.external ? (
                  <a
                    className="blog-nav-link"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
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

function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const id = useId();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/blog?q=${encodeURIComponent(query)}` : "/blog");
    onNavigate?.();
  }

  return (
    <form className="blog-search" onSubmit={onSubmit} role="search">
      <label className="blog-search-label" htmlFor={id}>
        Search
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
        <button className="blog-search-btn" type="submit" aria-label="Search">
          <SearchIcon />
        </button>
      </div>
    </form>
  );
}

function Brand({
  compact = false,
  avatarSources,
}: {
  compact?: boolean;
  avatarSources: string[];
}) {
  const moon = activeBlogMoon;

  return (
    <Link href="/" className={`blog-brand${compact ? " blog-brand-compact" : ""}`}>
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
        <span className="blog-brand-line">Ainhoa&apos;s</span>
        <span className="blog-brand-line">Blog</span>
      </span>
    </Link>
  );
}

export default function BlogShell({
  children,
  avatarSources = [],
}: {
  children: React.ReactNode;
  avatarSources?: string[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="blog-shell">
      <aside className="blog-sidebar blog-sidebar-desktop">
        <Brand avatarSources={avatarSources} />
        <SearchBox />
        <NavSections />
      </aside>

      <header className="blog-mobile-bar">
        <Brand compact avatarSources={avatarSources} />
        <button
          type="button"
          className="blog-menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {open ? (
        <>
          <div className="blog-drawer-backdrop" onClick={() => setOpen(false)} />
          <aside className="blog-drawer" role="dialog" aria-label="Blog menu">
            <Brand avatarSources={avatarSources} />
            <SearchBox onNavigate={() => setOpen(false)} />
            <NavSections onNavigate={() => setOpen(false)} />
          </aside>
        </>
      ) : null}

      <div className="blog-main">{children}</div>
    </div>
  );
}
