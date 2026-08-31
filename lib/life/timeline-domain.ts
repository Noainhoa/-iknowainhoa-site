import type { LifeEntry } from "@/lib/life/types";
import { endOfTodayMs, entryDomainBounds, startOfTodayMs } from "@/lib/life/timeline-scale";
import type { TimelineScale, TimelineZoom } from "@/lib/life/timeline-types";

/** Configured birth / life timeline origin (calendar year). */
export const LIFE_START_YEAR = 1986;

const MS_DAY = 86_400_000;
const MS_YEAR = MS_DAY * 365.25;

/** Fixed pixels-per-day for zoomed views (same elapsed time → same distance). */
export const ZOOM_PX_PER_DAY: Record<Exclude<TimelineZoom, "life">, number> = {
  "20y": 0.45,
  "10y": 0.9,
  "5y": 1.8,
  "1y": 8,
};

export const TIMELINE_ZOOM_OPTIONS: Array<{ id: TimelineZoom; label: string }> = [
  { id: "life", label: "Fit life" },
  { id: "20y", label: "20Y" },
  { id: "10y", label: "10Y" },
  { id: "5y", label: "5Y" },
  { id: "1y", label: "1Y" },
];

export function lifeStartMs(): number {
  return new Date(LIFE_START_YEAR, 0, 1).getTime();
}

/** Canonical timeline end: today, extended slightly if future entries exist. */
export function lifeDomainEndMs(entries: LifeEntry[] = []): number {
  const todayEnd = endOfTodayMs();
  let endMs = todayEnd;

  for (const entry of entries) {
    const { endMs: entryEnd } = entryDomainBounds(entry);
    if (entryEnd > todayEnd) {
      endMs = Math.max(endMs, entryEnd);
    }
  }

  if (endMs > todayEnd) {
    endMs += 7 * MS_DAY;
  }

  return endMs;
}

export function todayMs(): number {
  return startOfTodayMs();
}

export function labelModeForZoom(zoom: TimelineZoom): TimelineScale["labelMode"] {
  if (zoom === "life") return "hidden";
  if (zoom === "20y" || zoom === "10y") return "short";
  return "full";
}

export function computeTimelineScale(
  zoom: TimelineZoom,
  viewportCanvasWidthPx: number,
  entries: LifeEntry[] = []
): TimelineScale {
  const startMs = lifeStartMs();
  const endMs = lifeDomainEndMs(entries);
  const spanMs = Math.max(endMs - startMs, MS_YEAR);
  const spanDays = spanMs / MS_DAY;

  let widthPx: number;
  let pxPerDay: number;

  if (zoom === "life") {
    widthPx = Math.max(480, Math.floor(viewportCanvasWidthPx));
    pxPerDay = widthPx / spanDays;
  } else {
    pxPerDay = ZOOM_PX_PER_DAY[zoom];
    widthPx = Math.max(480, Math.ceil(spanDays * pxPerDay));
  }

  return {
    startMs,
    endMs,
    widthPx,
    zoom,
    pxPerDay,
    labelMode: labelModeForZoom(zoom),
  };
}

export type AxisTick = {
  ms: number;
  label: string;
  major: boolean;
};

export function buildAxisTicks(scale: TimelineScale): AxisTick[] {
  const { startMs, endMs, widthPx, zoom } = scale;
  const ticks: AxisTick[] = [];
  const minLabelGapPx = zoom === "life" ? 48 : 36;

  function addTick(ms: number, label: string, major: boolean) {
    if (ms < startMs || ms > endMs) return;
    const last = ticks[ticks.length - 1];
    if (last) {
      const gap = ((ms - last.ms) / (endMs - startMs)) * widthPx;
      if (gap < minLabelGapPx) return;
    }
    ticks.push({ ms, label, major });
  }

  if (zoom === "life") {
    const yearStep = widthPx / ((endMs - startMs) / MS_YEAR) >= 6 ? 10 : 5;
    const startYear = new Date(startMs).getFullYear();
    const endYear = new Date(endMs).getFullYear();
    for (let year = startYear; year <= endYear; year += yearStep) {
      addTick(new Date(year, 0, 1).getTime(), String(year), true);
    }
    return ticks;
  }

  if (zoom === "20y") {
    const startYear = new Date(startMs).getFullYear();
    const endYear = new Date(endMs).getFullYear();
    for (let year = startYear; year <= endYear; year += 5) {
      addTick(new Date(year, 0, 1).getTime(), String(year), true);
    }
    return ticks;
  }

  if (zoom === "10y" || zoom === "5y") {
    const startYear = new Date(startMs).getFullYear();
    const endYear = new Date(endMs).getFullYear();
    for (let year = startYear; year <= endYear; year += 1) {
      addTick(new Date(year, 0, 1).getTime(), String(year), true);
    }

    if (zoom === "5y") {
      const start = new Date(startMs);
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor.getTime() <= endMs) {
        if (cursor.getMonth() % 3 === 0 && cursor.getMonth() !== 0) {
          const month = cursor.toLocaleString("en-GB", { month: "short" });
          addTick(cursor.getTime(), month, false);
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }
    return ticks;
  }

  // 1Y — month ticks
  const cursor = new Date(startMs);
  cursor.setDate(1);
  while (cursor.getTime() <= endMs) {
    const month = cursor.toLocaleString("en-GB", { month: "short" });
    const yearSuffix =
      cursor.getMonth() === 0 ? ` ${String(cursor.getFullYear()).slice(-2)}` : "";
    addTick(cursor.getTime(), `${month}${yearSuffix}`, true);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return ticks;
}

export function shouldShowEntryLabel(
  scale: TimelineScale,
  layoutWidthPx: number
): boolean {
  if (scale.labelMode === "hidden") return false;
  if (scale.labelMode === "full") return true;
  return layoutWidthPx >= 6 || scale.pxPerDay * 30 >= 24;
}

export function formatEntryLabel(title: string, mode: TimelineScale["labelMode"]): string {
  if (mode === "full") return title;
  if (title.length <= 28) return title;
  return `${title.slice(0, 25)}…`;
}

export function defaultScrollLeft(scale: TimelineScale, viewportWidthPx: number): number {
  if (scale.zoom === "life") return 0;
  const todayX = ((todayMs() - scale.startMs) / (scale.endMs - scale.startMs)) * scale.widthPx;
  return Math.max(0, todayX - viewportWidthPx * 0.85);
}
