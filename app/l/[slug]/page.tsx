import { notFound } from "next/navigation";
import Image from "next/image";
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
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
      {landing.coverImage && (
        <div style={{ marginBottom: 32, overflow: "hidden", borderRadius: 8 }}>
          <Image
            src={landing.coverImage}
            alt={landing.title || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
      <div
        style={{ marginTop: 24, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: landing.html }}
      />
    </main>
  );
}
