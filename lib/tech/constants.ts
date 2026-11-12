export const TECH_PATH = "/guardamar-click";
export const TECH_BRAND = "Guardamar Click";
export const TECH_TIMEZONE = "Europe/Madrid";

export const GROUP_PRICE_CENTS = 1000;
export const INDIVIDUAL_PRICE_CENTS = 2500;
export const INDIVIDUAL_SHORT_PRICE_CENTS = 1000;
/** Product language: private sessions map to DB kind `individual`. */
export const SESSION_MINUTES = 60;
export const GROUP_MINUTES = SESSION_MINUTES;
export const INDIVIDUAL_MINUTES = SESSION_MINUTES;
export const INDIVIDUAL_SHORT_MINUTES = 30;
export const GROUP_CAPACITY = 7;
export const WEEKLY_SLOT_CAP = 3;
export const BUSY_BUFFER_MINUTES = 15;

export const SOURCES = ["facebook", "instagram", "whatsapp", "flyer", "referral"] as const;
export type TechSource = (typeof SOURCES)[number];

export const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
export const REQUEST_LEAD_MS = 60 * 60 * 1000;

export const RATE_WINDOW_SECONDS = 10 * 60;
export const RATE_MAX_PER_IP = 8;
export const RATE_MAX_PER_PHONE = 4;

/** Allowed private session lengths (minutes). */
export const INDIVIDUAL_DURATIONS = [INDIVIDUAL_SHORT_MINUTES, INDIVIDUAL_MINUTES] as const;
export type IndividualDuration = (typeof INDIVIDUAL_DURATIONS)[number];

export function isIndividualDuration(value: unknown): value is IndividualDuration {
  return value === INDIVIDUAL_SHORT_MINUTES || value === INDIVIDUAL_MINUTES;
}

export function individualPriceCents(durationMinutes: IndividualDuration): number {
  return durationMinutes === INDIVIDUAL_SHORT_MINUTES
    ? INDIVIDUAL_SHORT_PRICE_CENTS
    : INDIVIDUAL_PRICE_CENTS;
}

export function priceCentsForCreate(
  kind: "group" | "individual",
  durationMinutes: number
): number {
  if (kind === "group") return GROUP_PRICE_CENTS;
  if (!isIndividualDuration(durationMinutes)) return INDIVIDUAL_PRICE_CENTS;
  return individualPriceCents(durationMinutes);
}
