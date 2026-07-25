import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getParkingLocale } from "@/lib/parking/locale";

const PARKING_ICON = "/parking-guardamar-centro/icon.png";
const PARKING_APPLE_ICON = "/parking-guardamar-centro/apple-icon.png";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: PARKING_ICON, type: "image/png", sizes: "512x512" },
      { url: PARKING_ICON, type: "image/png" },
    ],
    apple: [{ url: PARKING_APPLE_ICON, type: "image/png", sizes: "180x180" }],
    shortcut: PARKING_ICON,
  },
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
