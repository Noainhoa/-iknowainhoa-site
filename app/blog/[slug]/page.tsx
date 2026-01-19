import { notFound } from "next/navigation";
import Image from "next/image";
import { getBySlug, listSlugs } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await listSlugs("blog");
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  // Next 16 can provide params as a Promise (Server Components).
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;      // ✅ unwrap
  const post = await getBySlug("blog", slug);
  if (!post) return notFound();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
      {post.coverImage && (
        <div style={{ marginBottom: 24, overflow: "hidden", borderRadius: 8 }}>
          <Image
            src={post.coverImage}
            alt={post.title || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
      {post.date ? <div style={{ opacity: 0.6, marginBottom: 16, fontSize: 14 }}>{post.date}</div> : null}
      <div style={{ marginTop: 24, lineHeight: 1.7, prose: true }} dangerouslySetInnerHTML={{ __html: post.html }} />
    </main>
  );
}
