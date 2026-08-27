import Link from "next/link";
import Image from "next/image";
import { getLocalizedBlogIndex } from "@/lib/blogLocale";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";

type Props = {
  searchParams?: Promise<{ q?: string }> | { q?: string };
};

export default async function BlogIndex({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params?.q || "").trim().toLowerCase();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const posts = await getLocalizedBlogIndex(locale);

  const filtered = q
    ? posts.filter((post) => {
        const hay = [post.title, post.description, ...(post.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : posts;

  return (
    <main>
      <h1
        style={{
          fontFamily: "var(--blog-sans)",
          fontSize: "clamp(2rem, 4vw, 2.75rem)",
          fontWeight: 800,
          margin: "0 0 8px",
          letterSpacing: "-0.03em",
        }}
      >
        {t.blog.title}
      </h1>
      <p
        style={{
          margin: "0 0 32px",
          fontFamily: "var(--blog-serif)",
          fontSize: 18,
          opacity: 0.75,
          maxWidth: 540,
        }}
      >
        {t.blog.subtitle}
      </p>

      {q ? (
        <p style={{ marginBottom: 20, fontSize: 14, opacity: 0.7 }}>
          {t.blog.showing(filtered.length, params?.q || "")}{" "}
          <Link href="/blog">{t.blog.clear}</Link>
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p style={{ opacity: 0.7 }}>{t.blog.empty}</p>
      ) : (
        <div style={{ display: "grid", gap: 28 }}>
          {filtered.map((post) => (
            <article
              key={post.filePath || post.slug}
              style={{
                display: "grid",
                gridTemplateColumns: post.coverImage ? "minmax(0, 1fr) minmax(120px, 200px)" : "1fr",
                gap: 20,
                alignItems: "center",
                paddingBottom: 24,
                borderBottom: "1px solid #e8e8e8",
              }}
            >
              <div>
                {post.date ? (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.1,
                      textTransform: "uppercase",
                      opacity: 0.55,
                      marginBottom: 8,
                      fontFamily: "var(--blog-sans)",
                    }}
                  >
                    {post.date}
                  </div>
                ) : null}
                <h2 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, lineHeight: 1.15 }}>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.description ? (
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--blog-serif)",
                      fontSize: 17,
                      lineHeight: 1.55,
                      opacity: 0.8,
                    }}
                  >
                    {post.description}
                  </p>
                ) : null}
              </div>
              {post.coverImage ? (
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    position: "relative",
                    display: "block",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    background: "#f3f3f3",
                  }}
                >
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes="200px"
                    style={{ objectFit: "cover" }}
                  />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
