import Link from "next/link";
import LikeCounter from "@/components/LikeCounter";

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 960, margin: "0 auto" }}>
      <section style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 14, letterSpacing: 0.4, textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>
          iknowainhoa
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 750, margin: 0, lineHeight: 1.05 }}>
          A playground for the things I build, learn, and ship.
        </h1>
        <p style={{ fontSize: 18, opacity: 0.8, marginTop: 14, maxWidth: 720, lineHeight: 1.6 }}>
          I share projects, essays, and tools as I go. It stays simple, intentional, and (usually) fast.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: 28,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 10px 0" }}>Navigation</h2>
          <nav style={{ display: "grid", gap: 12 }}>
            <HomeLink href="/blog" label="Blog" description="Read new notes and longer essays." />
            <HomeLink href="/projects" label="Projects" description="See the things I built recently." />
            <HomeLink href="/products" label="Products" description="Tiny, useful things I’m offering." />
            <HomeLink href="/support" label="Support ♥" description="Tip jar and ways to help." />
            <HomeLink href="/contact" label="Contact" description="Reach me directly." />
          </nav>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 10px 0" }}>About</h2>
          <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.85 }}>
            I build and ship in public because it keeps me honest and curious. I like working on
            scrappy tools, helpful guides, and products that feel human. If something on this site
            helps you, that’s the whole point.
          </p>
        </div>

        <LikeCounter />
      </section>
    </main>
  );
}

function HomeLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{
          display: "grid",
          gap: 4,
          padding: "10px 12px",
          borderRadius: 12,
          transition: "background 150ms ease, transform 150ms ease",
        }}
        className="home-link"
      >
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ opacity: 0.65 }}>{description}</span>
      </div>
      <style jsx>{`
        .home-link:hover {
          background: var(--muted);
          transform: translateY(-1px);
        }
      `}</style>
    </Link>
  );
}
