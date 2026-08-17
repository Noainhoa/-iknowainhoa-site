import type { Metadata } from "next";
import AniccaLanding from "@/components/anicca/AniccaLanding";
import { ANICCA_CANONICAL, ANICCA_IMAGES, ANICCA_ORIGIN } from "@/lib/anicca/config";
import { getAniccaCopy } from "@/lib/anicca/copy";
import { buildAniccaJsonLd } from "@/lib/anicca/jsonLd";
import { getLocale } from "@/lib/i18n";
import "./anicca.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const copy = getAniccaCopy(locale);

  return {
    title: { absolute: copy.meta.title },
    description: copy.meta.description,
    alternates: {
      canonical: ANICCA_CANONICAL,
    },
    openGraph: {
      type: "website",
      url: ANICCA_CANONICAL,
      title: copy.meta.title,
      description: copy.meta.description,
      siteName: "iknowainhoa",
      locale: locale === "es" ? "es_ES" : "en_GB",
      images: [
        {
          url: `${ANICCA_ORIGIN}${ANICCA_IMAGES.og}`,
          width: 1024,
          height: 1024,
          alt: copy.a11y.heroFrontAlt("Anicca · Impermanence"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.meta.title,
      description: copy.meta.description,
      images: [`${ANICCA_ORIGIN}${ANICCA_IMAGES.og}`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AniccaPage() {
  const locale = await getLocale();
  const jsonLd = buildAniccaJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AniccaLanding locale={locale} />
    </>
  );
}
