import type { Metadata } from "next";
import { Suspense } from "react";
import LifeManageShell from "@/components/life/manage/LifeManageShell";

export const metadata: Metadata = {
  title: "Life · Manage",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LifeManagePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <LifeManageShell />
      </Suspense>
    </main>
  );
}
