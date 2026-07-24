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

export function formatLocaleDate(iso: string, locale: "en" | "es"): string {
  return parseISODate(iso).toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
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

export function buildWhatsAppMessage(input: {
  locale: "en" | "es";
  arrival: string;
  departure: string;
  name: string;
  registration?: string;
  vehicle?: string;
  arrivalTiming: "before_midday" | "after_midday";
  departureTiming: "before_midday" | "after_midday";
  comments?: string;
}): string {
  const days = countInclusiveDays(input.arrival, input.departure);
  const es = input.locale === "es";
  const arrivalLabel =
    input.arrivalTiming === "before_midday"
      ? es
        ? "Antes del mediodía"
        : "Before midday"
      : es
        ? "Después del mediodía"
        : "After midday";
  const departureLabel =
    input.departureTiming === "before_midday"
      ? es
        ? "Antes del mediodía"
        : "Before midday"
      : es
        ? "Después del mediodía"
        : "After midday";

  if (es) {
    return `Hola Ainhoa, quisiera consultar la disponibilidad de Parking Guardamar Centro (Jorge Juan 13).

Fechas: del ${formatLocaleDate(input.arrival, "es")} al ${formatLocaleDate(input.departure, "es")}
Duración: ${days} días
Nombre: ${input.name}
Matrícula: ${input.registration?.trim() || "No indicada"}
Vehículo: ${input.vehicle?.trim() || "No indicado"}
Llegada: ${arrivalLabel}
Salida: ${departureLabel}
Comentarios: ${input.comments?.trim() || "Sin comentarios"}

Entiendo que esta consulta no confirma la reserva hasta recibir tu confirmación.`;
  }

  return `Hi Ainhoa, I'd like to check availability for Parking Guardamar Centro (Jorge Juan 13).

Dates: from ${formatLocaleDate(input.arrival, "en")} to ${formatLocaleDate(input.departure, "en")}
Duration: ${days} days
Name: ${input.name}
Registration: ${input.registration?.trim() || "Not provided"}
Vehicle: ${input.vehicle?.trim() || "Not provided"}
Arrival: ${arrivalLabel}
Departure: ${departureLabel}
Comments: ${input.comments?.trim() || "None"}

I understand this enquiry does not confirm the booking until you confirm.`;
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

export function rangeContainsUnavailable(
  startIso: string,
  endIso: string,
  ranges: ParkingUnavailableRange[]
): boolean {
  return eachOccupiedDate(startIso, endIso).some((d) =>
    isDateUnavailable(d, ranges)
  );
}
