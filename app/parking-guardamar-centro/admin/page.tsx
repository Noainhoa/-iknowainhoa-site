import type { Metadata } from "next";
import ParkingAdminApp from "@/components/parking/ParkingAdminApp";

export const metadata: Metadata = {
  title: "Admin — Parking Guardamar Centro",
  icons: {
    icon: [
      { url: "/images/parking/guardamar-parking-logo.png", type: "image/png", sizes: "512x512" },
      { url: "/images/parking/guardamar-parking-logo.png", type: "image/png" },
    ],
    apple: [
      {
        url: "/images/parking/guardamar-parking-logo.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    shortcut: "/images/parking/guardamar-parking-logo.png",
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
