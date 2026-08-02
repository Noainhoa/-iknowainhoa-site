"use client";

import Image from "next/image";
import Link from "next/link";
import type { WorkItem } from "@/lib/work-shared";

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
  return (
    <main className="work">
      <header className="work-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      {items.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        <section className="grid" aria-label={title}>
          {items.map((item, index) => (
            <Link key={item.slug} href={item.href} className="project">
              <div className="media">
                {item.coverImage ? (
                  item.logo && item.coverImage === item.logo ? (
                    // Logos: skip Next optimizer — it was soft-resizing the badge.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImage}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "center",
                        padding: 10,
                        background: "#0b2a5b",
                      }}
                    />
                  ) : (
                    <Image
                      src={item.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw"
                      quality={90}
                      priority={index < 2}
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  )
                ) : (
                  <div className="placeholder" aria-hidden />
                )}
              </div>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </Link>
          ))}
        </section>
      )}

      <style>{`
        .work {
          max-width: 1080px;
          margin: 0 auto;
          padding: 56px 28px 120px;
          font-family: var(--font-geist-sans);
          color: #2a2a2a;
        }
        .work-hero {
          max-width: 34em;
          margin-bottom: 64px;
        }
        .work-hero h1 {
          margin: 0;
          font-size: clamp(2.6rem, 6vw, 3.75rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #2a2a2a;
        }
        .work-hero p {
          margin: 22px 0 0;
          font-size: clamp(1.15rem, 2.4vw, 1.35rem);
          line-height: 1.55;
          color: #5a5a5a;
          font-weight: 450;
          max-width: 28em;
        }
        .empty {
          opacity: 0.65;
          font-size: 1.05rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 36px 24px;
        }
        .project {
          display: grid;
          gap: 12px;
          text-decoration: none;
          color: #2a2a2a;
        }
        .project:hover {
          text-decoration: none;
          color: #2a2a2a;
        }
        .project:hover .media {
          transform: translateY(-2px);
        }
        .media {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #eceae6;
          transition: transform 0.35s ease;
        }
        .placeholder {
          position: absolute;
          inset: 0;
          background: linear-gradient(145deg, #e8e4dc 0%, #f3efe6 55%, #ddd6c8 100%);
        }
        .project h2 {
          margin: 2px 0 0;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
          color: #2a2a2a;
        }
        .project p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.45;
          color: #6a6a6a;
          font-family: var(--font-serif);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 1100px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 32px 20px;
          }
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 32px 20px;
          }
        }
        @media (max-width: 760px) {
          .work {
            padding: 28px 16px 72px;
          }
          .work-hero {
            margin-bottom: 28px;
          }
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px 12px;
          }
          .media {
            aspect-ratio: 1 / 1;
          }
          .project {
            gap: 8px;
          }
          .project h2 {
            font-size: 0.95rem;
          }
          .project p {
            font-size: 0.82rem;
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
    </main>
  );
}
