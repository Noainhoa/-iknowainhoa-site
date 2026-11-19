import {
  estimateParkingPrice,
  formatEuroEstimate,
} from "@/lib/parking/pricing";
import { normalizeParkingPlate } from "@/lib/parking/plate";
import type { Locale } from "@/lib/i18n/shared";
import { localeTag } from "@/lib/i18n/shared";

export const PARKING_WHATSAPP_NUMBER = "34636670103";
export const PARKING_DNI_BUCKET = "parking-dni";

/**
 * Build a chat URL that prefers WhatsApp Business on Android
 * (package com.whatsapp.w4b) when both apps are installed.
 */
export function buildBusinessWhatsAppUrl(
  phoneDigits: string | null,
  message: string
): string {
  const text = encodeURIComponent(message);
  const web = phoneDigits
    ? `https://api.whatsapp.com/send/?phone=${phoneDigits}&text=${text}&type=phone_number&app_absent=0`
    : `https://api.whatsapp.com/send/?text=${text}`;

  if (typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)) {
    const path = phoneDigits
      ? `send?phone=${phoneDigits}&text=${text}`
      : `send?text=${text}`;
    return `intent://${path}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url=${encodeURIComponent(web)};end`;
  }

  return web;
}

export function dniStoragePath(bookingId: string, file: File): string {
  const raw = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const ext = ["jpg", "jpeg", "png", "webp", "heic", "pdf"].includes(raw)
    ? raw === "jpeg"
      ? "jpg"
      : raw
    : "jpg";
  return `${bookingId}/dni.${ext}`;
}

export type ParkingBookingStatus =
  | "reserved"
  | "completed"
  | "blocked"
  | "cancelled"
  | "refunded"
  | "eliminated";

