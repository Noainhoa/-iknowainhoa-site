/** Inclusive ISO date helpers kept local to avoid circular imports with types.ts */

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function eachDateInclusive(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  let cur = parseISODate(startIso);
  const end = parseISODate(endIso);
  while (cur <= end) {
    out.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

export type ParkingSeason = "summer" | "september" | "winter";

/** Month index 0–11 → tariff season from the public price list. */
export function seasonForMonth(monthIndex: number): ParkingSeason {
  if (monthIndex >= 5 && monthIndex <= 7) return "summer"; // Jun–Aug
  if (monthIndex === 8) return "september";
  return "winter"; // Oct–May
}

/** Estimate euros for a contiguous run of days in one season. */
export function estimateSeasonDays(season: ParkingSeason, days: number): number {
  if (days <= 0) return 0;

  if (season === "summer") {
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    return weeks * 70 + rem * 10;
  }

  if (season === "september") {
    return Math.ceil(days / 7) * 50;
  }

  // Oct–May: months €75 (no fortnight rate)
  return Math.ceil(days / 30) * 75;
}

/**
 * Tariff-based estimate for an inclusive arrival→departure stay.
 * Cross-season stays are split by season and summed.
 */
export function estimateParkingPrice(arrival: string, departure: string): number {
  if (!arrival || !departure || departure < arrival) return 0;
  const dates = eachDateInclusive(arrival, departure);
  let total = 0;
  let i = 0;
  while (i < dates.length) {
    const season = seasonForMonth(parseISODate(dates[i]).getMonth());
    let j = i + 1;
    while (
      j < dates.length &&
      seasonForMonth(parseISODate(dates[j]).getMonth()) === season
    ) {
      j++;
    }
    total += estimateSeasonDays(season, j - i);
    i = j;
  }
  return total;
}

export function formatEuroEstimate(amount: number): string {
  return `€${amount}`;
}
