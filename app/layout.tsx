import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, DM_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import SiteChrome from "@/components/SiteChrome";
import { getLocale } from "@/lib/i18n";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-site-sans",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-blog-brand",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-site-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: {
    canonical: site.url,
  },
  // Served from public/favicon.ico so nested routes can fully replace icons
  // via metadata (App Router always prepends app/favicon.ico otherwise).
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${dmSans.variable} ${bebasNeue.variable} ${sourceSerif.variable}`}>
      <body className="antialiased">
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </body>
    </html>
  );
}
