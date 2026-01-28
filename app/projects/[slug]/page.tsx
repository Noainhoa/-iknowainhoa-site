import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getProject, getAllProjectSlugs } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Not Found" };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: project.coverImage
      ? { images: [project.coverImage] }
      : undefined,
  };
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
    <main className="mx-auto max-w-[800px] px-8 py-8 font-sans">
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
        <div className="mb-4 text-sm opacity-60">{project.date}</div>
      ) : null}
      <div
        className="project-content prose prose-neutral dark:prose-invert mt-6 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: project.html }}
      />
    </main>
  );
}
