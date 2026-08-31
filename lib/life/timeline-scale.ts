import type { LifeDatePrecision, LifeEntry } from "@/lib/life/types";
import type { TimelineScale } from "@/lib/life/timeline-types";

const MS_DAY = 86_400_000;

export function parseLifeStoredDate(stored: string): Date {
  const [year, month = 1, day = 1] = stored.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfTodayMs(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function endOfTodayMs(): number {
  return startOfTodayMs() + MS_DAY - 1;
}

/** Start of the precision window (inclusive). */
export function precisionStartMs(precision: LifeDatePrecision, stored: string): number {
  return parseLifeStoredDate(stored).getTime();
}

/** End of the precision window (inclusive). */
export function precisionEndMs(precision: LifeDatePrecision, stored: string): number {
  const start = parseLifeStoredDate(stored);
  if (precision === "year") {
    return new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
  }
  if (precision === "month") {
    return new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  }
  return start.getTime() + MS_DAY - 1;
}

/** Bounds used for domain extent and bar geometry. */
export function entryDomainBounds(entry: LifeEntry): { startMs: number; endMs: number } {
  const startMs = precisionStartMs(entry.startPrecision, entry.startDate);

  if (entry.entryType === "event") {
    const endMs = precisionEndMs(entry.startPrecision, entry.startDate);
    return { startMs, endMs: Math.max(endMs, startMs) };
  }

  let endMs: number;
  if (entry.isOngoing) {
    endMs = endOfTodayMs();
  } else if (entry.endDate && entry.endPrecision) {
    endMs = precisionEndMs(entry.endPrecision, entry.endDate);
  } else {
    endMs = precisionEndMs(entry.startPrecision, entry.startDate);
  }

  return { startMs, endMs: Math.max(endMs, startMs) };
}

export function msToPx(ms: number, scale: TimelineScale): number {
  const ratio = (ms - scale.startMs) / (scale.endMs - scale.startMs);
  return ratio * scale.widthPx;
}

export type EventMarkerLayout = {
  leftPx: number;
  widthPx: number;
  centerPx: number;
};

/** Layout for event markers — width reflects month/year uncertainty when applicable. */
export function eventMarkerLayout(entry: LifeEntry, scale: TimelineScale): EventMarkerLayout {
  const { startMs, endMs } = entryDomainBounds(entry);
  const leftPx = msToPx(startMs, scale);
  const rightPx = msToPx(endMs, scale);

  if (entry.startPrecision === "exact") {
    const centerPx = msToPx(startMs + MS_DAY / 2, scale);
    return { leftPx: centerPx, widthPx: 0, centerPx };
  }

  if (entry.startPrecision === "approximate") {
    const centerPx = msToPx(startMs + MS_DAY / 2, scale);
    return { leftPx: centerPx, widthPx: 0, centerPx };
  }

  const widthPx = Math.max(
    entry.startPrecision === "year" ? 12 : 8,
    rightPx - leftPx
  );
  const centerPx = leftPx + widthPx / 2;
  return { leftPx, widthPx, centerPx };
}

export type PeriodBarLayout = {
  leftPx: number;
  widthPx: number;
};

export function periodBarLayout(entry: LifeEntry, scale: TimelineScale): PeriodBarLayout {
  const { startMs, endMs } = entryDomainBounds(entry);
  const leftPx = msToPx(startMs, scale);
  const rightPx = msToPx(endMs, scale);
  return {
    leftPx,
    widthPx: Math.max(4, rightPx - leftPx),
  };
}
