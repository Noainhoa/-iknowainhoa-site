"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  WORK_FILTERS,
  categoryLabel,
  type WorkFilterId,
  type WorkItem,
} from "@/lib/work-shared";

export default function WorkIndex({
  items,
  title,
  subtitle,
  empty,
}: {
  items: WorkItem[];
  title: string;
  subtitle: string;
  empty: string;
}) {
  const [filter, setFilter] = useState<WorkFilterId>("all");

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  return (
    <main className="work">
      <header className="work-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <div className="chips" role="tablist" aria-label="Filter work">
        {WORK_FILTERS.map((chip) => {
          const selected = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? "chip chip-active" : "chip"}
              onClick={() => setFilter(chip.id)}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        <section className="grid" aria-live="polite">
          {visible.map((item, index) => (
            <Link key={item.slug} href={item.href} className="card">
              <div className="media">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 100vw, 50vw"
                    priority={index < 2}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="placeholder">{categoryLabel(item.category)}</div>
                )}
              </div>
              <div className="meta">
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
              </div>
            </Link>
          ))}
        </section>
      )}

      <style jsx>{`
        .work {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 28px 96px;
          font-family: var(--font-geist-sans);
          color: var(--foreground);
        }
        .work-hero {
          max-width: 640px;
          margin-bottom: 36px;
        }
        .work-hero h1 {
          margin: 0;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 750;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .work-hero p {
          margin: 16px 0 0;
          font-size: 1.125rem;
          line-height: 1.65;
          color: var(--foreground-muted);
          font-family: var(--font-serif);
          max-width: 34em;
        }
        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 40px;
        }
        .chip {
          appearance: none;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground-muted);
          font: inherit;
          font-size: 0.9rem;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .chip:hover {
          color: var(--foreground);
          border-color: #ccc;
        }
        .chip-active {
          background: var(--foreground);
          border-color: var(--foreground);
          color: var(--background);
        }
        .empty {
          opacity: 0.65;
          font-size: 1.05rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 48px 28px;
        }
        .card {
          display: grid;
          gap: 16px;
          text-decoration: none;
          color: inherit;
        }
        .card:hover {
          text-decoration: none;
          color: inherit;
        }
        .media {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--muted);
          border-radius: 2px;
        }
        .card:hover .media {
          opacity: 0.96;
        }
        .placeholder {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--foreground-muted);
          background: linear-gradient(
            135deg,
            var(--muted) 0%,
            #efe9d8 50%,
            var(--joy-yellow-soft) 100%
          );
        }
        .meta h2 {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .meta p {
          margin: 8px 0 0;
          font-size: 1rem;
          line-height: 1.55;
          color: var(--foreground-muted);
          font-family: var(--font-serif);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 720px) {
          .work {
            padding: 28px 18px 72px;
          }
          .grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
        }
      `}</style>
    </main>
  );
}
