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

/** Single source of truth for public rates (EUR). Null = not offered. */
export const SEASON_RATES: Record<ParkingSeason, SeasonRates> = {
  summer: { day: 10, week: 70, month: null },
  september: { day: null, week: 50, month: null },
  winter: { day: null, week: null, month: 75 },
};

export const PRICE_DASH = "—";

export function formatRateCell(amount: number | null): string {
  return amount == null ? PRICE_DASH : `€${amount}`;
}

export type ParkingPriceRow = {
  period: string;
  day: string;
  week: string;
  month: string;
};

/** Visible price table rows from shared rates + locale period labels. */
export function localizedPriceRows(
  periodLabels: [string, string, string]
): ParkingPriceRow[] {
  const seasons: ParkingSeason[] = ["summer", "september", "winter"];
  return seasons.map((season, i) => {
    const rates = SEASON_RATES[season];
    return {
      period: periodLabels[i],
      day: formatRateCell(rates.day),
      week: formatRateCell(rates.week),
      month: formatRateCell(rates.month),
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
export function estimateSeasonDays(season: ParkingSeason, days: number): number {
  if (days <= 0) return 0;
  const rates = SEASON_RATES[season];

  if (season === "summer") {
    const week = rates.week ?? 0;
    const day = rates.day ?? 0;
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    return weeks * week + rem * day;
  }

  if (season === "september") {
    const week = rates.week ?? 0;
    return Math.ceil(days / 7) * week;
  }

  const month = rates.month ?? 0;
  return Math.ceil(days / 30) * month;
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

export type ParkingOfferSpec = {
  season: ParkingSeason;
  unit: "day" | "week" | "month";
  price: number;
  name: { es: string; en: string; fr: string };
};

/** Seasonal offers for JSON-LD (only units that have a published rate). */
export function parkingOfferSpecs(): ParkingOfferSpec[] {
  return [
    {
      season: "summer",
      unit: "day",
      price: SEASON_RATES.summer.day!,
      name: {
        es: "Tarifa diaria junio–agosto",
        en: "Daily rate June–August",
        fr: "Tarif journalier juin–août",
      },
    },
    {
      season: "summer",
      unit: "week",
      price: SEASON_RATES.summer.week!,
      name: {
        es: "Tarifa semanal junio–agosto",
        en: "Weekly rate June–August",
        fr: "Tarif hebdomadaire juin–août",
      },
    },
    {
      season: "september",
      unit: "week",
      price: SEASON_RATES.september.week!,
      name: {
        es: "Tarifa semanal septiembre",
        en: "Weekly rate September",
        fr: "Tarif hebdomadaire septembre",
      },
    },
    {
      season: "winter",
      unit: "month",
      price: SEASON_RATES.winter.month!,
      name: {
        es: "Tarifa mensual octubre–mayo",
        en: "Monthly rate October–May",
        fr: "Tarif mensuel octobre–mai",
      },
    },
  ];
}
