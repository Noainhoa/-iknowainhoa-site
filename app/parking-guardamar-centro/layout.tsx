import type { ReactNode } from "react";

export default function ParkingLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="es" className="parking-root">
      {children}
    </div>
  );
}
