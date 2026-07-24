import { site } from "@/lib/site";

export default async function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "32px 24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "var(--muted)",
        marginTop: 64,
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p style={{ fontSize: "0.9rem", fontWeight: 600, margin: 0 }}>{site.name}</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.8, margin: "4px 0 0 0" }}>{site.description}</p>
      </div>
    </footer>
  );
}
