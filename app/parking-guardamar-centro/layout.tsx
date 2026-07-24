import type { Metadata } from "next";
import type { ReactNode } from "react";

const PARKING_ICON = "/images/parking/guardamar-parking-logo.png";

export const metadata: Metadata = {
  // Replaces root icons for this segment and /admin (child).
  // File-based icon.png / apple-icon.png remain as App Router backups.
  icons: {
    icon: [
      { url: PARKING_ICON, type: "image/png", sizes: "512x512" },
      { url: PARKING_ICON, type: "image/png" },
    ],
    apple: [{ url: PARKING_ICON, type: "image/png", sizes: "180x180" }],
    shortcut: PARKING_ICON,
  },
};

export default function ParkingLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="es" className="parking-root">
      {children}
    </div>
  );
}
