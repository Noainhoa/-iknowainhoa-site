import { site } from "@/lib/site";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "28px 24px",
        fontFamily: "var(--font-geist-sans)",
        backgroundColor: "var(--background)",
        marginTop: 64,
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {site.name}
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--foreground-muted)",
            margin: "6px 0 0 0",
            lineHeight: 1.5,
          }}
        >
          {site.description}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--foreground-muted)",
            margin: "12px 0 0 0",
          }}
        >
          © {currentYear} {site.name}
        </p>
      </div>
    </footer>
  );
}
