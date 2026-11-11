"use client";

import Image from "next/image";
import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";
import { externalAnchorProps, isExternalHref } from "@/lib/links";
import {
  groupWorkByCategory,
  type WorkCategory,
  type WorkItem,
} from "@/lib/work-shared";

type SectionLabels = Record<WorkCategory, string>;

function shiftTowardPointer(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === "touch") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);
  el.style.transition = "transform 140ms ease-out";
  el.style.transform = `translate3d(${(x * 0.18).toFixed(2)}px, ${(y * 0.35).toFixed(2)}px, 0)`;
}

function springBack(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.style.transform = "";
    return;
  }
  el.style.transition = "transform 680ms cubic-bezier(0.34, 1.45, 0.64, 1)";
  el.style.transform = "translate3d(0, 0, 0)";
}

function ProjectLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const motion = {
    "data-magnetic": "",
    onPointerMove: shiftTowardPointer,
    onPointerLeave: springBack,
  };
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} {...motion} {...externalAnchorProps(href)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...motion}>
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
    <ProjectLink href={item.href} className="project">
      <div className={isLogoTile ? "media is-mark" : "media"}>
        {item.coverImage ? (
          isLogoTile ? (
            <>
              {/* Logos skip the optimizer so the badge stays sharp. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="mark mark-rest" src={item.coverImage} alt="" />
              {item.logoHover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="mark mark-hover" src={item.logoHover} alt="" />
              ) : null}
            </>
          ) : (
            <Image
              src={item.coverImage}
              alt=""
              fill
              sizes="(max-width: 760px) 50vw, 18vw"
              quality={90}
              priority={priority}
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          )
        ) : (
          <div className="placeholder" aria-hidden />
        )}
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </ProjectLink>
  );
}

function WorkSection({
  category,
  label,
  items,
  priority,
}: {
  category: WorkCategory;
  label: string;
  items: WorkItem[];
  priority?: boolean;
}) {
  return (
    <section
      className={`work-section ${category}`}
      aria-labelledby={`work-${category}`}
    >
      <h2 id={`work-${category}`}>{label}</h2>
      <div className="grid">
        {items.map((item, index) => (
          <ProjectCard
            key={item.slug}
            item={item}
            priority={priority && index < 2}
          />
        ))}
      </div>
    </section>
  );
}

export default function WorkIndex({
  items,
  title,
  subtitle,
  empty,
  sectionLabels,
}: {
  items: WorkItem[];
  title: string;
  subtitle: string;
  empty: string;
  sectionLabels: SectionLabels;
}) {
  const sections = groupWorkByCategory(items);
  const apps = sections.find((section) => section.category === "apps");
  const rest = sections.filter((section) => section.category !== "apps");

  return (
    <main className="work">
      <header className="work-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      {items.length === 0 ? <p className="empty">{empty}</p> : null}

      <div className="board">
        {apps ? (
          <WorkSection
            category={apps.category}
            label={sectionLabels[apps.category]}
            items={apps.items}
            priority
          />
        ) : null}
        {rest.length > 0 ? (
          <div className="rest">
            {rest.map((section) => (
              <WorkSection
                key={section.category}
                category={section.category}
                label={sectionLabels[section.category]}
                items={section.items}
              />
            ))}
          </div>
        ) : null}
      </div>

      <style>{`
        .work {
          max-width: 1120px;
          margin: 0 auto;
          padding: 48px 28px 96px;
          font-family: var(--font-geist-sans);
          color: var(--foreground);
        }
        .work-hero {
          max-width: 34em;
          margin-bottom: 36px;
        }
        .work-hero h1 {
          margin: 0;
          font-size: clamp(2.4rem, 5vw, 3.4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: var(--foreground);
        }
        .work-hero p {
          margin: 16px 0 0;
          font-size: clamp(1.05rem, 2vw, 1.25rem);
          line-height: 1.5;
          color: var(--foreground-muted);
          font-weight: 450;
          max-width: 28em;
        }
        .work-section h2 {
          margin: 0 0 14px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--foreground-muted);
        }
        .empty {
          opacity: 0.65;
          font-size: 1.05rem;
        }
        .apps .grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 22px 18px;
        }
        .rest {
          --gap: 18px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px var(--gap);
          width: calc((100% - 4 * var(--gap)) * 0.8 + 3 * var(--gap));
          margin: 32px auto 0;
        }
        .rest .systems {
          grid-column: span 2;
        }
        .rest .systems .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px var(--gap);
        }
        .project {
          display: grid;
          gap: 10px;
          text-decoration: none;
          color: var(--foreground);
          transform: translate3d(0, 0, 0);
        }
        .project:hover,
        .project:focus-visible {
          text-decoration: none;
          color: var(--foreground);
        }
        .media {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: transparent;
        }
        .mark {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: opacity 0.4s ease;
        }
        .mark-hover {
          opacity: 0;
        }
        .project:hover .mark-hover,
        .project:focus-visible .mark-hover {
          opacity: 1;
        }
        .project:hover .mark-rest:not(:only-child),
        .project:focus-visible .mark-rest:not(:only-child) {
          opacity: 0;
        }
        .placeholder {
          position: absolute;
          inset: 8%;
          border-radius: 22%;
          background: color-mix(in srgb, var(--foreground) 8%, transparent);
        }
        .project h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
          color: var(--foreground);
        }
        .project p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: var(--foreground-muted);
          font-family: var(--font-serif);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 980px) {
          .apps .grid,
          .rest .grid,
          .rest .systems .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .rest {
            width: auto;
            grid-template-columns: 1fr;
          }
          .rest .systems,
          .rest .work-section {
            grid-column: auto;
          }
        }
        @media (max-width: 640px) {
          .work {
            padding: 28px 16px 72px;
          }
          .work-hero {
            margin-bottom: 28px;
          }
          .apps .grid,
          .rest .grid,
          .rest .systems .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .rest {
            width: auto;
            margin-top: 28px;
          }
          .project h3 {
            font-size: 0.92rem;
          }
          .project p {
            font-size: 0.8rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .project {
            transform: none !important;
          }
          .mark {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
