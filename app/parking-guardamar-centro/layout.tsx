import type { Metadata } from "next";
import type { ReactNode } from "react";

// Next.js 16 serves app/.../icon.png as this path (not /icon without extension).
const PARKING_ICON = "/parking-guardamar-centro/icon.png";
const PARKING_APPLE_ICON = "/parking-guardamar-centro/apple-icon.png";

export const metadata: Metadata = {
  // Replaces root /favicon.ico (Vercel triangle) for this segment and /admin.
  icons: {
    icon: [
      { url: PARKING_ICON, type: "image/png", sizes: "512x512" },
      { url: PARKING_ICON, type: "image/png" },
    ],
    apple: [{ url: PARKING_APPLE_ICON, type: "image/png", sizes: "180x180" }],
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
