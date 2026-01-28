import Link from "next/link";
import Image from "next/image";
import { getAllProjects, type ContentIndexItem } from "@/lib/content";

export default async function ProjectsIndex() {
  const projects = await getAllProjects();
  const apps = projects.filter(
    (p) => (p.tags || []).some((t) => t.toLowerCase() === "apps" || t.toLowerCase() === "app")
  );
  const others = projects.filter((p) => !apps.includes(p));

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Projects</h1>

      {projects.length === 0 ? (
        <div style={{ marginTop: 64, textAlign: "center", opacity: 0.6 }}>
          <p style={{ fontSize: 18 }}>No projects yet</p>
        </div>
      ) : (
      <>
        {apps.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Apps</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {apps.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section style={{ marginTop: apps.length ? 48 : 32 }}>
            {apps.length > 0 && <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>More Projects</h2>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {others.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </section>
        )}
      </>
      )}
    </main>
  );
}

function ProjectCard({ project: p }: { project: ContentIndexItem }) {
  return (
    <Link
      href={`/projects/${p.slug}`}
      className="block rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{
        textDecoration: "none",
        color: "inherit",
        border: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <div style={{ width: "100%", height: 160, overflow: "hidden", backgroundColor: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {p.coverImage ? (
          <Image
            src={p.coverImage}
            alt={p.title}
            width={280}
            height={160}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ fontSize: 12, opacity: 0.4, textAlign: "center" }}>No image</div>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>{p.title}</h2>
        {p.description ? (
          <div style={{ opacity: 0.7, marginBottom: 8, fontSize: 14, lineHeight: 1.5 }}>{p.description}</div>
        ) : null}
        {p.date ? (
          <div style={{ opacity: 0.6, fontSize: 13 }}>{p.date}</div>
        ) : null}
      </div>
    </Link>
  );
}
