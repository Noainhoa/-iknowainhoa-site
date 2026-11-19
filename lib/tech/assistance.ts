import {
  INDIVIDUAL_MINUTES,
  INDIVIDUAL_SHORT_MINUTES,
  INDIVIDUAL_SHORT_PRICE_CENTS,
  individualPriceCents,
  isIndividualDuration,
  type IndividualDuration,
} from "@/lib/tech/constants";

/** How the session is delivered. Groups are always onsite. */
export const ASSISTANCE_MODES = ["onsite", "phone", "home_visit"] as const;
export type AssistanceMode = (typeof ASSISTANCE_MODES)[number];

export const HOME_TRAVEL_BEFORE_MINUTES = 30;
export const HOME_TRAVEL_AFTER_MINUTES = 30;
export const HOME_TRAVEL_TOTAL_MINUTES = HOME_TRAVEL_BEFORE_MINUTES + HOME_TRAVEL_AFTER_MINUTES;

/** Home 30 help + 60 travel. */
export const HOME_SHORT_BLOCK_MINUTES = INDIVIDUAL_SHORT_MINUTES + HOME_TRAVEL_TOTAL_MINUTES;
/** Home 60 help + 60 travel. */
export const HOME_BLOCK_MINUTES = INDIVIDUAL_MINUTES + HOME_TRAVEL_TOTAL_MINUTES;

/** Travel billed as two short blocks (€10 × 2) on top of help price. */
export const HOME_TRAVEL_PRICE_CENTS = 2 * INDIVIDUAL_SHORT_PRICE_CENTS;

export function isAssistanceMode(value: unknown): value is AssistanceMode {
  return value === "onsite" || value === "phone" || value === "home_visit";
}

export function homeBlockMinutes(helpMinutes: IndividualDuration): number {
  return helpMinutes + HOME_TRAVEL_TOTAL_MINUTES;
}

export function homePriceCents(helpMinutes: IndividualDuration): number {
  return individualPriceCents(helpMinutes) + HOME_TRAVEL_PRICE_CENTS;
}

export function venueLabelForMode(
  mode: AssistanceMode,
  onsiteVenue: string
): string {
  if (mode === "phone") return "Asistencia telefónica";
  if (mode === "home_visit") return "Visita a domicilio · Guardamar";
  return onsiteVenue;
}

export type CreateTiming = {
  /** Calendar block start (for home visits this is arrival − 30 min). */
  startsAt: string;
  /** Customer-facing arrival / call time. */
  arrivalAt: string;
  /** Minutes blocked on the calendar. */
  durationMinutes: number;
  /** Help length the customer chose (30 or 60). */
  helpMinutes: IndividualDuration;
  priceCents: number;
  assistanceMode: AssistanceMode;
};

/** Resolve create payload timing/price from arrival + help + mode. */
export function resolveCreateTiming(args: {
  mode: AssistanceMode;
  arrivalAt: string;
  helpMinutes: number;
}): CreateTiming | null {
  if (!isIndividualDuration(args.helpMinutes)) return null;
  const arrival = new Date(args.arrivalAt);
  if (Number.isNaN(arrival.getTime())) return null;

  if (args.mode === "home_visit") {
    const startsAt = new Date(
      arrival.getTime() - HOME_TRAVEL_BEFORE_MINUTES * 60_000
    ).toISOString();
    return {
      startsAt,
      arrivalAt: arrival.toISOString(),
      durationMinutes: homeBlockMinutes(args.helpMinutes),
      helpMinutes: args.helpMinutes,
      priceCents: homePriceCents(args.helpMinutes),
      assistanceMode: "home_visit",
    };
  }

  return {
    startsAt: arrival.toISOString(),
    arrivalAt: arrival.toISOString(),
    durationMinutes: args.helpMinutes,
    helpMinutes: args.helpMinutes,
    priceCents: individualPriceCents(args.helpMinutes),
    assistanceMode: args.mode,
  };
}

/** Arrival time for a home block that starts at `blockStartsAt`. */
export function arrivalFromHomeBlockStart(blockStartsAt: string): string {
  return new Date(
    new Date(blockStartsAt).getTime() + HOME_TRAVEL_BEFORE_MINUTES * 60_000
  ).toISOString();
}

/**
 * Home-visit arrivals that fit: there must be a free block starting 30 min
 * before arrival, lasting help + 60.
 */
export function homeArrivalsFromBlockStarts(blockStarts: string[]): string[] {
  return blockStarts.map(arrivalFromHomeBlockStart);
}
