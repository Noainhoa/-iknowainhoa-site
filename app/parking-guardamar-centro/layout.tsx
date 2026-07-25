import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getParkingLocale } from "@/lib/parking/locale";

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
    <div lang={locale} className="parking-root">
      {children}
    </div>
  );
}
