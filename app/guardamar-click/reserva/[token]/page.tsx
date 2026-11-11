import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import TechConfirmation from "@/components/tech/TechConfirmation";
import { TECH_BRAND } from "@/lib/tech/constants";
import { getTechCopy } from "@/lib/tech/i18n";
import { getTechLocale } from "@/lib/tech/locale";
import "@/app/guardamar-click/tech.css";

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
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const locale = await getTechLocale(query.lang);
  const copy = getTechCopy(locale);
  return {
    title: { absolute: `${copy.cancelTitle} · ${TECH_BRAND}` },
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function TechReservationPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const query = await searchParams;
  return (
    <div className={`${fraunces.variable} ${figtree.variable}`}>
      <TechConfirmation token={token} locale={await getTechLocale(query.lang)} />
    </div>
  );
}
