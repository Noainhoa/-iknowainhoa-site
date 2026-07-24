import { publicPages } from "@/lib/site";
import BlankPage from "@/components/BlankPage";
import Link from "next/link";
import { getAllWork } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";

export default async function Home() {
  if (!publicPages.homeContent) {
    return <BlankPage />;
  }

  const locale = await getLocale();
  const t = getDictionary(locale);
  const work = await getAllWork();
  const featured = work.slice(0, 3);

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 960, margin: "0 auto" }}>
      <section style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 14, letterSpacing: 0.4, textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>
          iknowainhoa
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 750, margin: 0, lineHeight: 1.1 }}>
          {t.home.heroTitle}
        </h1>
        <p style={{ fontSize: 18, opacity: 0.8, marginTop: 16, maxWidth: 720, lineHeight: 1.6 }}>
          {t.home.heroSubtitle}
        </p>
      </section>

      {featured.length > 0 && (
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t.home.featuredTitle}</h2>
            <Link
              href="/work"
              style={{ fontSize: 14, opacity: 0.7, textDecoration: "none", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: 1 }}
              className="hover:opacity-100"
            >
              {t.home.viewAllWork}
            </Link>
          </div>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {featured.map((item) => (
              <Link
                key={`${item.kind}-${item.href}`}
                href={item.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  padding: 14,
                  background: "var(--background)",
                  display: "grid",
                  gap: 6,
                }}
                className="hover:opacity-100"
              >
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.12,
                    opacity: 0.6,
                  }}
                >
                  {item.kind}
                </span>
                <span style={{ fontWeight: 600 }}>{item.title}</span>
                {item.description && (
                  <span style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
                    {item.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section
        style={{
          borderRadius: 16,
          border: "1px solid var(--border)",
          padding: 20,
          background: "var(--card)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.home.aboutCtaTitle}</h2>
        <p style={{ margin: 0, fontSize: 15, opacity: 0.8, lineHeight: 1.6 }}>
          {t.home.aboutCtaBody}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
          <Link
            href="/about"
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
            {t.home.aboutButton}
          </Link>
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
            {t.home.contactButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
