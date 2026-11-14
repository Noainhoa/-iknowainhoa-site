import type { Locale } from "@/lib/i18n/shared";

/** Max vehicle access height including roof boxes / racks. */
export const PARKING_MAX_ACCESS_HEIGHT_M = 1.79;

/** Bay footprint (metres). */
export const PARKING_BAY_LENGTH_M = 4.9;
export const PARKING_BAY_WIDTH_M = 2.4;

/** Display asset for the circular header / admin logo (56–128 CSS px). */
export const PARKING_BADGE_SRC = "/images/parking/guardamar-parking-badge-128.png";

export function parkingAccessHeightLabel(locale: Locale): string {
  const n =
    locale === "en"
      ? PARKING_MAX_ACCESS_HEIGHT_M.toFixed(2)
      : PARKING_MAX_ACCESS_HEIGHT_M.toFixed(2).replace(".", ",");
  return `${n} m`;
}

export function parkingBaySizeLabel(locale: Locale): string {
  const fmt = (n: number) =>
    locale === "en" ? n.toFixed(2) : n.toFixed(2).replace(".", ",");
  return `${fmt(PARKING_BAY_LENGTH_M)} m × ${fmt(PARKING_BAY_WIDTH_M)} m`;
}
