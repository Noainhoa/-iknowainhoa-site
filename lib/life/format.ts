import type { LifeDatePrecision, LifeEntry } from "@/lib/life/types";
import { LIFE_PRECISION_LABELS, lifeDateToFormValue } from "@/lib/life/dates";

export function formatLifeEntrySummary(entry: LifeEntry): string {
  const start = formatStoredDate(entry.startPrecision, entry.startDate);
  if (entry.entryType === "event") return start;

  if (entry.isOngoing) return `${start} → ongoing`;
  if (entry.endDate && entry.endPrecision) {
    const end = formatStoredDate(entry.endPrecision, entry.endDate);
    return `${start} → ${end}`;
  }
  return start;
}

function formatStoredDate(precision: LifeDatePrecision, stored: string): string {
  if (precision === "year") return stored.slice(0, 4);
  if (precision === "month") {
    const [year, month] = stored.split("-");
    return `${year}-${month}`;
  }
  if (precision === "approximate") return `~${stored}`;
  return stored;
}

export { lifeDateToFormValue, LIFE_PRECISION_LABELS };
