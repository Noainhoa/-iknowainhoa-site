import Link from "next/link";
import BlankPage from "@/components/BlankPage";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";
import { publicPages } from "@/lib/site";

export default async function ThankYouPage() {
  if (!publicPages.thanks) return <BlankPage />;

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans)",
        minHeight: "60vh",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--foreground-muted)",
        }}
      >
        {t.thanks.kicker}
      </p>
      <h1
        style={{
          margin: "12px 0 16px",
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
          fontWeight: 500,
          lineHeight: 1.15,
        }}
      >
        {t.thanks.title}
      </h1>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--foreground-muted)", maxWidth: "36rem" }}>
        {t.thanks.body}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 32 }}>
        <Link
          href="/anicca"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 20px",
            borderRadius: 999,
            background: "#1c1917",
            color: "#f8f5f0",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {t.thanks.backAnicca}
        </Link>
        <Link href="/" style={{ alignSelf: "center", fontSize: 14, color: "var(--foreground-muted)" }}>
          {t.thanks.home}
        </Link>
      </div>
    </main>
  );
}
