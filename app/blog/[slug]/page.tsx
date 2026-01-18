import { notFound } from "next/navigation";
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
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800 }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>{post.title}</h1>
      {post.date ? <div style={{ opacity: 0.6, marginTop: 8 }}>{post.date}</div> : null}
      <div style={{ marginTop: 24, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: post.html }} />
    </main>
  );
}
