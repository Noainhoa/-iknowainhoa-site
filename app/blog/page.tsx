import Link from "next/link";
import { getAllBlogPosts } from "../../lib/content";

export default function BlogIndex() {
  const posts = getAllBlogPosts();

  return (
    <main style={{ padding: 24 }}>
      <h1>Blog</h1>
      <ul style={{ marginTop: 16 }}>
        {posts.map((p) => (
          <li key={p.slug} style={{ marginBottom: 12 }}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            {p.date ? <div style={{ opacity: 0.7, fontSize: 14 }}>{p.date}</div> : null}
            {p.excerpt ? <div style={{ marginTop: 4 }}>{p.excerpt}</div> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
