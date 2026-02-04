import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getShortcut, shortcuts } from "@/lib/shortcuts";

export async function generateStaticParams() {
  return shortcuts.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sc = getShortcut(slug);
  if (!sc) return { title: "Shortcut not found" };
  return {
    title: sc.name,
    description: sc.metaDescription,
  };
}

export default async function ShortcutPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sc = getShortcut(slug);
  if (!sc) return notFound();

  return (
    <main style={{ padding: "32px 24px", fontFamily: "system-ui", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/shortcuts" style={{ textDecoration: "none", fontSize: 14, opacity: 0.7 }}>
        ← Back to shortcuts
      </Link>
      <header style={{ marginTop: 12, marginBottom: 20 }}>
        <p style={{ textTransform: "uppercase", letterSpacing: 0.4, fontSize: 13, opacity: 0.6, margin: 0 }}>
          iPhone automation
        </p>
        <h1 style={{ margin: "6px 0 8px 0", fontSize: 34, fontWeight: 750 }}>{sc.name}</h1>
        <p style={{ margin: 0, opacity: 0.78, lineHeight: 1.6 }}>{sc.description}</p>
      </header>

      <section style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 700 }}>What it does</h2>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{sc.words}</p>
      </section>

      <section style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Installation</h3>
        <ol style={{ paddingLeft: 18, lineHeight: 1.7, margin: 0 }}>
          <li>Tap the download link below; it opens in the Shortcuts app.</li>
          <li>If prompted, allow untrusted shortcuts (Settings → Shortcuts).</li>
          <li>Review the actions, then tap Add Shortcut.</li>
          <li>Run once to grant permissions (Photos, Reminders, etc.).</li>
        </ol>
        <div style={{ marginTop: 8 }}>
          <a
            href={sc.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--primary)",
              color: "var(--primary-contrast)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Get the shortcut
          </a>
        </div>
      </section>

      <section style={{ display: "grid", gap: 8, marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Requirements</h3>
        <p style={{ margin: 0 }}>iOS version: {sc.iosVersion}</p>
        {sc.permissions.length > 0 && (
          <p style={{ margin: 0 }}>
            Permissions: {sc.permissions.join(", ")}
          </p>
        )}
      </section>

      {sc.screenshots?.length ? (
        <section style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Screenshots / Demo</h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {sc.screenshots.map((src) => (
              <img
                key={src}
                src={src}
                alt={sc.name}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--muted)",
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {sc.terms && (
        <section style={{ display: "grid", gap: 6, marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Terms of use</h3>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{sc.terms}</p>
        </section>
      )}
    </main>
  );
}
