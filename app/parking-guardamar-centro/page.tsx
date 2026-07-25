import type { Metadata } from "next";
import ParkingPublicApp from "@/components/parking/ParkingPublicApp";
import { getParkingCopy } from "@/lib/parking/i18n";
import { getParkingLocale } from "@/lib/parking/locale";

const PATH = "https://iknowainhoa.com/parking-guardamar-centro";
const OG_IMAGE = "https://iknowainhoa.com/images/parking/plaza-1.jpg";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getParkingLocale(params.lang);
  const t = getParkingCopy(locale);
  const es = locale === "es";

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    keywords: es
      ? [
          "parking Guardamar agosto",
          "plaza garaje Guardamar del Segura",
          "parking centro Guardamar",
          "alquiler parking Guardamar",
          "garaje Jorge Juan Guardamar",
          "parking verano Guardamar",
        ]
      : [
          "August parking Guardamar",
          "private garage Guardamar del Segura",
          "central Guardamar parking",
          "rent parking Guardamar",
          "Jorge Juan garage Guardamar",
          "summer parking Guardamar",
        ],
    alternates: {
      canonical: `${PATH}${es ? "?lang=es" : "?lang=en"}`,
      languages: {
        es: `${PATH}?lang=es`,
        en: `${PATH}?lang=en`,
        "x-default": `${PATH}?lang=es`,
      },
    },
    icons: {
      icon: [
        {
          url: "/parking-icons/v2/icon-192.png",
          type: "image/png",
          sizes: "192x192",
        },
        {
          url: "/parking-icons/v2/icon-512.png",
          type: "image/png",
          sizes: "512x512",
        },
      ],
      apple: [
        {
          url: "/parking-icons/v2/apple-touch-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
      shortcut: "/parking-icons/v2/icon-192.png",
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `${PATH}?lang=${locale}`,
      locale: es ? "es_ES" : "en_GB",
      alternateLocale: es ? ["en_GB"] : ["es_ES"],
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 1400,
          height: 793,
          alt: t.photoAlts[0],
        },
        {
          url: "https://iknowainhoa.com/images/parking/plaza-2.jpg",
          width: 1025,
          height: 1400,
          alt: t.photoAlts[1],
        },
        {
          url: "https://iknowainhoa.com/images/parking/plaza-3.jpg",
          width: 1400,
          height: 1047,
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

function parkingJsonLd(locale: "es" | "en") {
  const t = getParkingCopy(locale);
  const es = locale === "es";

  return {
    "@context": "https://schema.org",
    "@type": "ParkingFacility",
    "@id": `${PATH}#facility`,
    name: t.brand,
    description: t.metaDescription,
    url: `${PATH}?lang=${locale}`,
    image: [
      "https://iknowainhoa.com/images/parking/plaza-1.jpg",
      "https://iknowainhoa.com/images/parking/plaza-2.jpg",
      "https://iknowainhoa.com/images/parking/plaza-3.jpg",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carrer de Jorge Juan, 13",
      addressLocality: "Guardamar del Segura",
      addressRegion: "Alicante",
      postalCode: "03140",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.0901,
      longitude: -0.6551,
    },
    publicAccess: false,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: es ? "Ancho" : "Width",
        value: "240 cm",
      },
      {
        "@type": "PropertyValue",
        name: es ? "Largo" : "Length",
        value: "490 cm",
      },
      {
        "@type": "PropertyValue",
        name: es ? "Tipo" : "Type",
        value: es ? "Plaza privada en garaje cubierto" : "Private covered garage bay",
      },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: `${PATH}?lang=${locale}#pk-form-heading`,
      name: es ? "Solicitar por WhatsApp" : "Enquire through WhatsApp",
    },
  };
}

export default async function ParkingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getParkingLocale(params.lang);
  const jsonLd = parkingJsonLd(locale);

  return (
    <main style={{ margin: 0, minHeight: "100vh", background: "#fafaf8" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ParkingPublicApp locale={locale} />
    </main>
  );
}
