import Link from "next/link";
import { getAllProjects } from "@/lib/content";

export default async function ProjectsIndex() {
  const projects = await getAllProjects();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Projects</h1>

      <ul style={{ marginTop: 24 }}>
        {projects.map((p) => (
          <li key={p.slug} style={{ marginBottom: 16 }}>
            <Link href={`/projects/${p.slug}`} style={{ fontSize: 20 }}>
              {p.title}
            </Link>
            {p.description ? (
              <div style={{ opacity: 0.8, marginTop: 4 }}>{p.description}</div>
            ) : null}
            {p.date ? (
              <div style={{ opacity: 0.6, marginTop: 4 }}>{p.date}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
