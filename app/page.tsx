import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>iknowainhoa</h1>
      <p style={{ marginTop: 12, fontSize: 18 }}>
        This page is deployed from my own files. Yo soy Ainhoa.
      </p>
      // somewhere in your JSX:
      <Link href="/blog">Go to Blog</Link>
    </main>
  );
}
