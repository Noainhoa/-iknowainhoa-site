import type { LifeEntry } from "@/lib/life/types";

export type LifeEntryStatus = "skeleton" | "complete";

export const LIFE_ENTRY_STATUS_LABELS: Record<LifeEntryStatus, string> = {
  skeleton: "Skeleton — details to complete",
  complete: "Complete",
};

export function isSkeletonEntry(entry: Pick<LifeEntry, "entryStatus">): boolean {
  return entry.entryStatus === "skeleton";
}

export function normalizeEntryTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function entryDuplicateKey(input: {
  trackId: string;
  title: string;
  startDate: string;
  startPrecision: string;
}): string {
  return [
    input.trackId,
    normalizeEntryTitle(input.title),
    input.startDate,
    input.startPrecision,
  ].join("\0");
}
