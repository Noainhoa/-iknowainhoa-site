import type { LifeDatePrecision } from "@/lib/life/types";

/** Normalize a form value into a stored DATE string (YYYY-MM-DD). */
export function normalizeLifeDate(
  precision: LifeDatePrecision,
  raw: string
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (precision === "exact" || precision === "approximate") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
    return trimmed;
  }

  if (precision === "month") {
    if (!/^\d{4}-\d{2}$/.test(trimmed)) return null;
    return `${trimmed}-01`;
  }

  if (precision === "year") {
    if (!/^\d{4}$/.test(trimmed)) return null;
    return `${trimmed}-01-01`;
  }

  return null;
}

/** Split a stored date back into form-friendly raw values. */
export function lifeDateToFormValue(
  precision: LifeDatePrecision,
  stored: string
): string {
  if (precision === "month") return stored.slice(0, 7);
  if (precision === "year") return stored.slice(0, 4);
  return stored;
}

export const LIFE_PRECISION_LABELS: Record<LifeDatePrecision, string> = {
  exact: "Exact date",
  month: "Month + year",
  year: "Year only",
  approximate: "Approximate",
};
