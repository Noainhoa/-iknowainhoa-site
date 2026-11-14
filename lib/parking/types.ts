import {
  estimateParkingPrice,
  formatEuroEstimate,
} from "@/lib/parking/pricing";
import type { Locale } from "@/lib/i18n/shared";
import { localeTag } from "@/lib/i18n/shared";

export const PARKING_WHATSAPP_NUMBER = "34636670103";
/** Official click-to-chat (works with WhatsApp Business accounts). */
export const PARKING_WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${PARKING_WHATSAPP_NUMBER}&type=phone_number&app_absent=0`;
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
  | "cancelled";

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
  vehicle_description: string | null;
  arrival_time: string | null;
  departure_time: string | null;
  price_eur: number | null;
  private_notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Public-safe range from the view / filtered fetch */
export type ParkingUnavailableRange = {
  id: string;
  start_date: string;
  end_date: string;
  availability: "unavailable";
};

export const STATUS_LABELS_ES: Record<ParkingBookingStatus, string> = {
  reserved: "Reservado",
  completed: "Finalizado",
  blocked: "No disponible",
  cancelled: "Cancelado",
};

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

export function buildWhatsAppMessage(input: {
  locale: Locale;
  periods: EnquiryPeriod[];
  mode: EnquiryMultiMode;
  name: string;
  registration?: string;
  vehicle?: string;
  comments?: string;
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

  const emptyReg =
    locale === "es"
      ? "No indicada"
      : locale === "fr"
        ? "Non indiquée"
        : "Not provided";
  const emptyVehicle =
    locale === "es"
      ? "No indicado"
      : locale === "fr"
        ? "Non indiqué"
        : "Not provided";
  const emptyComments =
    locale === "es"
      ? "Sin comentarios"
      : locale === "fr"
        ? "Aucun commentaire"
        : "No additional comments";

  const registration = input.registration?.trim()
    ? input.registration.trim().toUpperCase()
    : emptyReg;
  const vehicle = input.vehicle?.trim()
    ? input.vehicle.trim()
    : emptyVehicle;
  const comments = input.comments?.trim()
    ? input.comments.trim()
    : emptyComments;

  const durationLabel = (days: number) => {
    if (locale === "es") return `${days} ${days === 1 ? "día" : "días"}`;
    if (locale === "fr") return `${days} ${days === 1 ? "jour" : "jours"}`;
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  const periodBlock = (p: EnquiryPeriod, index: number, numbered: boolean) => {
    const days = countInclusiveDays(p.arrival, p.departure);
    const estimate = formatEuroEstimate(
      estimateParkingPrice(p.arrival, p.departure, rates)
    );
    const prefix = numbered ? `${index + 1}) ` : "";
    const pad = numbered ? "   " : "";
    if (locale === "es") {
      return `${prefix}Entrada: ${formatLocaleDate(p.arrival, "es")}
${pad}Salida: ${formatLocaleDate(p.departure, "es")}
${pad}Duración: ${durationLabel(days)}
${pad}Estimación: ${estimate}`;
    }
    if (locale === "fr") {
      return `${prefix}Arrivée : ${formatLocaleDate(p.arrival, "fr")}
${pad}Départ : ${formatLocaleDate(p.departure, "fr")}
${pad}Durée : ${durationLabel(days)}
${pad}Estimation : ${estimate}`;
    }
    return `${prefix}Arrival: ${formatLocaleDate(p.arrival, "en")}
${pad}Departure: ${formatLocaleDate(p.departure, "en")}
${pad}Duration: ${durationLabel(days)}
${pad}Estimate: ${estimate}`;
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
    const p = periods[0];
    datesSection = periodBlock(p, 0, false);
  } else if (mode === "or") {
    const header =
      locale === "es"
        ? "Opciones alternativas (¿alguna disponible?):"
        : locale === "fr"
          ? "Options alternatives (l’une est-elle disponible ?) :"
          : "Alternative options (is either available?):";
    datesSection = `${header}\n${periods
      .map((p, i) => periodBlock(p, i, true))
      .join("\n")}`;
  } else {
    const header =
      locale === "es"
        ? "Necesito todas estas estancias (¿todas disponibles?):"
        : locale === "fr"
          ? "J’ai besoin de tous ces séjours (sont-ils tous disponibles ?) :"
          : "I need all of these stays (are all available?):";
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
        ? `Total: ${durationLabel(totalDays)}\nEstimación total: ${totalEstimate}`
        : locale === "fr"
          ? `Total : ${durationLabel(totalDays)}\nEstimation totale : ${totalEstimate}`
          : `Total: ${durationLabel(totalDays)}\nTotal estimate: ${totalEstimate}`;
    datesSection = `${header}\n${periods
      .map((p, i) => periodBlock(p, i, true))
      .join("\n")}\n${totals}`;
  }

  if (locale === "es") {
    return `Hola, Ainhoa. Quisiera consultar la disponibilidad de la plaza de garaje de Guardamar.

${datesSection}
Nombre: ${input.name.trim()}
Matrícula: ${registration}
Vehículo: ${vehicle}
Comentarios: ${comments}
${input.pageUrl ? `\nPágina: ${input.pageUrl}` : ""}

Entiendo que la reserva no queda confirmada hasta recibir tu respuesta.`;
  }

  if (locale === "fr") {
    return `Bonjour Ainhoa, je souhaiterais vérifier la disponibilité de la place de parking à Guardamar.

${datesSection}
Nom : ${input.name.trim()}
Immatriculation : ${registration}
Véhicule : ${vehicle}
Commentaires : ${comments}
${input.pageUrl ? `\nPage : ${input.pageUrl}` : ""}

Je comprends que la réservation n’est confirmée qu’après votre réponse.`;
  }

  return `Hello Ainhoa, I would like to enquire about the parking space in Guardamar.

${datesSection}
Name: ${input.name.trim()}
Vehicle registration: ${registration}
Vehicle: ${vehicle}
Comments: ${comments}
${input.pageUrl ? `\nPage: ${input.pageUrl}` : ""}

I understand that the booking is not confirmed until you reply.`;
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
