import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { getParkingCopy } from "@/lib/parking/i18n";
import { getParkingLocale } from "@/lib/parking/locale";
import {
  getParkingPrivacyCopy,
  PARKING_PRIVACY_PATH,
} from "@/lib/parking/privacyContent";

const PARKING_PATH = "/parking-guardamar-centro";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getParkingLocale(params.lang);
  const p = getParkingPrivacyCopy(locale);
  const es = locale === "es";

  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: {
      canonical: `https://iknowainhoa.com${PARKING_PRIVACY_PATH}${es ? "?lang=es" : "?lang=en"}`,
      languages: {
        es: `https://iknowainhoa.com${PARKING_PRIVACY_PATH}?lang=es`,
        en: `https://iknowainhoa.com${PARKING_PRIVACY_PATH}?lang=en`,
        "x-default": `https://iknowainhoa.com${PARKING_PRIVACY_PATH}?lang=es`,
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function ParkingPrivacyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getParkingLocale(params.lang);
  const p = getParkingPrivacyCopy(locale);
  const t = getParkingCopy(locale);
  const parkingHref = `${PARKING_PATH}?lang=${locale}`;

  return (
    <main
      className="pk-privacy-page"
      lang={locale}
      style={{
        margin: 0,
        minHeight: "100vh",
        background: "#fafaf8",
        color: "#1a1a1a",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "16px 16px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <Suspense fallback={null}>
            <LanguageToggle locale={locale} label={t.languageLabel} />
          </Suspense>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: "0.9rem" }}>
          <Link
            href={parkingHref}
            style={{ color: "#005288", fontWeight: 600, textDecoration: "underline" }}
          >
            ← {p.backToParking}
          </Link>
        </p>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "1.65rem",
            fontWeight: 750,
            color: "#005288",
            letterSpacing: "-0.02em",
          }}
        >
          {p.title}
        </h1>
        <p style={{ margin: "0 0 16px", color: "#5a5a5a", fontSize: "0.9rem" }}>
          {p.updated}
        </p>
        <p style={{ margin: "0 0 28px", lineHeight: 1.55, fontSize: "1rem" }}>
          {p.intro}
        </p>

        {p.sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: 24 }}>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#005288",
              }}
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((para) => (
              <p
                key={para.slice(0, 48)}
                style={{
                  margin: "0 0 10px",
                  lineHeight: 1.55,
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                }}
              >
                {para}
              </p>
            ))}
          </section>
        ))}

        <p style={{ margin: "32px 0 0", fontSize: "0.9rem" }}>
          <Link
            href={parkingHref}
            style={{ color: "#005288", fontWeight: 600, textDecoration: "underline" }}
          >
            ← {p.backToParking}
          </Link>
        </p>
      </div>
    </main>
  );
}
