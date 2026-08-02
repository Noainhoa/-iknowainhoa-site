import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlankPage from "@/components/BlankPage";
import { getProject, getAllProjectSlugs } from "@/lib/content";
import { externalAnchorProps } from "@/lib/links";
import CopyButton from "../components/copy-button";
import { publicPages } from "@/lib/site";

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
  if (!publicPages.projects) return <BlankPage />;

  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return notFound();

  const isWebsite = (project.tags || []).some((t) => t.toLowerCase() === "website");
  const websiteHref = isWebsite && project.cta?.link ? project.cta.link : null;

  return (
    <main className="mx-auto max-w-[800px] px-8 py-8 font-sans">
      {slug === "whatnow-app" ? (
        <>
          {project.date ? (
            <div className="mb-3 text-sm opacity-60">{project.date}</div>
          ) : null}

          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center mb-6">
            {project.coverImage && (
              <div className="shrink-0">
                <Image
                  src={project.coverImage}
                  alt={project.title || ""}
                  width={200}
                  height={200}
                  style={{ width: 200, height: 200, objectFit: "contain" }}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold mb-3">{project.title}</h1>
              {project.description ? (
                <p className="text-base leading-relaxed opacity-85 mb-3">
                  {project.description}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://watnow.netlify.app"
                  {...externalAnchorProps("https://watnow.netlify.app")}
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Open watnow.netlify.app
                </a>
                <CopyButton text="watnow.netlify.app" />
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {project.coverImage && (
            <div style={{ marginBottom: 24, overflow: "hidden", borderRadius: 8 }}>
              {websiteHref ? (
                <a
                  href={websiteHref}
                  {...externalAnchorProps(websiteHref)}
                  aria-label={`Visit ${project.title}`}
                  style={{ display: "block" }}
                >
                  <Image
                    src={project.coverImage}
                    alt={project.title || ""}
                    width={800}
                    height={400}
                    style={{ width: "100%", height: "auto" }}
                  />
                </a>
              ) : (
                <Image
                  src={project.coverImage}
                  alt={project.title || ""}
                  width={800}
                  height={400}
                  style={{ width: "100%", height: "auto" }}
                />
              )}
            </div>
          )}
          {project.date ? (
            <div className="mb-4 text-sm opacity-60">{project.date}</div>
          ) : null}
        </>
      )}

      {slug !== "whatnow-app" && (
        <h1 className="text-3xl font-semibold mb-3">{project.title}</h1>
      )}

      <div
        className="project-content prose prose-neutral dark:prose-invert mt-6 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: project.html }}
      />

      {isWebsite && (
        <section className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-base opacity-85">
            Need a website like this?{" "}
            <Link href="/contact" className="underline underline-offset-4">
              Contact me
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}
