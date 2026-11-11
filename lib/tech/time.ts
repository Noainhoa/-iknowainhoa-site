import { CANCEL_WINDOW_MS, REQUEST_LEAD_MS, TECH_TIMEZONE } from "@/lib/tech/constants";

export type Interval = { startMs: number; endMs: number };

/** Half-open intervals. Touching endpoints do not overlap. */
export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

export function approvalBlocked(existing: Interval[], candidate: Interval): boolean {
  return existing.some((item) => intervalsOverlap(item, candidate));
}

export function seatAvailable(confirmedCount: number, capacity: number): boolean {
  return confirmedCount < capacity;
}

/**
 * Free cancellation until 24 elapsed hours before the start.
 * Exactly 24 hours before is still free. Inside that window, it is not.
 */
export function canCancelFree(startsAt: Date, now: Date): boolean {
  return startsAt.getTime() - now.getTime() >= CANCEL_WINDOW_MS;
}

export function requestIsSoonEnough(requestedStart: Date, now: Date): boolean {
  return requestedStart.getTime() - now.getTime() > REQUEST_LEAD_MS;
}

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): number {
  const value = parts.find((item) => item.type === type)?.value ?? "0";
  return Number(value);
}

/**
 * Convert a wall-clock date and time in Europe/Madrid to a UTC instant.
 * Daytime hours avoid the missing and repeated hours on DST changeover nights.
 */
export function madridLocalToUtc(date: string, time: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("tech_invalid_datetime");
  }
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const asUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TECH_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(asUtc);
  let zonedHour = part(parts, "hour");
  if (zonedHour === 24) zonedHour = 0;
  const zonedAsUtc = Date.UTC(
    part(parts, "year"),
    part(parts, "month") - 1,
    part(parts, "day"),
    zonedHour,
    part(parts, "minute"),
    part(parts, "second")
  );
  const offset = zonedAsUtc - asUtc.getTime();
  return new Date(asUtc.getTime() - offset);
}

export function formatMadrid(instant: Date, locale: "es" | "en" | "nl"): string {
  const tag = locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : "es-ES";
  return new Intl.DateTimeFormat(tag, {
    timeZone: TECH_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(instant);
}

export function madridHour(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TECH_TIMEZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  let hour = part(parts, "hour");
  if (hour === 24) hour = 0;
  return hour;
}

export function requestTimeAllowed(instant: Date, now: Date): boolean {
  if (!requestIsSoonEnough(instant, now)) return false;
  if (instant.getTime() - now.getTime() > 120 * 24 * 60 * 60 * 1000) return false;
  const hour = madridHour(instant);
  return hour >= 8 && hour <= 19;
}

export function madridDayKey(instant: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TECH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(instant);
}

export function wholeMadridDay(date: string): { startsAt: Date; endsAt: Date } {
  const startsAt = madridLocalToUtc(date, "00:00");
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);
  return { startsAt, endsAt: madridLocalToUtc(nextDate, "00:00") };
}
