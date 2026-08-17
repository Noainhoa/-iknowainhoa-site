"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { externalAnchorProps, isExternalHref } from "@/lib/links";
import type { Locale } from "@/lib/i18n/shared";
import {
  groupWorkByCategory,
  type WorkCategory,
  type WorkItem,
} from "@/lib/work-shared";
import { WORK_BRANDS, workBrandOmitSlugs } from "@/lib/workBrands";

type SectionLabels = Record<WorkCategory, string>;

function BrandLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className: string;
  children: ReactNode;
  ariaLabel: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        {...externalAnchorProps(href)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function ProjectCard({
  item,
  priority,
}: {
  item: WorkItem;
  priority?: boolean;
}) {
  const isLogoTile = Boolean(item.logo && item.coverImage === item.logo);

  return (
    <Link href={item.href} className="project">
      <div className="media">
        {item.coverImage ? (
          isLogoTile ? (
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
              priority={priority}
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
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </Link>
  );
}

export default function WorkIndex({
  items,
  title,
  subtitle,
  empty,
  liveTitle,
  sectionLabels,
  locale,
}: {
  items: WorkItem[];
  title: string;
  subtitle: string;
  empty: string;
  liveTitle: string;
  sectionLabels: SectionLabels;
  locale: Locale;
}) {
  const omit = workBrandOmitSlugs();
  const portfolio = items.filter((item) => !omit.has(item.slug));
  const sections = groupWorkByCategory(portfolio);

  return (
    <main className="work">
      <header className="work-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <section className="work-section work-brands" aria-labelledby="work-live">
        <h2 id="work-live">{liveTitle}</h2>
        <ul className="brand-list">
          {WORK_BRANDS.map((brand) => (
            <li key={brand.id}>
              <BrandLink
                href={brand.href}
                className={`brand-card${brand.wide ? " brand-card--wide" : ""}`}
                ariaLabel={brand.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt=""
                  className={`brand-logo brand-logo--${brand.id}`}
                />
                <span className="brand-copy">
                  <span className="brand-name">{brand.name}</span>
                  <span className="brand-summary">{brand.summary[locale]}</span>
                </span>
              </BrandLink>
            </li>
          ))}
        </ul>
      </section>

      {portfolio.length === 0 && sections.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : null}

      {sections.map((section) => (
        <section
          key={section.category}
          className="work-section"
          aria-labelledby={`work-${section.category}`}
        >
          <h2 id={`work-${section.category}`}>
            {sectionLabels[section.category]}
          </h2>
          <div className="grid">
            {section.items.map((item, index) => (
              <ProjectCard
                key={item.slug}
                item={item}
                priority={section.category === sections[0]?.category && index < 2}
              />
            ))}
          </div>
        </section>
      ))}

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
          margin-bottom: 56px;
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
        .work-section {
          margin-top: 64px;
        }
        .work-section:first-of-type {
          margin-top: 0;
        }
        .work-section h2 {
          margin: 0 0 28px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6a6a6a;
        }
        .empty {
          opacity: 0.65;
          font-size: 1.05rem;
        }
        .brand-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px 16px;
        }
        .brand-card {
          display: grid;
          grid-template-rows: 120px auto;
          gap: 14px;
          text-decoration: none !important;
          color: inherit !important;
        }
        .brand-card:hover .brand-name {
          color: var(--link);
        }
        .brand-logo {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 88px;
          margin: 0 auto;
          object-fit: contain;
        }
        .brand-card--wide .brand-logo {
          max-height: 64px;
          max-width: 160px;
        }
        .brand-logo--parking,
        .brand-logo--anicca,
        .brand-logo--listeneasy {
          max-height: 96px;
        }
        .brand-copy {
          display: grid;
          gap: 4px;
          text-align: center;
        }
        .brand-name {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: #2a2a2a;
          transition: color 0.2s ease;
        }
        .brand-summary {
          font-family: var(--font-serif);
          font-size: 0.9rem;
          line-height: 1.4;
          color: #6a6a6a;
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
        .project h3 {
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
        @media (min-width: 900px) {
          .brand-list {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 28px 24px;
          }
          .brand-card {
            grid-template-rows: 132px auto;
          }
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
            margin-bottom: 36px;
          }
          .work-section {
            margin-top: 48px;
          }
          .work-section h2 {
            margin-bottom: 18px;
          }
          .brand-list {
            gap: 22px 12px;
          }
          .brand-card {
            grid-template-rows: 100px auto;
            gap: 10px;
          }
          .brand-logo--parking,
          .brand-logo--anicca,
          .brand-logo--listeneasy {
            max-height: 80px;
          }
          .brand-card--wide .brand-logo {
            max-height: 52px;
            max-width: 130px;
          }
          .brand-name {
            font-size: 0.92rem;
          }
          .brand-summary {
            font-size: 0.8rem;
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
          .project h3 {
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
