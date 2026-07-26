"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@/lib/galleries/blue";

type BlogAsideGalleryProps = {
  items: GalleryItem[];
  href: string;
  title?: string;
};

function publicSrc(path: string) {
  return path
    .split("/")
    .map((part) => (part ? encodeURIComponent(part) : ""))
    .join("/");
}

/**
 * One photo at a time — keeps each image's natural landscape/portrait shape
 * (no fixed crop box, so no grey letterboxing).
 */
export default function BlogAsideGallery({
  items,
  href,
  title = "Blue",
}: BlogAsideGalleryProps) {
  const photos = items.filter((i) => i.kind === "photo" && i.src);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const current = photos[index] ?? null;

  useEffect(() => {
    if (!lightbox || !current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + photos.length) % photos.length);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, current, photos.length]);

  if (!current) return null;

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + photos.length) % photos.length);
  };

  return (
    <aside className="aside-gallery" aria-label={`${title} photo miniatures`}>
      <div className="aside-inner">
        <div className="aside-top">
          <p className="aside-label">{title}</p>
          <p className="aside-count">
            {index + 1} / {photos.length}
          </p>
        </div>

        <button
          type="button"
          className="aside-frame"
          onClick={() => setLightbox(true)}
          aria-label={`Open ${current.title}`}
        >
          <Image
            src={current.src!}
            alt={current.title}
            width={current.width ?? 1200}
            height={current.height ?? 1600}
            className="aside-img"
            sizes="(max-width: 900px) 90vw, 220px"
          />
        </button>

        <div className="aside-nav">
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo">
            ‹
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photo">
            ›
          </button>
        </div>

        <Link href={href} className="aside-link">
          View full gallery
        </Link>
      </div>

      {lightbox && current.src ? (
        <div
          className="aside-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="aside-close"
            aria-label="Close"
            onClick={() => setLightbox(false)}
          >
            ×
          </button>
          <button
            type="button"
            className="lb-nav prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            ‹
          </button>
          <div className="aside-stage" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicSrc(current.src)} alt={current.title} className="aside-full" />
            <p className="aside-caption">{current.title}</p>
          </div>
          <button
            type="button"
            className="lb-nav next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>
        </div>
      ) : null}

      <style jsx>{`
        .aside-gallery {
          width: 100%;
        }
        .aside-inner {
          display: grid;
          gap: 10px;
        }
        .aside-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
        }
        .aside-label {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.55;
          font-weight: 600;
        }
        .aside-count {
          margin: 0;
          font-size: 11px;
          opacity: 0.45;
          font-variant-numeric: tabular-nums;
        }
        .aside-frame {
          display: block;
          width: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: zoom-in;
          line-height: 0;
        }
        .aside-img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 10px;
        }
        .aside-nav {
          display: flex;
          gap: 8px;
        }
        .aside-nav button {
          flex: 1;
          height: 36px;
          border: 1px solid #e5e5e5;
          background: #fff;
          border-radius: 8px;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          color: #111;
        }
        .aside-link {
          font-size: 13px;
          color: inherit;
          opacity: 0.75;
          text-decoration: underline;
          text-underline-offset: 3px;
          width: fit-content;
        }
        .aside-lightbox {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(8, 9, 12, 0.92);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
          padding: 24px;
        }
        .aside-stage {
          max-width: min(960px, 92vw);
          max-height: 90vh;
          margin: 0 auto;
          display: grid;
          gap: 10px;
          justify-items: center;
        }
        .aside-full {
          max-width: 100%;
          max-height: 78vh;
          width: auto;
          height: auto;
          border-radius: 12px;
          object-fit: contain;
        }
        .aside-caption {
          margin: 0;
          color: #f4f4f5;
          font-size: 14px;
        }
        .aside-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          font-size: 28px;
          cursor: pointer;
        }
        .lb-nav {
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          font-size: 28px;
          cursor: pointer;
        }
        @media (min-width: 901px) {
          .aside-inner {
            position: sticky;
            top: 88px;
          }
        }
        @media (max-width: 900px) {
          .aside-lightbox {
            grid-template-columns: 1fr;
            padding: 56px 12px 20px;
          }
          .lb-nav {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
