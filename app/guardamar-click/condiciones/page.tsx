import type { Metadata } from "next";
import Link from "next/link";
import { Figtree, Fraunces } from "next/font/google";
import { getTechConditionsCopy } from "@/lib/tech/conditionsContent";
import { getTechLocale, type TechLocale } from "@/lib/tech/locale";
import {
  techConditionsCanonicalUrl,
  techConditionsHref,
  techConditionsHreflangMap,
  techPageHref,
} from "@/lib/tech/seo";
import "../tech.css";

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
  searchParams: Promise<{ lang?: string | string[] }>;
};

const LOCALES: TechLocale[] = ["es", "en", "nl"];

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getTechLocale(params.lang);
  const copy = getTechConditionsCopy(locale);

  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: {
      canonical: techConditionsCanonicalUrl(locale),
      languages: techConditionsHreflangMap(),
    },
    robots: { index: true, follow: true },
  };
}

export default async function TechConditionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getTechLocale(params.lang);
  const copy = getTechConditionsCopy(locale);
  const bookingHref = techPageHref(locale);

  return (
    <div className={`${fraunces.variable} ${figtree.variable}`} lang={locale}>
      <main className="tme tme-conditions-page">
        <div className="tme-wrap tme-conditions-inner">
          <nav className="tme-lang" aria-label={copy.langLabel}>
            {LOCALES.map((item, index) => (
              <span key={item}>
                {index > 0 ? (
                  <span className="tme-lang-sep" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <Link
                  href={techConditionsHref(item)}
                  {...(item === locale ? { "aria-current": "page" as const } : {})}
                >
                  {item.toUpperCase()}
                </Link>
              </span>
            ))}
          </nav>

          <p className="tme-conditions-back">
            <Link href={bookingHref}>← {copy.backToBooking}</Link>
          </p>

          <h1>{copy.title}</h1>
          <p className="tme-conditions-intro">{copy.intro}</p>

          {copy.sections.map((section) => (
            <section key={section.heading} className="tme-conditions-section">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((para) => (
                <p key={para.slice(0, 72)}>{para}</p>
              ))}
            </section>
          ))}

          <p className="tme-conditions-back">
            <Link href={bookingHref}>← {copy.backToBooking}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
