import type { Metadata } from "next";
import ParkingPublicApp from "@/components/parking/ParkingPublicApp";
import { getParkingCopy } from "@/lib/parking/i18n";
import { getParkingLocale } from "@/lib/parking/locale";

const PATH = "https://iknowainhoa.com/parking-guardamar-centro";

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
          url: "/parking-guardamar-centro/icon.png",
          type: "image/png",
          sizes: "512x512",
        },
        { url: "/parking-guardamar-centro/icon.png", type: "image/png" },
      ],
      apple: [
        {
          url: "/parking-guardamar-centro/apple-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
      shortcut: "/parking-guardamar-centro/icon.png",
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
          url: "/images/parking/guardamar-parking-logo.png",
          width: 512,
          height: 512,
          alt: t.heroAlt,
        },
      ],
    },
  };
}

export default async function ParkingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getParkingLocale(params.lang);
  return (
    <main style={{ margin: 0, minHeight: "100vh", background: "#fafaf8" }}>
      <ParkingPublicApp locale={locale} />
    </main>
  );
}
