import type { ReactNode } from "react";

type LifeDetailPanelProps = {
  children: ReactNode;
};

export default function LifeDetailPanel({ children }: LifeDetailPanelProps) {
  return (
    <section
      aria-label="Entry detail"
      className="min-h-[16rem] rounded-lg border border-gray-200 bg-white p-4 sm:p-5"
    >
      {children}
    </section>
  );
}

export function LifeDetailEmpty() {
  return (
    <div className="flex h-full min-h-[12rem] items-center justify-center px-4 text-center">
      <p className="text-sm text-gray-500">Select an entry or add one</p>
    </div>
  );
}
