import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getAllBlogSlugs } from "@/lib/content";
import { getLocalizedBlogPost } from "@/lib/blogLocale";
import { SupportCard } from "@/components/SupportCard";
import BlogAsideGallery from "@/components/gallery/BlogAsideGallery";
import { getAsideGallery } from "@/lib/galleries/blue";
import { site } from "@/lib/site";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getLocalizedBlogPost(slug, locale);

  if (!post) {
    return { title: "Not Found" };
  }

  const canonical = `${site.url}/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: "article",
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const post = await getLocalizedBlogPost(slug, locale);
  if (!post) return notFound();

  const asideId =
    typeof post.metadata?.asideGallery === "string" ? post.metadata.asideGallery : null;
  const aside = asideId ? getAsideGallery(asideId, locale) : null;
  const hasAside = Boolean(aside?.items.length);

  return (
    <main>
      {post.draft ? (
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 11,
            letterSpacing: 0.14,
            textTransform: "uppercase",
            opacity: 0.5,
            fontFamily: "var(--blog-sans)",
          }}
        >
          {t.blog.draftBadge}
        </p>
      ) : null}

      {post.coverImage ? (
        <div
          className="blog-hero"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            maxHeight: 420,
            marginBottom: 28,
            overflow: "hidden",
            background: "#f3f3f3",
          }}
        >
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 900px"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: hasAside ? "minmax(0, 1fr) minmax(180px, 220px)" : "1fr",
          gap: hasAside ? 36 : 0,
          alignItems: "start",
        }}
        className="post-layout"
      >
        <article>
          <h1
            style={{
              fontFamily: "var(--blog-sans)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              margin: "0 0 14px",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 18,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.08,
              textTransform: "uppercase",
              opacity: 0.65,
              flexWrap: "wrap",
              fontFamily: "var(--blog-sans)",
            }}
          >
            {post.date ? <time dateTime={post.date}>{post.date}</time> : null}
            {post.tags?.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>

          {post.description ? (
            <p
              style={{
                fontFamily: "var(--blog-serif)",
                fontSize: "1.2rem",
                lineHeight: 1.55,
                margin: "0 0 28px",
                opacity: 0.85,
              }}
            >
              {post.description}
            </p>
          ) : null}

          {hasAside && aside ? (
            <div className="aside-mobile" style={{ marginBottom: 28 }}>
              <BlogAsideGallery items={aside.items} href={aside.href} title={aside.title} />
            </div>
          ) : null}

          <div
            className="prose blog-prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>

        {hasAside && aside ? (
          <div className="aside-desktop">
            <BlogAsideGallery items={aside.items} href={aside.href} title={aside.title} />
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 56 }}>
        <SupportCard locale={locale} variant="compact" />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .post-layout {
            grid-template-columns: 1fr !important;
          }
          .aside-desktop {
            display: none !important;
          }
          .blog-hero {
            max-height: 280px !important;
            aspect-ratio: 4 / 3 !important;
          }
        }
        @media (min-width: 901px) {
          .aside-mobile {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
