import { notFound } from "next/navigation";
import { getOffer, getAllOfferSlugs } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllOfferSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function OfferPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offer = await getOffer(slug);
  if (!offer) return notFound();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800 }}>
      {offer.date ? (
        <div style={{ opacity: 0.6, marginTop: 8 }}>{offer.date}</div>
      ) : null}
      <div
        style={{ marginTop: 24, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: offer.html }}
      />
    </main>
  );
}
