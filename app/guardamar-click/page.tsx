import type { Metadata } from "next";
import { Suspense } from "react";
import { Figtree, Fraunces } from "next/font/google";
import TechPublicApp from "@/components/tech/TechPublicApp";
import { getTechCopy } from "@/lib/tech/i18n";
import { getTechLocale } from "@/lib/tech/locale";
import { techCanonicalUrl } from "@/lib/tech/seo";
import "./tech.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-tme-serif",
  display: "swap",
  axes: ["opsz"],
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-tme-sans",
  display: "swap",
});

type PageProps = {
  searchParams: Promise<{ lang?: string | string[]; src?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getTechLocale(params.lang);
  const copy = getTechCopy(locale);
  const canonical = techCanonicalUrl(locale);
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: {
      canonical,
      languages: {
        es: techCanonicalUrl("es"),
        en: techCanonicalUrl("en"),
        nl: techCanonicalUrl("nl"),
        "x-default": techCanonicalUrl("es"),
      },
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: canonical,
      locale: locale === "es" ? "es_ES" : locale === "nl" ? "nl_NL" : "en_GB",
    },
  };
}

export default async function TechMadeEasyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getTechLocale(params.lang);
  const copy = getTechCopy(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: copy.brandName,
    description: copy.metaDescription,
    areaServed: "Guardamar del Segura",
    availableLanguage: ["Spanish", "English"],
    offers: {
      "@type": "Offer",
      price: "10",
      priceCurrency: "EUR",
    },
    url: techCanonicalUrl(locale),
  };

  return (
    <div className={`${fraunces.variable} ${figtree.variable}`} lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<main className="tme"><div className="tme-wrap" style={{ padding: "2rem 24px" }}>…</div></main>}>
        <TechPublicApp locale={locale} copy={copy} />
      </Suspense>
    </div>
  );
}
