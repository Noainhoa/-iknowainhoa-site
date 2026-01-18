import { notFound } from "next/navigation";
import { getLanding, getAllLandingSlugs } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllLandingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function LandingPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const landing = await getLanding(slug);
  if (!landing) return notFound();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800 }}>
      <div
        style={{ marginTop: 24, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: landing.html }}
      />
    </main>
  );
}
