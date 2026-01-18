import { notFound } from "next/navigation";
import { getProject, getAllProjectSlugs } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return notFound();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800 }}>
      {project.date ? (
        <div style={{ opacity: 0.6, marginTop: 8 }}>{project.date}</div>
      ) : null}
      <div
        style={{ marginTop: 24, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: project.html }}
      />
    </main>
  );
}
