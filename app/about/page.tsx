import type { Metadata } from "next";
import Link from "next/link";
import BlankPage from "@/components/BlankPage";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";
import { publicPages } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return {
    title: t.about.title,
    description: t.about.intro1,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  if (!publicPages.about) return <BlankPage />;

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main style={{ padding: 32, fontFamily: "var(--font-geist-sans)", maxWidth: 720, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{t.about.title}</h1>
      </header>

      <section style={{ display: "grid", gap: 16, marginBottom: 32 }}>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, opacity: 0.9 }}>
          {t.about.intro1}
        </p>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, opacity: 0.85 }}>
          {t.about.intro2}
        </p>
      </section>

      <section style={{ display: "grid", gap: 12, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{t.about.whatIDoTitle}</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, opacity: 0.85 }}>
          {t.about.whatIDoIntro}
        </p>
        <ul style={{ margin: "0 0 0 1.1rem", padding: 0, fontSize: 15, lineHeight: 1.7, opacity: 0.85 }}>
          <li>{t.about.bullet1}</li>
          <li>{t.about.bullet2}</li>
          <li>{t.about.bullet3}</li>
        </ul>
      </section>

      <section style={{ display: "grid", gap: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{t.about.touchTitle}</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, opacity: 0.85 }}>
          {t.about.touchBody}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
          <Link
            href="/contact"
            style={{
              textDecoration: "none",
              color: "inherit",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              fontSize: 14,
            }}
            className="hover:opacity-100"
          >
            {t.about.touchButton}
          </Link>
        </div>
      </section>
    </main>
  );
}

