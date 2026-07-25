import type { Metadata } from "next";
import ParkingAdminApp from "@/components/parking/ParkingAdminApp";

const ICON_192 = "/parking-icons/v2/icon-192.png";
const ICON_512 = "/parking-icons/v2/icon-512.png";
const APPLE_TOUCH = "/parking-icons/v2/apple-touch-icon.png";

export const metadata: Metadata = {
  title: "Admin — Parking Guardamar Centro",
  icons: {
    icon: [
      { url: ICON_192, type: "image/png", sizes: "192x192" },
      { url: ICON_512, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: APPLE_TOUCH, type: "image/png", sizes: "180x180" }],
    shortcut: ICON_192,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ParkingAdminPage() {
  return (
    <main style={{ margin: 0, minHeight: "100vh", background: "#f4f4f2" }}>
      <ParkingAdminApp />
    </main>
  );
}
