import { notFound } from "next/navigation";
import Image from "next/image";
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
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
      {project.coverImage && (
        <div style={{ marginBottom: 24, overflow: "hidden", borderRadius: 8 }}>
          <Image
            src={project.coverImage}
            alt={project.title || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
      {project.date ? (
        <div style={{ opacity: 0.6, marginBottom: 16, fontSize: 14 }}>{project.date}</div>
      ) : null}
      <div
        style={{ marginTop: 24, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: project.html }}
      />
    </main>
  );
}