export type ParkingBooking = {
  id: string;
  start_date: string;
  end_date: string;
  status: ParkingBookingStatus;
  customer_name: string | null;
  customer_surnames: string | null;
  customer_dni: string | null;
  customer_dni_image_path: string | null;
  customer_phone: string | null;
  vehicle_registration: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  /** Free-text fallback / combined label; prefer brand + model when set. */
  vehicle_description: string | null;
  arrival_time: string | null;
  departure_time: string | null;
  price_eur: number | null;
  private_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ParkingFeedbackMood = "good" | "ok" | "problem";
export type ParkingFeedbackStatus = "new" | "read" | "archived";

export type ParkingFeedback = {
  id: string;
  created_at: string;
  locale: string | null;
  mood: ParkingFeedbackMood | null;
  message: string;
  reference: string | null;
  page_url: string | null;
  status: ParkingFeedbackStatus;
};

/** Public-safe range from the view / filtered fetch */
export type ParkingUnavailableRange = {
  id: string;
  start_date: string;
  end_date: string;
  availability: "unavailable";
};

export const STATUS_LABELS_ES: Record<ParkingBookingStatus, string> = {
  reserved: "Reservado (pagado)",
  completed: "Finalizado",
  blocked: "No disponible",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  eliminated: "Eliminado",
};

/** Statuses that still occupy the spot for overlap checks. */
export function statusOccupiesSpot(status: ParkingBookingStatus): boolean {
  return status === "reserved" || status === "blocked";
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function eachDateInclusive(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  let cur = parseISODate(startIso);
  const end = parseISODate(endIso);
  while (cur <= end) {
    out.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  // Occupancy is half-open [start, end): end_date is checkout / exit day
  // and may be reused as another booking's start. Same-day blocks occupy that day.
  const aExclusiveEnd = aStart === aEnd ? toISODate(addDays(parseISODate(aEnd), 1)) : aEnd;
  const bExclusiveEnd = bStart === bEnd ? toISODate(addDays(parseISODate(bEnd), 1)) : bEnd;
  return aStart < bExclusiveEnd && bStart < aExclusiveEnd;
}

export function formatSpanishDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatLocaleDate(iso: string, locale: Locale): string {
  return parseISODate(iso).toLocaleDateString(localeTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function countInclusiveDays(startIso: string, endIso: string): number {
  return eachDateInclusive(startIso, endIso).length;
}

/** Days the vehicle occupies the spot: [start, end) — exit day is free. */
export function eachOccupiedDate(startIso: string, endIso: string): string[] {
  if (startIso === endIso) return [startIso];
  const out: string[] = [];
  let cur = parseISODate(startIso);
  const end = parseISODate(endIso);
  while (cur < end) {
    out.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

/** True if this booking occupies `iso` (exit/end day does not count). */
export function bookingOccupiesDate(
  iso: string,
  startIso: string,
  endIso: string
): boolean {
  if (startIso === endIso) return iso === startIso;
  return iso >= startIso && iso < endIso;
}

export type EnquiryPeriod = { arrival: string; departure: string };
export type EnquiryMultiMode = "single" | "or" | "and";

export const MAX_ENQUIRY_PERIODS = 3;

/** True if two inclusive enquiry periods overlap on any calendar day. */
export function enquiryPeriodsOverlap(
  a: EnquiryPeriod,
  b: EnquiryPeriod
): boolean {
  return a.arrival <= b.departure && b.arrival <= a.departure;
}

/** Compact date for WhatsApp prefills (keeps Safari’s open-link prompt shorter). */
function formatWaDate(iso: string, locale: Locale): string {
  return parseISODate(iso)
    .toLocaleDateString(localeTag(locale), {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keep this message short: Safari rewrites the https link to whatsapp:// and
 * shows the full encoded URL in the “Open this link?” sheet.
 */
export function buildWhatsAppMessage(input: {
  locale: Locale;
  periods: EnquiryPeriod[];
  mode: EnquiryMultiMode;
  name: string;
  registration?: string;
  vehicle?: string;
  comments?: string;
  /** Optional; omitted from the default enquiry to keep the URL short. */
  pageUrl?: string;
  rates?: import("@/lib/parking/pricing").ParkingRatesMap;
}): string {
  const { locale } = input;
  const rates = input.rates;
  const periods = input.periods.filter(
    (p) => p.arrival && p.departure && p.departure >= p.arrival
  );
  const mode: EnquiryMultiMode =
    periods.length <= 1 ? "single" : input.mode === "and" ? "and" : "or";

  const durationLabel = (days: number) =>
    locale === "fr" ? `${days}j` : `${days}d`;

  const periodLine = (p: EnquiryPeriod, index: number, numbered: boolean) => {
    const days = countInclusiveDays(p.arrival, p.departure);
    const estimate = formatEuroEstimate(
      estimateParkingPrice(p.arrival, p.departure, rates)
    );
    const prefix = numbered ? `${index + 1}) ` : "";
    return `${prefix}${formatWaDate(p.arrival, locale)} → ${formatWaDate(p.departure, locale)} · ${durationLabel(days)} · ${estimate}`;
  };

  let datesSection: string;
  if (periods.length === 0) {
    datesSection =
      locale === "es"
        ? "(Sin fechas)"
        : locale === "fr"
          ? "(Aucune date)"
          : "(No dates)";
  } else if (mode === "single" || periods.length === 1) {
    datesSection = periodLine(periods[0], 0, false);
  } else if (mode === "or") {
    const header =
      locale === "es"
        ? "Alternativas (¿alguna?):"
        : locale === "fr"
          ? "Alternatives (l’une ?) :"
          : "Alternatives (any?):";
    datesSection = `${header}\n${periods
      .map((p, i) => periodLine(p, i, true))
      .join("\n")}`;
  } else {
    const header =
      locale === "es"
        ? "Todas (¿disponibles?):"
        : locale === "fr"
          ? "Toutes (disponibles ?) :"
          : "All stays (available?):";
    const totalDays = periods.reduce(
      (sum, p) => sum + countInclusiveDays(p.arrival, p.departure),
      0
    );
    const totalEstimate = formatEuroEstimate(
      periods.reduce(
        (sum, p) => sum + estimateParkingPrice(p.arrival, p.departure, rates),
        0
      )
    );
    const totals =
      locale === "es"
        ? `Total: ${durationLabel(totalDays)} · ${totalEstimate}`
        : locale === "fr"
          ? `Total : ${durationLabel(totalDays)} · ${totalEstimate}`
          : `Total: ${durationLabel(totalDays)} · ${totalEstimate}`;
    datesSection = `${header}\n${periods
      .map((p, i) => periodLine(p, i, true))
      .join("\n")}\n${totals}`;
  }

  const details: string[] = [input.name.trim()];
  const registration = normalizeParkingPlate(input.registration || "");
  if (registration) details.push(registration);
  const vehicle = input.vehicle?.trim();
  if (vehicle) details.push(vehicle);
  const comments = input.comments?.trim();
  if (comments) {
    details.push(
      locale === "es"
        ? `Notas: ${comments}`
        : locale === "fr"
          ? `Notes : ${comments}`
          : `Notes: ${comments}`
    );
  }

  const closing =
    locale === "es"
      ? "(Sin confirmar hasta tu respuesta)"
      : locale === "fr"
        ? "(Non confirmé avant votre réponse)"
        : "(Not confirmed until you reply)";

  const intro =
    locale === "es"
      ? "Hola Ainhoa — parking Guardamar"
      : locale === "fr"
        ? "Bonjour Ainhoa — parking Guardamar"
        : "Hi Ainhoa — Guardamar parking";

  const parts = [intro, "", datesSection, "", details.join(" · "), closing];
  if (input.pageUrl) {
    parts.splice(parts.length - 1, 0, input.pageUrl, "");
  }
  return parts.join("\n");
}

export function whatsAppHref(message: string): string {
  return buildBusinessWhatsAppUrl(PARKING_WHATSAPP_NUMBER, message);
}

/** True if date is occupied by any booking (exit/end day stays available). */
export function isDateUnavailable(
  iso: string,
  ranges: ParkingUnavailableRange[]
): boolean {
  return ranges.some((r) =>
    bookingOccupiesDate(iso, r.start_date, r.end_date)
  );
}

/**
 * First free day on/after `fromIso` (inclusive).
 * Returns null only if nothing is free within `maxDays` (should not happen in prod).
 */
export function nextAvailableDate(
  fromIso: string,
  ranges: ParkingUnavailableRange[],
  maxDays = 548
): string | null {
  let cur = parseISODate(fromIso);
  for (let i = 0; i < maxDays; i++) {
    const iso = toISODate(cur);
    if (!isDateUnavailable(iso, ranges)) return iso;
    cur = addDays(cur, 1);
  }
  return null;
}

export function rangeContainsUnavailable(
  startIso: string,
  endIso: string,
  ranges: ParkingUnavailableRange[]
): boolean {
  return eachOccupiedDate(startIso, endIso).some((d) =>
    isDateUnavailable(d, ranges)
  );
}
