import type { Metadata } from "next";
import LifeOsShell from "@/components/life/os/LifeOsShell";

export const metadata: Metadata = {
  title: "Life · OS",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LifeOsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <LifeOsShell />
    </main>
  );
}
