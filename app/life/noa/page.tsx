import type { Metadata } from "next";
import LifeNoaShell from "@/components/life/noa/LifeNoaShell";

export const metadata: Metadata = {
  title: "Life · NOA",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LifeNoaPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <LifeNoaShell />
    </main>
  );
}
