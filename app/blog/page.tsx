import Link from "next/link";
import { getAll } from "@/lib/content";

export default async function BlogIndex() {
  const posts = await getAll("blog");

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Blog</h1>

      <ul style={{ marginTop: 24 }}>
        {posts.map((p) => (
          <li key={p.slug} style={{ marginBottom: 16 }}>
            <Link href={`/blog/${p.slug}`} style={{ fontSize: 20 }}>
              {p.title}
            </Link>
            {p.description ? (
              <div style={{ opacity: 0.8, marginTop: 4 }}>{p.description}</div>
            ) : null}
            {p.date ? (
              <div style={{ opacity: 0.6, marginTop: 4 }}>{p.date}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
