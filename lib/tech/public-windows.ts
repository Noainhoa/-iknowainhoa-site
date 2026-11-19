import { madridIsoWeekday, madridMinuteOfDay } from "@/lib/tech/calendar";
import { BUSY_BUFFER_MINUTES } from "@/lib/tech/constants";

/** Prep gap around admin red commitments — kept in sync with calendar buffer. */
export const PUBLIC_PREP_BUFFER_MINUTES = BUSY_BUFFER_MINUTES;

/**
 * Published booking windows (Europe/Madrid).
 * Times must also be free in the admin template (busy + buffer already applied upstream).
 */
export const PUBLIC_OFFER_WINDOWS = [
  { weekday: 2, startMinute: 12 * 60, endMinute: 15 * 60 }, // Tue 12:00–15:00
  { weekday: 4, startMinute: 18 * 60, endMinute: 20 * 60 }, // Thu 18:00–20:00
  { weekday: 6, startMinute: 10 * 60, endMinute: 13 * 60 }, // Sat 10:00–13:00
] as const;

export type PublicOfferWindow = (typeof PUBLIC_OFFER_WINDOWS)[number];

export function isWithinPublicOfferWindow(startsAt: string | Date, durationMinutes = 60): boolean {
  const instant = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  if (!Number.isFinite(instant.getTime())) return false;
  const weekday = madridIsoWeekday(instant);
  const startMinute = madridMinuteOfDay(instant);
  const endMinute = startMinute + durationMinutes;
  return PUBLIC_OFFER_WINDOWS.some(
    (window) =>
      window.weekday === weekday && startMinute >= window.startMinute && endMinute <= window.endMinute
  );
}

export function filterStartsToPublicWindows(starts: string[], durationMinutes = 60): string[] {
  return starts.filter((startsAt) => isWithinPublicOfferWindow(startsAt, durationMinutes));
}

/** Short-notice requests (< 48h) should call instead of only messaging. */
export const SHORT_NOTICE_MS = 48 * 60 * 60 * 1000;

export function isShortNotice(startsAt: Date, now = new Date()): boolean {
  const delta = startsAt.getTime() - now.getTime();
  return delta >= 0 && delta < SHORT_NOTICE_MS;
}
