import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getParkingLocale } from "@/lib/parking/locale";
import "./parking.css";

const ICON_192 = "/parking-icons/v2/icon-192.png";
const ICON_512 = "/parking-icons/v2/icon-512.png";
const APPLE_TOUCH = "/parking-icons/v2/apple-touch-icon.png";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: ICON_192, type: "image/png", sizes: "192x192" },
      { url: ICON_512, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: APPLE_TOUCH, type: "image/png", sizes: "180x180" }],
    shortcut: ICON_192,
  },
  manifest: "/parking-icons/v2/site.webmanifest",
};

export default async function ParkingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getParkingLocale();
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/parking/plaza-1.jpg"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/parking/guardamar-parking-badge-128.png"
        fetchPriority="high"
      />
      <div lang={locale} className="parking-root">
        {children}
      </div>
    </>
  );
}
