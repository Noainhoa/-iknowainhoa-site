export const PARKING_WHATSAPP_NUMBER = "34636670103";
export const PARKING_WHATSAPP_URL = `https://wa.me/${PARKING_WHATSAPP_NUMBER}`;

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
  return aStart <= bEnd && bStart <= aEnd;
}

export function formatSpanishDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function countInclusiveDays(startIso: string, endIso: string): number {
  return eachDateInclusive(startIso, endIso).length;
}

export function buildWhatsAppMessage(input: {
  arrival: string;
  departure: string;
  name: string;
  registration?: string;
  vehicle?: string;
  arrivalTime?: string;
  departureTime?: string;
  comments?: string;
}): string {
  const days = countInclusiveDays(input.arrival, input.departure);
  return `Hola Ainhoa, quisiera consultar la disponibilidad de Parking Guardamar Centro.

Fechas: del ${formatSpanishDate(input.arrival)} al ${formatSpanishDate(input.departure)}
Duración: ${days} días
Nombre: ${input.name}
Matrícula: ${input.registration?.trim() || "No indicada"}
Vehículo: ${input.vehicle?.trim() || "No indicado"}
Llegada aproximada: ${input.arrivalTime?.trim() || "No indicada"}
Salida aproximada: ${input.departureTime?.trim() || "No indicada"}
Comentarios: ${input.comments?.trim() || "Sin comentarios"}

Entiendo que esta consulta no confirma la reserva hasta recibir tu confirmación.`;
}

export function whatsAppHref(message: string): string {
  return `${PARKING_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

/** True if date falls inside any unavailable range (inclusive). */
export function isDateUnavailable(
  iso: string,
  ranges: ParkingUnavailableRange[]
): boolean {
  return ranges.some((r) => iso >= r.start_date && iso <= r.end_date);
}

export function rangeContainsUnavailable(
  startIso: string,
  endIso: string,
  ranges: ParkingUnavailableRange[]
): boolean {
  return eachDateInclusive(startIso, endIso).some((d) =>
    isDateUnavailable(d, ranges)
  );
}
