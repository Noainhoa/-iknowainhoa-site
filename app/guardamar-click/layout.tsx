import type { Metadata } from "next";
import type { ReactNode } from "react";

const ICON_192 = "/tech-icons/v2/icon-192.png";
const ICON_512 = "/tech-icons/v2/icon-512.png";
const APPLE_TOUCH = "/tech-icons/v2/apple-touch-icon.png";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: ICON_192, type: "image/png", sizes: "192x192" },
      { url: ICON_512, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: APPLE_TOUCH, type: "image/png", sizes: "180x180" }],
    shortcut: ICON_192,
  },
  manifest: "/tech-icons/v2/site.webmanifest",
};

export default function TechLayout({ children }: { children: ReactNode }) {
  return children;
}
