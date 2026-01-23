import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getBlogPost, getAllBlogSlugs } from "@/lib/content";
import { SupportCard } from "@/components/SupportCard";

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
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: post.coverImage
      ? { images: [post.coverImage] }
      : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return notFound();

  return (
    <main style={{ padding: "32px 24px", fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
      {/* Cover Image */}
      {post.coverImage && (
        <div style={{ marginBottom: 32, overflow: "hidden", borderRadius: 8, aspectRatio: "16/9" }}>
          <Image
            src={post.coverImage}
            alt={post.title || ""}
            width={800}
            height={450}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Header */}
      <article>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.2 }}>
          {post.title}
        </h1>

        {/* Meta Info */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24, fontSize: 14, opacity: 0.7 }}>
          {post.date && <time dateTime={post.date}>{post.date}</time>}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              {post.tags.map((tag) => (
                <span key={tag} style={{ backgroundColor: "#f0f0f0", padding: "4px 8px", borderRadius: 4 }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {post.description && (
          <p style={{ fontSize: "1.125rem", lineHeight: 1.6, marginBottom: 32, opacity: 0.8 }}>
            {post.description}
          </p>
        )}

        {/* Body */}
        <div
          className="prose"
          style={{
            marginTop: 32,
            lineHeight: 1.8,
            fontSize: "1rem",
          }}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>

      <div style={{ marginTop: 64 }}>
        <SupportCard buttonText="Send a thank you" variant="compact" hideBadges />
      </div>
    </main>
  );
}
