import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import TechAdminApp from "@/components/tech/TechAdminApp";
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
  title: "Admin · Tech Made Easy",
  robots: { index: false, follow: false, nocache: true },
};

export default function TechAdminPage() {
  return (
    <main className={`tme ${fraunces.variable} ${figtree.variable}`} lang="es">
      <TechAdminApp />
    </main>
  );
}
