import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import BlankPage from "@/components/BlankPage";
import { getApp, getAllAppsSlugs } from "@/lib/content";
import { publicPages } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllAppsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getApp(slug);

  if (!app) {
    return { title: "Not Found" };
  }

  return {
    title: app.title,
    description: app.description,
    openGraph: app.coverImage ? { images: [app.coverImage] } : undefined,
  };
}

export default async function AppPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  if (!publicPages.apps) return <BlankPage />;

  const { slug } = await params;
  const app = await getApp(slug);
  if (!app) return notFound();

  return (
    <main className="mx-auto max-w-[800px] px-8 py-8 font-sans">
      {app.coverImage && (
        <div style={{ marginBottom: 24, overflow: "hidden", borderRadius: 8 }}>
          <Image
            src={app.coverImage}
            alt={app.title || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
      {app.date ? <div className="mb-4 text-sm opacity-60">{app.date}</div> : null}

      <h1 className="text-3xl font-semibold mb-3">{app.title}</h1>

      <div
        className="project-content prose prose-neutral dark:prose-invert mt-6 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: app.html }}
      />
    </main>
  );
}
