import Link from "next/link";
import BlankPage from "@/components/BlankPage";
import { publicPages } from "@/lib/site";

export default function ThankYouPage() {
  if (!publicPages.thanks) return <BlankPage />;

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
        Thank you
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
        Your order is confirmed.
      </h1>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--foreground-muted)", maxWidth: "36rem" }}>
        Payment went through successfully. You will receive a confirmation from Stripe, and the token will be
        prepared for dispatch.
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
          Back to Anicca
        </Link>
        <Link href="/" style={{ alignSelf: "center", fontSize: 14, color: "var(--foreground-muted)" }}>
          Home
        </Link>
      </div>
    </main>
  );
}
