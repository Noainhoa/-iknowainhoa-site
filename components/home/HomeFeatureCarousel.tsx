"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { externalAnchorProps, isExternalHref } from "@/lib/links";

export type HomeSlide = {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  href: string;
  image?: string;
  imageContain?: boolean;
};

const AUTOPLAY_MS = 8000;

function SlideLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} {...externalAnchorProps(href)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function ArrowIcon({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
      {dir === "prev" ? (
        <path
          d="M14.5 5.5 8 12l6.5 6.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9.5 5.5 16 12l-6.5 6.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function HomeFeatureCarousel({
  slides,
  previousLabel,
  nextLabel,
  openLabel,
  regionLabel,
}: {
  slides: HomeSlide[];
  previousLabel: string;
  nextLabel: string;
  openLabel: string;
  regionLabel: string;
}) {
  const labelId = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count < 2) return;
      setIndex((current) => (current + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (reducedMotion || paused || count < 2) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, go, paused, reducedMotion]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (count === 0) return null;

  const slide = slides[index] ?? slides[0];

  return (
    <div
      className="home-carousel"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <p id={labelId} className="home-carousel-sr">
        {regionLabel}
      </p>

      <div className="home-carousel-stage" aria-live="polite" aria-atomic="true">
        {slide.image ? (
          <SlideLink href={slide.href} className="home-carousel-media">
            {/* Logos stay crisp outside the optimizer, same as /work. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt=""
              className={
                slide.imageContain
                  ? "home-carousel-img is-contain"
                  : "home-carousel-img"
              }
            />
          </SlideLink>
        ) : null}

        <div className="home-carousel-copy">
          <div className="home-carousel-meta">
            <p className="home-carousel-kicker">{slide.kicker}</p>
            {count > 1 ? (
              <div className="home-carousel-arrows">
                <button
                  type="button"
                  className="home-carousel-arrow"
                  aria-label={previousLabel}
                  onClick={() => go(-1)}
                >
                  <ArrowIcon dir="prev" />
                </button>
                <button
                  type="button"
                  className="home-carousel-arrow"
                  aria-label={nextLabel}
                  onClick={() => go(1)}
                >
                  <ArrowIcon dir="next" />
                </button>
              </div>
            ) : null}
          </div>
          <h2 className="home-carousel-title">
            <SlideLink href={slide.href}>{slide.title}</SlideLink>
          </h2>
          <p className="home-carousel-summary">{slide.summary}</p>
          <SlideLink href={slide.href} className="home-carousel-open">
            {openLabel}
          </SlideLink>
        </div>
      </div>

      <style>{`
        .home-carousel {
          display: grid;
          gap: 22px;
        }
        .home-carousel-sr {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .home-carousel-stage {
          display: grid;
          gap: 18px;
        }
        .home-carousel-media {
          display: grid;
          place-items: center;
          width: 92px;
          height: 92px;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
          text-decoration: none !important;
        }
        .home-carousel-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .home-carousel-img.is-contain {
          object-fit: contain;
          padding: 12px;
        }
        .home-carousel-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .home-carousel-kicker {
          margin: 0;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(247, 244, 239, 0.58);
        }
        .home-carousel-title {
          margin: 0;
          font-size: clamp(1.7rem, 3.4vw, 2.55rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.12;
        }
        .home-carousel-title a {
          color: #f7f4ef !important;
          text-decoration: none !important;
        }
        .home-carousel-title a:hover {
          color: var(--accent-yellow) !important;
        }
        .home-carousel-summary {
          margin: 12px 0 0;
          max-width: 34ch;
          font-family: var(--font-serif);
          font-size: clamp(1rem, 1.8vw, 1.18rem);
          line-height: 1.45;
          color: rgba(247, 244, 239, 0.84);
        }
        .home-carousel-open {
          display: inline-block;
          margin-top: 18px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent-yellow) !important;
          text-decoration: none !important;
          border-bottom: 1px solid transparent;
        }
        .home-carousel-open:hover {
          border-bottom-color: var(--accent-yellow);
        }
        .home-carousel-arrows {
          display: flex;
          flex-shrink: 0;
          gap: 8px;
        }
        .home-carousel-arrow {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          margin: 0;
          padding: 0;
          border: 1px solid rgba(247, 244, 239, 0.22);
          border-radius: 999px;
          background: rgba(8, 8, 10, 0.45);
          color: #f7f4ef;
          cursor: pointer;
        }
        .home-carousel-arrow:hover {
          border-color: rgba(247, 244, 239, 0.55);
          background: rgba(247, 244, 239, 0.08);
        }
        .home-carousel-arrow:focus-visible {
          outline: 2px solid var(--accent-yellow);
          outline-offset: 3px;
        }
        @media (min-width: 860px) {
          .home-carousel-stage {
            grid-template-columns: 92px minmax(0, 1fr);
            align-items: start;
            gap: 22px;
          }
        }
      `}</style>
    </div>
  );
}
