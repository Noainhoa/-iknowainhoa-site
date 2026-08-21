import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlankPage from "@/components/BlankPage";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";
import {
  getListedWork,
  getAllWorkSlugs,
  getWorkBySlug,
} from "@/lib/work";
import { splitCaseBody } from "@/lib/workCaseBody";
import { getProductApp } from "@/lib/productApps";
import { externalAnchorProps, isExternalHref } from "@/lib/links";
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
  const locale = await getLocale();
  const entry = await getWorkBySlug(slug, locale);
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
  const locale = await getLocale();
  const t = getDictionary(locale);
  const entry = await getWorkBySlug(slug, locale);
  if (!entry) return notFound();

  const { item, bodyHtml } = entry;
  const productApp = getProductApp(slug);
  const more = (await getListedWork(locale)).filter((w) => w.slug !== slug).slice(0, 6);
  const blocks = bodyHtml ? splitCaseBody(bodyHtml) : [];
  const hasShots = blocks.some((b) => b.type === "shot");
  const showHeroCover = Boolean(item.coverImage) && !item.logo && !hasShots;

  return (
    <main className="case">
      <header className="intro">
        <h1>{item.title}</h1>
        {item.description ? <p className="lede">{item.description}</p> : null}

        {item.logo ? (
          <div className="logo-wrap">
            {item.externalHref ? (
              <a
                href={item.externalHref}
                {...externalAnchorProps(item.externalHref)}
                aria-label={item.externalCtaText || item.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.logo}
                  alt=""
                  width={160}
                  height={160}
                  style={{ width: 160, height: 160, display: "block", borderRadius: 12 }}
                />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.logo}
                alt=""
                width={160}
                height={160}
                style={{ width: 160, height: 160, display: "block", borderRadius: 12 }}
              />
            )}
          </div>
        ) : null}

        {(item.externalHref || productApp) && (
          <p className="actions">
            {item.externalHref ? (
              <a href={item.externalHref} {...externalAnchorProps(item.externalHref)}>
                {item.externalCtaText || "Visit live site"}
              </a>
            ) : null}
            {productApp ? (
              <Link href={`/${productApp.slug}`}>Product page</Link>
            ) : null}
          </p>
        )}
      </header>

      {showHeroCover && item.coverImage ? (
        <figure className="shot">
          <div className="shot-frame">
            <Image
              src={item.coverImage}
              alt=""
              width={1400}
              height={900}
              priority
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
          <figcaption>{item.title}</figcaption>
        </figure>
      ) : null}

      {blocks.length > 0 ? (
        <div className="body">
          {blocks.map((block, i) =>
            block.type === "prose" ? (
              <div
                key={`p-${i}`}
                className="prose-block"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            ) : (
              <figure key={`s-${i}`} className="shot">
                <div
                  className="shot-frame"
                  dangerouslySetInnerHTML={{ __html: block.imgHtml }}
                />
                {block.caption ? (
                  <figcaption dangerouslySetInnerHTML={{ __html: block.caption }} />
                ) : null}
              </figure>
            )
          )}
        </div>
      ) : productApp ? (
        <div className="prose-block">
          <p>{productApp.summary}</p>
          <p>
            <Link href={`/${productApp.slug}`}>Open the {productApp.name} page</Link>{" "}
            for features, support, and privacy.
          </p>
        </div>
      ) : null}

      {more.length > 0 ? (
        <section className="more" aria-labelledby="more-heading">
          <h2 id="more-heading">{t.work.more}</h2>
          <div className="more-grid">
            {more.map((w) => {
              const card = (
                <>
                  <div
                    className="more-media"
                    style={
                      w.logo && w.coverImage === w.logo
                        ? { background: "#fff" }
                        : undefined
                    }
                  >
                    {w.coverImage ? (
                      <Image
                        src={w.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 50vw, 220px"
                        style={{
                          objectFit:
                            w.logo && w.coverImage === w.logo ? "contain" : "cover",
                          objectPosition: "center",
                          padding: w.logo && w.coverImage === w.logo ? 16 : 0,
                        }}
                      />
                    ) : (
                      <span className="more-ph" />
                    )}
                  </div>
                  <h3>{w.title}</h3>
                  <p>{w.summary}</p>
                </>
              );

              if (isExternalHref(w.href)) {
                return (
                  <a
                    key={w.slug}
                    href={w.href}
                    className="more-card"
                    {...externalAnchorProps(w.href)}
                  >
                    {card}
                  </a>
                );
              }

              return (
                <Link key={w.slug} href={w.href} className="more-card">
                  {card}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <style>{`
        .case {
          padding: 0 0 96px;
          font-family: var(--font-geist-sans);
          color: #2a2a2a;
          background: #fff;
        }
        .intro {
          max-width: 640px;
          margin: 0 auto;
          padding: 48px 28px 40px;
        }
        .intro h1 {
          margin: 0;
          font-size: clamp(2rem, 4.5vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: #2a2a2a;
        }
        .lede {
          margin: 22px 0 0;
          font-size: 1.05rem;
          line-height: 1.7;
          color: #555;
          max-width: 38em;
        }
        .logo-wrap {
          margin: 28px 0 0;
        }
        .logo-wrap a {
          display: inline-block;
          text-decoration: none;
        }
        .logo-wrap a:hover {
          opacity: 0.85;
          text-decoration: none;
        }
        .actions {
          margin: 28px 0 0;
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }
        .actions a {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2a2a2a;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-block {
          max-width: 640px;
          margin: 0 auto;
          padding: 8px 28px 32px;
          font-size: 1.05rem;
          line-height: 1.7;
          color: #555;
        }
        .prose-block :global(h1) {
          display: none;
        }
        .prose-block :global(h2),
        .prose-block :global(h3) {
          margin: 1.6em 0 0.55em;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #2a2a2a;
        }
        .prose-block :global(p) {
          margin: 0 0 1.1em;
        }
        .prose-block :global(ul),
        .prose-block :global(ol) {
          margin: 0 0 1.25em;
          padding-left: 1.2em;
        }
        .prose-block :global(li) {
          margin: 0.35em 0;
        }
        .prose-block :global(a) {
          color: #2a2a2a;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .shot {
          margin: 0;
          padding: 48px 20px 36px;
          background: #1c1c1c;
        }
        .shot + .shot {
          padding-top: 12px;
        }
        .shot-frame {
          max-width: 920px;
          margin: 0 auto;
        }
        .shot-frame :global(img) {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 2px;
        }
        .shot figcaption {
          max-width: 920px;
          margin: 14px auto 0;
          font-size: 0.88rem;
          line-height: 1.45;
          color: #b0b0b0;
          text-align: center;
        }
        .shot figcaption :global(a) {
          color: #d8d8d8;
        }
        .more {
          max-width: 1080px;
          margin: 72px auto 0;
          padding: 0 28px;
        }
        .more h2 {
          margin: 0 0 32px;
          font-size: 1.65rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #2a2a2a;
        }
        .more-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 36px 24px;
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
          background: #eceae6;
        }
        .more-ph {
          position: absolute;
          inset: 0;
          background: #eceae6;
        }
        .more-card h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #2a2a2a;
        }
        .more-card p {
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
        @media (max-width: 800px) {
          .more-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 560px) {
          .intro,
          .prose-block {
            padding-left: 18px;
            padding-right: 18px;
          }
          .shot {
            padding: 32px 12px 28px;
          }
          .more {
            padding: 0 18px;
          }
          .more-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
