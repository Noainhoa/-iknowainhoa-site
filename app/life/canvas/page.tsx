import type { Metadata } from "next";
import Link from "next/link";
import LifeCanvasPrototype from "@/components/life/timeline/LifeCanvasPrototype";

export const metadata: Metadata = {
  title: "Life · Canvas",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LifeCanvasPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-2 text-sm text-stone-600 sm:px-6">
        <Link href="/life" className="hover:text-stone-900">
          ← Life
        </Link>
        <p className="text-xs text-stone-500">Verified demo marks · no invent</p>
        <Link href="/life/manage" className="hover:text-stone-900">
          Manage →
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <LifeCanvasPrototype />
      </div>
    </main>
  );
}
