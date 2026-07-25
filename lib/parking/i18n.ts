import type { Locale } from "@/lib/i18n/shared";

export type MiddayTiming = "before_midday" | "after_midday";

export type ParkingPriceRow = {
  period: string;
  day: string;
  week: string;
  quincena: string;
  month: string;
};

export type ParkingCopy = {
  brand: string;
  title: string;
  intro: string;
  accessNote: string;
  pricesTitle: string;
  priceColDay: string;
  priceColWeek: string;
  priceColQuincena: string;
  priceColMonth: string;
  priceRows: ParkingPriceRow[];
  legend: string;
  available: string;
  unavailable: string;
  past: string;
  selected: string;
  prevMonth: string;
  nextMonth: string;
  clearDates: string;
  summaryRange: (from: string, to: string) => string;
  duration: (n: number) => string;
  pickDeparture: string;
  pickArrival: string;
  name: string;
  registration: string;
  vehicle: string;
  optional: string;
  namePlaceholder: string;
  arrivalTiming: string;
  departureTiming: string;
  timingPlaceholder: string;
  beforeMidday: string;
  afterMidday: string;
  comments: string;
  whatsappCta: string;
  whatsappNote: string;
  supabaseHint: string;
  loadError: string;
  errNeedDates: string;
  errNeedName: string;
  errUnavailable: string;
  errRangeUnavailable: string;
  errNeedTiming: string;
  weekdays: string[];
};

const DASH = "—";

const es: ParkingCopy = {
  brand: "Parking Guardamar Centro",
  title: "Parking Guardamar Centro",
  intro: "Elige fechas y consulta por WhatsApp.",
  accessNote: "Por restricciones de acceso, coches de máximo 1,79 m de altura.",
  pricesTitle: "Precios",
  priceColDay: "Día",
  priceColWeek: "Semana",
  priceColQuincena: "Quincena",
  priceColMonth: "Mes",
  priceRows: [
    {
      period: "Junio–agosto",
      day: "10 €",
      week: "70 €",
      quincena: DASH,
      month: DASH,
    },
    {
      period: "Septiembre",
      day: DASH,
      week: "50 €",
      quincena: DASH,
      month: DASH,
    },
    {
      period: "Octubre–mayo",
      day: DASH,
      week: DASH,
      quincena: "40 €",
      month: "75 €",
    },
  ],
  legend: "Leyenda",
  available: "Disponible",
  unavailable: "No disponible",
  past: "Pasado",
  selected: "Seleccionado",
  prevMonth: "Mes anterior",
  nextMonth: "Mes siguiente",
  clearDates: "Borrar fechas",
  summaryRange: (from, to) => `Fechas: del ${from} al ${to}.`,
  duration: (n) => `${n} ${n === 1 ? "día" : "días"}.`,
  pickDeparture: "Elige la fecha de salida.",
  pickArrival: "Elige la fecha de llegada.",
  name: "Nombre",
  registration: "Matrícula del vehículo",
  vehicle: "Modelo o tipo de vehículo",
  optional: "Opcional",
  namePlaceholder: "Tu nombre",
  arrivalTiming: "Llegada",
  departureTiming: "Salida",
  timingPlaceholder: "Selecciona…",
  beforeMidday: "Antes del mediodía",
  afterMidday: "Después del mediodía",
  comments: "Comentarios",
  whatsappCta: "Consultar por WhatsApp Business",
  whatsappNote: "No confirma la reserva hasta que te responda.",
  supabaseHint:
    "Calendario en modo local: falta configurar Supabase. Todas las fechas futuras aparecen como disponibles hasta que se conecte la base de datos.",
  loadError:
    "No se ha podido cargar la disponibilidad. Inténtalo de nuevo más tarde.",
  errNeedDates: "Selecciona las fechas de llegada y salida.",
  errNeedName: "El nombre es obligatorio.",
  errUnavailable: "El intervalo incluye fechas no disponibles.",
  errRangeUnavailable:
    "El intervalo incluye fechas no disponibles. Elige otras fechas.",
  errNeedTiming: "Indica si la llegada y la salida son antes o después del mediodía.",
  weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
};

const en: ParkingCopy = {
  brand: "Parking Guardamar Centro",
  title: "Parking Guardamar Centro",
  intro: "Pick dates and enquire on WhatsApp.",
  accessNote: "Access restriction: cars max. 1.79 m height.",
  pricesTitle: "Prices",
  priceColDay: "Day",
  priceColWeek: "Week",
  priceColQuincena: "Fortnight",
  priceColMonth: "Month",
  priceRows: [
    {
      period: "June–August",
      day: "€10",
      week: "€70",
      quincena: DASH,
      month: DASH,
    },
    {
      period: "September",
      day: DASH,
      week: "€50",
      quincena: DASH,
      month: DASH,
    },
    {
      period: "October–May",
      day: DASH,
      week: DASH,
      quincena: "€40",
      month: "€75",
    },
  ],
  legend: "Legend",
  available: "Available",
  unavailable: "Unavailable",
  past: "Past",
  selected: "Selected",
  prevMonth: "Previous month",
  nextMonth: "Next month",
  clearDates: "Clear dates",
  summaryRange: (from, to) => `Dates: from ${from} to ${to}.`,
  duration: (n) => `${n} ${n === 1 ? "day" : "days"}.`,
  pickDeparture: "Choose your departure date.",
  pickArrival: "Choose your arrival date.",
  name: "Name",
  registration: "Vehicle registration",
  vehicle: "Vehicle model or type",
  optional: "Optional",
  namePlaceholder: "Your name",
  arrivalTiming: "Arrival",
  departureTiming: "Departure",
  timingPlaceholder: "Select…",
  beforeMidday: "Before midday",
  afterMidday: "After midday",
  comments: "Comments",
  whatsappCta: "Enquire on WhatsApp Business",
  whatsappNote: "Does not confirm the booking until I reply.",
  supabaseHint:
    "Calendar in local mode: Supabase is not configured. All future dates show as available until the database is connected.",
  loadError: "Could not load availability. Please try again later.",
  errNeedDates: "Select arrival and departure dates.",
  errNeedName: "Name is required.",
  errUnavailable: "The range includes unavailable dates.",
  errRangeUnavailable:
    "The range includes unavailable dates. Please choose other dates.",
  errNeedTiming: "Choose whether arrival and departure are before or after midday.",
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export function getParkingCopy(locale: Locale): ParkingCopy {
  return locale === "es" ? es : en;
}

export function formatParkingDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMonthLabel(date: Date, locale: Locale): string {
  const month = date.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    month: "long",
  });
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function timingLabel(timing: MiddayTiming, locale: Locale): string {
  const t = getParkingCopy(locale);
  return timing === "before_midday" ? t.beforeMidday : t.afterMidday;
}
