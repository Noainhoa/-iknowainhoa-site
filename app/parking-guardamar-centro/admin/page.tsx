import type { Metadata } from "next";
import ParkingAdminApp from "@/components/parking/ParkingAdminApp";

const ADMIN_ICON = "/parking-guardamar-centro/admin/icon.png";
const ADMIN_APPLE_ICON = "/parking-guardamar-centro/admin/apple-icon.png";

export const metadata: Metadata = {
  title: "Admin — Parking Guardamar Centro",
  icons: {
    icon: [
      { url: ADMIN_ICON, type: "image/png", sizes: "512x512" },
      { url: ADMIN_ICON, type: "image/png" },
    ],
    apple: [{ url: ADMIN_APPLE_ICON, type: "image/png", sizes: "180x180" }],
    shortcut: ADMIN_ICON,
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
