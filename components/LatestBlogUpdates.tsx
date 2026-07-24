import Link from "next/link";
import Image from "next/image";
import { getAll } from "@/lib/content";

type LatestBlogUpdatesProps = {
  limit?: number;
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  expandable?: boolean;
};

export default async function LatestBlogUpdates({
  limit = 3,
  title = "Latest from Blog",
  viewAllHref = "/blog",
  viewAllLabel = "See all posts",
  expandable = false,
}: LatestBlogUpdatesProps) {
  const posts = await getAll("blog");
  const latestPosts = posts.slice(0, limit);

  return (
    <section style={{ marginTop: 42 }}>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 14,
          background: "var(--card)",
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.1, opacity: 0.55, margin: "6px 8px 10px" }}>
          {title}
        </div>

        {latestPosts.length === 0 ? (
          <div style={{ padding: 12, opacity: 0.7 }}>No posts yet.</div>
        ) : (
          <div style={{ display: "grid" }}>
            {latestPosts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr minmax(140px, 22%)",
                  gap: 14,
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  padding: "12px 10px",
                  borderTop: index === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.25, fontWeight: 700 }}>
                    {post.title}
                  </h3>
                  {post.date ? (
                    <div style={{ marginTop: 8, fontSize: 12, letterSpacing: 1.1, opacity: 0.55, textTransform: "uppercase" }}>
                      {post.date}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={240}
                      height={240}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontSize: 12, opacity: 0.45 }}>No image</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 10, padding: "0 10px 6px" }}>
          {expandable ? (
            <details className="latest-updates-details">
              <summary
                style={{
                  fontSize: 12,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  userSelect: "none",
                  listStyle: "none",
                }}
              >
                {viewAllLabel}
              </summary>
              <div style={{ display: "grid", marginTop: 10 }}>
                {posts.slice(limit).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr minmax(140px, 22%)",
                      gap: 14,
                      alignItems: "center",
                      textDecoration: "none",
                      color: "inherit",
                      padding: "12px 10px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.25, fontWeight: 700 }}>
                        {post.title}
                      </h3>
                      {post.date ? (
                        <div style={{ marginTop: 8, fontSize: 12, letterSpacing: 1.1, opacity: 0.55, textTransform: "uppercase" }}>
                          {post.date}
                        </div>
                      ) : null}
                    </div>

                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          width={240}
                          height={240}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <span style={{ fontSize: 12, opacity: 0.45 }}>No image</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          ) : (
            <Link
              href={viewAllHref}
              style={{
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              {viewAllLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
