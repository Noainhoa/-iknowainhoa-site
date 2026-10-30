import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import TechConfirmation from "@/components/tech/TechConfirmation";
import { getTechLocale } from "@/lib/tech/locale";
import "@/app/tech-made-easy/tech.css";

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

export const metadata: Metadata = {
  title: "Reserva · Tech Made Easy",
  robots: { index: false, follow: false, nocache: true },
};

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function TechReservationPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const query = await searchParams;
  return (
    <div className={`${fraunces.variable} ${figtree.variable}`}>
      <TechConfirmation token={token} locale={await getTechLocale(query.lang)} />
    </div>
  );
}
