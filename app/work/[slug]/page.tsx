import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlankPage from "@/components/BlankPage";
import {
  categoryLabel,
  getAllWork,
  getAllWorkSlugs,
  getWorkBySlug,
} from "@/lib/work";
import { getProductApp } from "@/lib/productApps";
import { publicPages } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getWorkBySlug(slug);
  if (!entry) return { title: "Not Found" };

  return {
    title: entry.item.title,
    description: entry.item.description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: entry.item.coverImage
      ? { images: [entry.item.coverImage] }
      : undefined,
  };
}

export default async function WorkCaseStudyPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  if (!publicPages.work) return <BlankPage />;

  const { slug } = await params;
  const entry = await getWorkBySlug(slug);
  if (!entry) return notFound();

  const { item, bodyHtml } = entry;
  const productApp = getProductApp(slug);
  const more = (await getAllWork()).filter((w) => w.slug !== slug).slice(0, 6);

  return (
    <main className="case">
      <nav className="crumb">
        <Link href="/work">Work</Link>
        <span aria-hidden>/</span>
        <span>{item.title}</span>
      </nav>

      <header className="hero">
        <p className="eyebrow">{categoryLabel(item.category)}</p>
        <h1>{item.title}</h1>
        {item.description ? <p className="lede">{item.description}</p> : null}

        {item.tags.length > 0 ? (
          <ul className="roles">
            {item.tags
              .filter((t) => !["draft", "apps", "website", "websites"].includes(t))
              .slice(0, 6)
              .map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
          </ul>
        ) : null}

        <div className="actions">
          {item.externalHref ? (
            <a href={item.externalHref} target="_blank" rel="noopener noreferrer">
              Visit live site
            </a>
          ) : null}
          {productApp ? (
            <Link href={`/${productApp.slug}`}>Product page</Link>
          ) : null}
        </div>
      </header>

      {item.coverImage ? (
        <figure className="cover">
          <Image
            src={item.coverImage}
            alt=""
            width={1400}
            height={900}
            priority
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <figcaption>{item.title}</figcaption>
        </figure>
      ) : null}

      {bodyHtml ? (
        <article
          className="body prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : productApp ? (
        <article className="body">
          <p>{productApp.summary}</p>
          <p>
            <Link href={`/${productApp.slug}`}>Open the {productApp.name} page</Link>{" "}
            for features, support, and privacy.
          </p>
        </article>
      ) : null}

      {more.length > 0 ? (
        <section className="more" aria-labelledby="more-heading">
          <h2 id="more-heading">More work</h2>
          <div className="more-grid">
            {more.map((w) => (
              <Link key={w.slug} href={w.href} className="more-card">
                <div className="more-media">
                  {w.coverImage ? (
                    <Image
                      src={w.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 50vw, 220px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span className="more-ph">{categoryLabel(w.category)}</span>
                  )}
                </div>
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <style>{`
        .case {
          max-width: 920px;
          margin: 0 auto;
          padding: 40px 28px 96px;
          font-family: var(--font-geist-sans);
          color: var(--foreground);
        }
        .crumb {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 0.85rem;
          color: var(--foreground-muted);
          margin-bottom: 36px;
        }
        .crumb a {
          color: inherit;
          text-decoration: none;
        }
        .crumb a:hover {
          text-decoration: underline;
        }
        .hero {
          max-width: 720px;
          margin-bottom: 40px;
        }
        .eyebrow {
          margin: 0 0 12px;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--foreground-muted);
          font-weight: 700;
        }
        .hero h1 {
          margin: 0;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 750;
          letter-spacing: -0.035em;
          line-height: 1.02;
        }
        .lede {
          margin: 22px 0 0;
          font-size: 1.2rem;
          line-height: 1.7;
          color: var(--foreground-muted);
          font-family: var(--font-serif);
        }
        .roles {
          list-style: none;
          margin: 28px 0 0;
          padding: 0;
          display: grid;
          gap: 6px;
        }
        .roles li {
          font-size: 0.95rem;
          color: var(--foreground-muted);
        }
        .roles li::before {
          content: "·";
          margin-right: 10px;
          color: var(--joy-yellow-deep);
          font-weight: 700;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 28px;
        }
        .actions a {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--foreground);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .cover {
          margin: 0 0 48px;
        }
        .cover figcaption {
          margin-top: 10px;
          font-size: 0.8rem;
          color: var(--foreground-muted);
        }
        .body {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          line-height: 1.75;
          max-width: 680px;
        }
        .body :global(h1) {
          display: none;
        }
        .body :global(h2),
        .body :global(h3) {
          font-family: var(--font-geist-sans);
          letter-spacing: -0.02em;
          margin-top: 2em;
        }
        .body :global(img) {
          border-radius: 2px;
          margin: 1.5rem 0;
        }
        .more {
          margin-top: 88px;
          padding-top: 48px;
          border-top: 1px solid var(--border);
        }
        .more h2 {
          margin: 0 0 28px;
          font-size: 1.75rem;
          letter-spacing: -0.02em;
        }
        .more-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px 20px;
        }
        .more-card {
          display: grid;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }
        .more-card:hover {
          text-decoration: none;
          color: inherit;
        }
        .more-media {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--muted);
        }
        .more-ph {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--foreground-muted);
        }
        .more-card h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
        }
        .more-card p {
          margin: 4px 0 0;
          font-size: 0.92rem;
          line-height: 1.45;
          color: var(--foreground-muted);
          font-family: var(--font-serif);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 800px) {
          .more-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 560px) {
          .case {
            padding: 28px 18px 72px;
          }
          .more-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
