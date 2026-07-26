"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/galleries/blue";
import { groupBlueGalleryByYear } from "@/lib/galleries/blue";
import InstagramEmbed from "@/components/gallery/InstagramEmbed";
import MediaStamp from "@/components/gallery/MediaStamp";

type BluePatchworkGalleryProps = {
  items: GalleryItem[];
};

function publicSrc(path: string) {
  return path
    .split("/")
    .map((part) => (part ? encodeURIComponent(part) : ""))
    .join("/");
}

function aspectClass(item: GalleryItem) {
  if (!item.width || !item.height) return "tile-mid";
  const ratio = item.width / item.height;
  if (ratio > 1.25) return "tile-wide";
  if (ratio < 0.8) return "tile-tall";
  return "tile-mid";
}

export default function BluePatchworkGallery({ items }: BluePatchworkGalleryProps) {
  const years = useMemo(() => groupBlueGalleryByYear(items), [items]);
  const localLightboxItems = useMemo(
    () => items.filter((i) => i.kind === "photo" || i.kind === "video"),
    [items]
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeIndex = localLightboxItems.findIndex((i) => i.id === activeId);
  const active = activeIndex >= 0 ? localLightboxItems[activeIndex] : null;

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
      if (e.key === "ArrowRight") {
        const next = localLightboxItems[(activeIndex + 1) % localLightboxItems.length];
        setActiveId(next.id);
      }
      if (e.key === "ArrowLeft") {
        const prev =
          localLightboxItems[(activeIndex - 1 + localLightboxItems.length) % localLightboxItems.length];
        setActiveId(prev.id);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, activeIndex, localLightboxItems]);

  return (
    <div className="blue-gallery">
      {years.map(({ year, items: yearItems }) => (
        <section key={year} className="year-block">
          <h2 className="year-label">{year}</h2>
          <div className="patchwork">
            {yearItems.map((item) => {
              const isIgPost = item.kind === "instagram-post";
              const isIgReel = item.kind === "instagram-reel";
              const isLocal = item.kind === "photo" || item.kind === "video";
              const hasReelStill = isIgReel && Boolean(item.coverSrc);

              return (
                <article
                  key={item.id}
                  className={`tile ${isIgPost ? "tile-ig" : aspectClass(item)}`}
                >
                  <div className="stamp-slot">
                    <MediaStamp date={item.date} location={item.location} compact />
                  </div>

                  {isIgPost && item.instagramUrl ? (
                    <InstagramEmbed url={item.instagramUrl} title={item.title} />
                  ) : null}

                  {hasReelStill ? (
                    <a
                      className="media-hit video-hit"
                      href={item.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open reel on Instagram: ${item.title}`}
                    >
                      <Image
                        src={item.coverSrc!}
                        alt={item.title}
                        width={item.width ?? 720}
                        height={item.height ?? 720}
                        className="photo"
                        sizes="(max-width: 700px) 100vw, 33vw"
                      />
                      <span className="play-badge">Reel</span>
                    </a>
                  ) : null}

                  {isIgReel && !hasReelStill && item.instagramUrl ? (
                    <InstagramEmbed url={item.instagramUrl} title={item.title} />
                  ) : null}

                  {item.kind === "photo" && item.src ? (
                    <button
                      type="button"
                      className="media-hit"
                      onClick={() => setActiveId(item.id)}
                      aria-label={`Open ${item.title}`}
                    >
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={item.width ?? 1200}
                        height={item.height ?? 1600}
                        className="photo"
                        sizes="(max-width: 700px) 100vw, 33vw"
                      />
                    </button>
                  ) : null}

                  {item.kind === "video" && item.src ? (
                    <button
                      type="button"
                      className="media-hit video-hit"
                      onClick={() => setActiveId(item.id)}
                      aria-label={`Open video ${item.title}`}
                    >
                      <video
                        className="video-thumb"
                        src={publicSrc(item.src)}
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <span className="play-badge">Play</span>
                    </button>
                  ) : null}

                  <div className="tile-meta">
                    <h3>{item.title}</h3>
                    {item.caption ? <p>{item.caption}</p> : null}
                    {(isIgPost || isIgReel) && item.instagramUrl ? (
                      <a href={item.instagramUrl} target="_blank" rel="noopener noreferrer">
                        Open on Instagram
                      </a>
                    ) : null}
                    {isLocal ? (
                      <button type="button" className="text-open" onClick={() => setActiveId(item.id)}>
                        View fullscreen
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {active && active.src ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActiveId(null)}
        >
          <button type="button" className="lb-close" aria-label="Close" onClick={() => setActiveId(null)}>
            ×
          </button>
          <button
            type="button"
            className="lb-nav prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              const prev =
                localLightboxItems[
                  (activeIndex - 1 + localLightboxItems.length) % localLightboxItems.length
                ];
              setActiveId(prev.id);
            }}
          >
            ‹
          </button>
          <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
            {active.kind === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={publicSrc(active.src)} alt={active.title} className="lb-media" />
            ) : (
              <video
                className="lb-media"
                src={publicSrc(active.src)}
                controls
                autoPlay
                playsInline
              />
            )}
            <div className="lb-stamp">
              <MediaStamp date={active.date} location={active.location} />
              <p className="lb-title">{active.title}</p>
            </div>
          </div>
          <button
            type="button"
            className="lb-nav next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              const next = localLightboxItems[(activeIndex + 1) % localLightboxItems.length];
              setActiveId(next.id);
            }}
          >
            ›
          </button>
        </div>
      ) : null}

      <style jsx>{`
        .blue-gallery {
          display: grid;
          gap: 48px;
        }
        .year-block {
          display: grid;
          gap: 18px;
        }
        .year-label {
          margin: 0;
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.55;
          font-weight: 600;
        }
        .patchwork {
          column-count: 3;
          column-gap: 14px;
        }
        .tile {
          break-inside: avoid;
          margin: 0 0 14px;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: var(--card);
          border: 1px solid var(--border);
          display: grid;
        }
        .tile-wide,
        .tile-mid,
        .tile-tall {
          /* Natural media height drives uneven patchwork tiles */
        }
        .tile-ig {
          padding: 10px 10px 0;
        }
        .stamp-slot {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          pointer-events: auto;
        }
        .tile-ig .stamp-slot {
          position: relative;
          top: 0;
          left: 0;
          margin-bottom: 10px;
        }
        .media-hit {
          display: block;
          width: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: zoom-in;
          position: relative;
          text-decoration: none;
          color: inherit;
        }
        .photo {
          width: 100%;
          height: auto;
          display: block;
          vertical-align: middle;
        }
        .video-hit {
          cursor: pointer;
          background: #111;
        }
        .video-thumb {
          width: 100%;
          height: auto;
          display: block;
          max-height: 420px;
          object-fit: cover;
        }
        .play-badge {
          position: absolute;
          right: 12px;
          bottom: 12px;
          background: rgba(255, 255, 255, 0.92);
          color: #111;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 999px;
        }
        .tile-meta {
          padding: 12px 14px 14px;
          display: grid;
          gap: 4px;
        }
        .tile-meta h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 650;
          line-height: 1.3;
        }
        .tile-meta p {
          margin: 0;
          font-size: 13px;
          opacity: 0.7;
          line-height: 1.45;
        }
        .tile-meta a,
        .text-open {
          font-size: 12px;
          opacity: 0.75;
          background: none;
          border: 0;
          padding: 0;
          text-align: left;
          cursor: pointer;
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
          width: fit-content;
        }
        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(8, 9, 12, 0.92);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
          padding: 24px;
        }
        .lb-stage {
          max-width: min(1100px, 92vw);
          max-height: 90vh;
          margin: 0 auto;
          display: grid;
          gap: 12px;
          justify-items: center;
        }
        .lb-media {
          max-width: 100%;
          max-height: 78vh;
          width: auto;
          height: auto;
          border-radius: 12px;
          object-fit: contain;
          background: #000;
        }
        .lb-stamp {
          display: grid;
          gap: 8px;
          justify-items: start;
          width: 100%;
        }
        .lb-title {
          margin: 0;
          color: #f4f4f5;
          font-size: 15px;
        }
        .lb-close,
        .lb-nav {
          border: 0;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
        }
        .lb-close {
          position: absolute;
          top: 16px;
          right: 16px;
        }
        @media (max-width: 900px) {
          .patchwork {
            column-count: 2;
          }
        }
        @media (max-width: 640px) {
          .patchwork {
            column-count: 1;
          }
          .lightbox {
            grid-template-columns: 1fr;
            padding: 56px 12px 20px;
          }
          .lb-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
