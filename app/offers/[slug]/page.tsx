import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import BlankPage from "@/components/BlankPage";
import { getOffer, getAllOffersSlugs } from "@/lib/content";
import { publicPages } from "@/lib/site";

const statusLabels: Record<string, string> = {
  available: "Available",
  beta: "Beta",
  "sold-out": "Sold Out",
  idea: "Coming Soon",
};

export async function generateStaticParams() {
  const slugs = await getAllOffersSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const offer = await getOffer(slug);

  if (!offer) {
    return { title: "Not Found" };
  }

  return {
    title: offer.title,
    description: offer.description,
    openGraph: offer.coverImage ? { images: [offer.coverImage] } : undefined,
  };
}

export default function OfferPage({ params }: { params: { slug: string } }) {
  if (!publicPages.offers) return <BlankPage />;

  if (params.slug === "rings") {
    // Use the custom static page for /offers/rings
    const RingsPage = require("../rings/page").default;
    return <RingsPage />;
  }
  // ...existing code for other offers (optional: could show 404 or fallback)
  return notFound();
}
