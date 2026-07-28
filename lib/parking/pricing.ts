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

export type SeasonRates = {
  day: number | null;
  week: number | null;
  month: number | null;
};

export type ParkingRatesMap = Record<ParkingSeason, SeasonRates>;

/** Fallback / seed rates when Supabase is unset or fetch fails (EUR). Null = not offered. */
export const DEFAULT_PARKING_RATES: ParkingRatesMap = {
  summer: { day: 10, week: 70, month: null },
  september: { day: null, week: 50, month: null },
  winter: { day: null, week: null, month: 75 },
};

/** @deprecated Prefer DEFAULT_PARKING_RATES; kept as alias for existing imports. */
export const SEASON_RATES = DEFAULT_PARKING_RATES;

export const PRICE_DASH = "—";

export const PARKING_SEASON_ORDER: ParkingSeason[] = [
  "summer",
  "september",
  "winter",
];

export function formatRateCell(amount: number | null): string {
  return amount == null ? PRICE_DASH : `€${amount}`;
}

export type ParkingPriceRow = {
  period: string;
  day: string;
  week: string;
  month: string;
};

/** Visible price table rows from rates + locale period labels. */
export function localizedPriceRows(
  periodLabels: [string, string, string],
  rates: ParkingRatesMap = DEFAULT_PARKING_RATES
): ParkingPriceRow[] {
  return PARKING_SEASON_ORDER.map((season, i) => {
    const r = rates[season];
    return {
      period: periodLabels[i],
      day: formatRateCell(r.day),
      week: formatRateCell(r.week),
      month: formatRateCell(r.month),
    };
  });
}

/** Month index 0–11 → tariff season from the public price list. */
export function seasonForMonth(monthIndex: number): ParkingSeason {
  if (monthIndex >= 5 && monthIndex <= 7) return "summer"; // Jun–Aug
  if (monthIndex === 8) return "september";
  return "winter"; // Oct–May
}

/** Estimate euros for a contiguous run of days in one season. */
export function estimateSeasonDays(
  season: ParkingSeason,
  days: number,
  rates: ParkingRatesMap = DEFAULT_PARKING_RATES
): number {
  if (days <= 0) return 0;
  const r = rates[season];

  if (season === "summer") {
    const week = r.week ?? 0;
    const day = r.day ?? 0;
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    return weeks * week + rem * day;
  }

  if (season === "september") {
    const week = r.week ?? 0;
    return Math.ceil(days / 7) * week;
  }

  const month = r.month ?? 0;
  return Math.ceil(days / 30) * month;
}

/**
 * Tariff-based estimate for an inclusive arrival→departure stay.
 * Cross-season stays are split by season and summed.
 */
export function estimateParkingPrice(
  arrival: string,
  departure: string,
  rates: ParkingRatesMap = DEFAULT_PARKING_RATES
): number {
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
    total += estimateSeasonDays(season, j - i, rates);
    i = j;
  }
  return total;
}

export function formatEuroEstimate(amount: number): string {
  return `€${amount}`;
}

export type ParkingOfferSpec = {
  season: ParkingSeason;
  unit: "day" | "week" | "month";
  price: number;
  name: { es: string; en: string; fr: string };
};

/** Seasonal offers for JSON-LD (only units that have a published rate). */
export function parkingOfferSpecs(
  rates: ParkingRatesMap = DEFAULT_PARKING_RATES
): ParkingOfferSpec[] {
  const specs: ParkingOfferSpec[] = [];
  if (rates.summer.day != null) {
    specs.push({
      season: "summer",
      unit: "day",
      price: rates.summer.day,
      name: {
        es: "Tarifa diaria junio–agosto",
        en: "Daily rate June–August",
        fr: "Tarif journalier juin–août",
      },
    });
  }
  if (rates.summer.week != null) {
    specs.push({
      season: "summer",
      unit: "week",
      price: rates.summer.week,
      name: {
        es: "Tarifa semanal junio–agosto",
        en: "Weekly rate June–August",
        fr: "Tarif hebdomadaire juin–août",
      },
    });
  }
  if (rates.september.week != null) {
    specs.push({
      season: "september",
      unit: "week",
      price: rates.september.week,
      name: {
        es: "Tarifa semanal septiembre",
        en: "Weekly rate September",
        fr: "Tarif hebdomadaire septembre",
      },
    });
  }
  if (rates.winter.month != null) {
    specs.push({
      season: "winter",
      unit: "month",
      price: rates.winter.month,
      name: {
        es: "Tarifa mensual octubre–mayo",
        en: "Monthly rate October–May",
        fr: "Tarif mensuel octobre–mai",
      },
    });
  }
  return specs;
}

export type ParkingRateRow = {
  season: ParkingSeason;
  day_eur: number | null;
  week_eur: number | null;
  month_eur: number | null;
  label_es: string;
  label_en: string;
  label_fr: string;
  sort_order: number;
};

export function ratesMapFromRows(
  rows: ParkingRateRow[] | null | undefined
): ParkingRatesMap {
  const next: ParkingRatesMap = {
    summer: { ...DEFAULT_PARKING_RATES.summer },
    september: { ...DEFAULT_PARKING_RATES.september },
    winter: { ...DEFAULT_PARKING_RATES.winter },
  };
  if (!rows?.length) return next;
  for (const row of rows) {
    if (row.season !== "summer" && row.season !== "september" && row.season !== "winter") {
      continue;
    }
    next[row.season] = {
      day: row.day_eur,
      week: row.week_eur,
      month: row.month_eur,
    };
  }
  return next;
}

export function periodLabelsFromRows(
  rows: ParkingRateRow[] | null | undefined,
  locale: "es" | "en" | "fr",
  fallback: [string, string, string]
): [string, string, string] {
  if (!rows?.length) return fallback;
  const bySeason = new Map(rows.map((r) => [r.season, r]));
  return PARKING_SEASON_ORDER.map((season, i) => {
    const row = bySeason.get(season);
    if (!row) return fallback[i];
    if (locale === "es") return row.label_es;
    if (locale === "fr") return row.label_fr;
    return row.label_en;
  }) as [string, string, string];
}
