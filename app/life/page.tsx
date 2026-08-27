import type { Metadata } from "next";
import LifeShell from "@/components/life/LifeShell";

export const metadata: Metadata = {
  title: "Life",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LifePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <LifeShell />
    </main>
  );
}
