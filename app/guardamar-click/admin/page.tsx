import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import TechAdminApp from "@/components/tech/TechAdminApp";
import { TECH_BRAND } from "@/lib/tech/constants";
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

export const metadata: Metadata = {
  title: { absolute: `Admin · ${TECH_BRAND}` },
  robots: { index: false, follow: false, nocache: true },
};

export default function TechAdminPage() {
  return (
    <main className={`tme ${fraunces.variable} ${figtree.variable}`} lang="es">
      <TechAdminApp />
    </main>
  );
}
