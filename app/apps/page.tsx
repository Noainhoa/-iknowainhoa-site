import Link from "next/link";
import Image from "next/image";
import BlankPage from "@/components/BlankPage";
import { getAllApps } from "@/lib/content";
import { publicPages } from "@/lib/site";

export default async function AppsIndex() {
  if (!publicPages.apps) return <BlankPage />;

  const apps = await getAllApps();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Apps</h1>

      {apps.length === 0 ? (
        <div style={{ marginTop: 64, textAlign: "center", opacity: 0.6 }}>
          <p style={{ fontSize: 18 }}>No apps yet</p>
        </div>
      ) : (
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {apps.map((app) => (
            <Link
              key={app.slug}
              href={`/apps/${app.slug}`}
              className="block rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                textDecoration: "none",
                color: "inherit",
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              <div style={{ width: "100%", height: 160, overflow: "hidden", backgroundColor: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {app.coverImage ? (
                  <Image
                    src={app.coverImage}
                    alt={app.title}
                    width={280}
                    height={160}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.4, textAlign: "center" }}>No image</div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>{app.title}</h2>
                {app.description ? (
                  <div style={{ opacity: 0.7, marginBottom: 8, fontSize: 14, lineHeight: 1.5 }}>{app.description}</div>
                ) : null}
                {app.date ? (
                  <div style={{ opacity: 0.6, fontSize: 13 }}>{app.date}</div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
