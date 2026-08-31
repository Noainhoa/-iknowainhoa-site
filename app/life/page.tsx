import type { Metadata } from "next";
import LifeTimelineShell from "@/components/life/timeline/LifeTimelineShell";

export const metadata: Metadata = {
  title: "Life",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LifePage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-12">
      <LifeTimelineShell />
    </main>
  );
}
