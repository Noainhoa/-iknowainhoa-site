import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/images/parking/guardamar-parking-logo.png", type: "image/png" }],
    apple: [{ url: "/images/parking/guardamar-parking-logo.png", type: "image/png" }],
  },
};

export default function ParkingLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="es" className="parking-root">
      {children}
    </div>
  );
}
