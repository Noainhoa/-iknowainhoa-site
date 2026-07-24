import Link from "next/link";
import BlankPage from "@/components/BlankPage";
import { shortcuts } from "@/lib/shortcuts";
import { publicPages } from "@/lib/site";

export const metadata = {
  title: "iPhone Shortcuts Library",
  description: "A small library of iOS shortcuts for everyday productivity, automations, and creative workflows.",
};

export default function ShortcutsPage() {
  if (!publicPages.shortcuts) return <BlankPage />;

  return (
    <main style={{ padding: "32px 24px", fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ textTransform: "uppercase", letterSpacing: 0.4, fontSize: 13, opacity: 0.6, margin: 0 }}>
          Projects
        </p>
        <h1 style={{ fontSize: 38, fontWeight: 750, margin: "6px 0 10px 0" }}>iPhone Shortcuts Library</h1>
        <p style={{ maxWidth: 640, lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
          A curated set of iOS shortcuts I rely on for productivity hacks, quick captures, and repeatable iPhone workflows.
        </p>
      </header>

      <section style={{ display: "grid", gap: 16 }}>
        {shortcuts.map((sc) => (
          <Link
            key={sc.slug}
            href={`/shortcuts/${sc.slug}`}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 16,
              textDecoration: "none",
              color: "inherit",
              display: "grid",
              gap: 6,
              background: "var(--card)",
              transition: "transform 150ms ease, box-shadow 150ms ease",
            }}
            className="hover:shadow-lg hover:-translate-y-[2px]"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{sc.name}</h2>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 8,
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  opacity: 0.8,
                }}
              >
                iOS shortcuts
              </span>
            </div>
            <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.5 }}>{sc.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
