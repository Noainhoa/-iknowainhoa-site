import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800 }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 12 }}>iknowainhoa</h1>
      <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32 }}>
        A fully custom site where I share my thoughts, projects, and ideas.
      </p>

      <nav style={{ marginTop: 40 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/blog" style={{ fontSize: 24, fontWeight: 600, textDecoration: "none", color: "#0070f3" }}>
            → Blog
          </Link>
          <p style={{ marginTop: 8, opacity: 0.6 }}>Read my latest thoughts and articles.</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Link href="/projects" style={{ fontSize: 24, fontWeight: 600, textDecoration: "none", color: "#0070f3" }}>
            → Projects
          </Link>
          <p style={{ marginTop: 8, opacity: 0.6 }}>Explore my recent work and experiments.</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Link href="/offers" style={{ fontSize: 24, fontWeight: 600, textDecoration: "none", color: "#0070f3" }}>
            → Offers
          </Link>
          <p style={{ marginTop: 8, opacity: 0.6 }}>Check out what I'm offering.</p>
        </div>

        <div>
          <Link href="/l/test" style={{ fontSize: 24, fontWeight: 600, textDecoration: "none", color: "#0070f3" }}>
            → Test Landing
          </Link>
          <p style={{ marginTop: 8, opacity: 0.6 }}>A test landing page.</p>
        </div>
      </nav>
    </main>
  );
}
