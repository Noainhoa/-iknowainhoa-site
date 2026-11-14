import type { Metadata } from "next";
import ParkingFaqAbout from "@/components/parking/ParkingFaqAbout";
import ParkingGallery from "@/components/parking/ParkingGallery";
import ParkingPublicApp from "@/components/parking/ParkingPublicApp";
import { getParkingCopy } from "@/lib/parking/i18n";
import { buildParkingJsonLd } from "@/lib/parking/jsonLd";
import { getParkingLocale } from "@/lib/parking/locale";
import {
  PARKING_ORIGIN,
  parkingCanonicalUrl,
  parkingHreflangMap,
} from "@/lib/parking/seo";

const OG_IMAGE = `${PARKING_ORIGIN}/images/parking/plaza-1.jpg`;

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getParkingLocale(params.lang);
  const t = getParkingCopy(locale);
  const canonical = parkingCanonicalUrl(locale);

  const keywords =
    locale === "es"
      ? [
          "parking Guardamar",
          "parking Guardamar centro",
          "parking Guardamar del Segura",
          "parking privado Guardamar",
          "aparcamiento Guardamar",
          "alquiler parking Guardamar",
          "plaza de garaje Guardamar",
          "parking por días Guardamar",
        ]
      : locale === "fr"
        ? [
            "parking Guardamar",
            "parking privé Guardamar",
            "stationnement Guardamar",
            "parking centre Guardamar del Segura",
            "location parking Guardamar",
          ]
        : [
            "parking Guardamar",
            "parking in Guardamar",
            "private parking Guardamar",
            "Guardamar town centre parking",
            "parking space Guardamar del Segura",
          ];

  const ogLocale =
    locale === "es" ? "es_ES" : locale === "fr" ? "fr_FR" : "en_GB";
  const ogAlternate =
    locale === "es"
      ? ["en_GB", "fr_FR"]
      : locale === "fr"
        ? ["es_ES", "en_GB"]
        : ["es_ES", "fr_FR"];

  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    keywords,
    alternates: {
      canonical,
      languages: parkingHreflangMap(),
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: canonical,
      locale: ogLocale,
      alternateLocale: ogAlternate,
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 900,
          height: 509,
          alt: t.photoAlts[0],
        },
        {
          url: `${PARKING_ORIGIN}/images/parking/plaza-2.jpg`,
          width: 659,
          height: 900,
          alt: t.photoAlts[1],
        },
        {
          url: `${PARKING_ORIGIN}/images/parking/plaza-3.jpg`,
          width: 900,
          height: 673,
          alt: t.photoAlts[2],
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.metaTitle,
      description: t.metaDescription,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ParkingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getParkingLocale(params.lang);
  const t = getParkingCopy(locale);
  const jsonLd = buildParkingJsonLd(locale);

  return (
    <main style={{ margin: 0, minHeight: "100vh", background: "#fafaf8" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ParkingPublicApp
        locale={locale}
        gallery={
          <ParkingGallery
            galleryLabel={t.galleryLabel}
            spaceFact={t.spaceFact}
            photoAlts={t.photoAlts}
          />
        }
        faq={
          <ParkingFaqAbout
            faqTitle={t.faqTitle}
            faqItems={t.faqItems}
            aboutTitle={t.aboutTitle}
            intro={t.intro}
            aboutItems={t.aboutItems}
          />
        }
      />
    </main>
  );
}
