import type { Locale } from "@/lib/i18n/shared";

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
  locationLine1: string;
  locationLine2: string;
  heroAlt: string;
  pricesTitle: string;
  pricesSupport: string;
  pricesDisclaimer: string;
  priceColSeason: string;
  priceColDay: string;
  priceColWeek: string;
  priceColQuincena: string;
  priceColMonth: string;
  priceRows: ParkingPriceRow[];
  priceUnavailableLabel: string;
  availabilityTitle: string;
  availabilityHint: string;
  availabilityHintDeparture: string;
  selectedDatesTitle: string;
  legend: string;
  available: string;
  unavailable: string;
  past: string;
  selected: string;
  prevMonths: string;
  nextMonths: string;
  clearDates: string;
  changeDates: string;
  labelArrival: string;
  labelDeparture: string;
  labelDuration: string;
  duration: (n: number) => string;
  formTitle: string;
  name: string;
  registration: string;
  vehicle: string;
  comments: string;
  namePlaceholder: string;
  registrationPlaceholder: string;
  vehiclePlaceholder: string;
  commentsPlaceholder: string;
  accessImportant: string;
  bookingDisclaimer: string;
  privacyNote: string;
  whatsappCta: string;
  whatsappPreparing: string;
  supabaseHint: string;
  loadError: string;
  errNeedArrival: string;
  errNeedDeparture: string;
  errDepartureAfter: string;
  errUnavailable: string;
  errRangeUnavailable: string;
  errNeedName: string;
  errNeedAcceptances: string;
  errReviewFields: string;
  announceArrival: string;
  announceDeparture: string;
  announceCleared: string;
  announceInvalidRange: string;
  languageLabel: string;
  weekdays: string[];
  metaTitle: string;
  metaDescription: string;
};

const DASH = "—";

const es: ParkingCopy = {
  brand: "Parking Guardamar Centro",
  title: "Parking privado en el centro de Guardamar",
  intro: "Consulta la disponibilidad y solicita tus fechas.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  heroAlt: "Plaza de garaje privada en el centro de Guardamar",
  pricesTitle: "Tarifas",
  pricesSupport: "Elige tus fechas para consultar la tarifa.",
  pricesDisclaimer: "Precio final sujeto a confirmación.",
  priceColSeason: "Temporada",
  priceColDay: "Día",
  priceColWeek: "Semana",
  priceColQuincena: "Quincena",
  priceColMonth: "Mes",
  priceRows: [
    {
      period: "Junio–agosto",
      day: "€10",
      week: "€70",
      quincena: DASH,
      month: DASH,
    },
    {
      period: "Septiembre",
      day: DASH,
      week: "€50",
      quincena: DASH,
      month: DASH,
    },
    {
      period: "Octubre–mayo",
      day: DASH,
      week: DASH,
      quincena: "€40",
      month: "€75",
    },
  ],
  priceUnavailableLabel: "No disponible",
  availabilityTitle: "Selecciona tus fechas",
  availabilityHint:
    "Selecciona primero la fecha de entrada y después la fecha de salida.",
  availabilityHintDeparture: "Ahora selecciona la fecha de salida.",
  selectedDatesTitle: "Fechas seleccionadas",
  legend: "Leyenda",
  available: "Disponible",
  unavailable: "No disponible",
  past: "Pasado",
  selected: "Seleccionado",
  prevMonths: "Meses anteriores",
  nextMonths: "Meses siguientes",
  clearDates: "Borrar fechas",
  changeDates: "Cambiar fechas",
  labelArrival: "Entrada",
  labelDeparture: "Salida",
  labelDuration: "Duración",
  duration: (n) => `${n} ${n === 1 ? "día" : "días"}`,
  formTitle: "Datos para la solicitud",
  name: "Nombre",
  registration: "Matrícula",
  vehicle: "Modelo",
  comments: "Comentarios",
  namePlaceholder: "Tu nombre",
  registrationPlaceholder: "Opcional",
  vehiclePlaceholder: "Opcional",
  commentsPlaceholder: "Horario de llegada, dudas…",
  accessImportant:
    "Importante: la altura máxima permitida para el vehículo es de 1,79 m.",
  bookingDisclaimer:
    "Enviar la solicitud no confirma la reserva. Te responderé por WhatsApp para confirmar la disponibilidad, el precio y el pago.",
  privacyNote:
    "Los datos introducidos se utilizarán únicamente para responder a esta solicitud por WhatsApp.",
  whatsappCta: "Solicitar por WhatsApp",
  whatsappPreparing: "Preparando solicitud…",
  supabaseHint:
    "Calendario en modo local: falta configurar Supabase. Todas las fechas futuras aparecen como disponibles hasta que se conecte la base de datos.",
  loadError:
    "No se ha podido cargar la disponibilidad. Inténtalo de nuevo más tarde.",
  errNeedArrival: "Selecciona una fecha de entrada.",
  errNeedDeparture: "Selecciona una fecha de salida.",
  errDepartureAfter:
    "La fecha de salida debe ser posterior a la fecha de entrada.",
  errUnavailable: "El periodo seleccionado incluye fechas no disponibles.",
  errRangeUnavailable: "El periodo seleccionado incluye fechas no disponibles.",
  errNeedName: "Introduce tu nombre.",
  errNeedAcceptances: "Marca las tres casillas antes de continuar.",
  errReviewFields: "Revisa los campos señalados antes de continuar.",
  announceArrival: "Fecha de entrada seleccionada.",
  announceDeparture: "Fecha de salida seleccionada.",
  announceCleared: "Selección de fechas eliminada.",
  announceInvalidRange:
    "El periodo incluye fechas no disponibles. Selección reiniciada.",
  languageLabel: "Seleccionar idioma",
  weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  metaTitle: "Parking privado en el centro de Guardamar | Disponibilidad",
  metaDescription:
    "Consulta la disponibilidad de una plaza de garaje privada en el centro de Guardamar del Segura y envía tu solicitud por WhatsApp.",
};

const en: ParkingCopy = {
  brand: "Parking Guardamar Centro",
  title: "Private parking in central Guardamar",
  intro: "Check availability and request your dates.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  heroAlt: "Private parking space in central Guardamar",
  pricesTitle: "Prices",
  pricesSupport: "Select your dates to check the rate.",
  pricesDisclaimer: "Final price subject to confirmation.",
  priceColSeason: "Season",
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
  priceUnavailableLabel: "Not available",
  availabilityTitle: "Select your dates",
  availabilityHint:
    "Select your arrival date, followed by your departure date.",
  availabilityHintDeparture: "Now select your departure date.",
  selectedDatesTitle: "Selected dates",
  legend: "Legend",
  available: "Available",
  unavailable: "Unavailable",
  past: "Past",
  selected: "Selected",
  prevMonths: "Previous months",
  nextMonths: "Next months",
  clearDates: "Clear dates",
  changeDates: "Change dates",
  labelArrival: "Arrival",
  labelDeparture: "Departure",
  labelDuration: "Duration",
  duration: (n) => `${n} ${n === 1 ? "day" : "days"}`,
  formTitle: "Enquiry details",
  name: "Name",
  registration: "Registration",
  vehicle: "Vehicle model",
  comments: "Comments",
  namePlaceholder: "Your name",
  registrationPlaceholder: "Optional",
  vehiclePlaceholder: "Optional",
  commentsPlaceholder: "Arrival time, questions…",
  accessImportant:
    "Important: the maximum permitted vehicle height is 1.79 m.",
  bookingDisclaimer:
    "Sending this enquiry does not confirm the booking. I will reply through WhatsApp to confirm availability, the price and payment.",
  privacyNote:
    "The information entered will only be used to respond to this enquiry through WhatsApp.",
  whatsappCta: "Enquire through WhatsApp",
  whatsappPreparing: "Preparing enquiry…",
  supabaseHint:
    "Calendar in local mode: Supabase is not configured. All future dates show as available until the database is connected.",
  loadError: "Could not load availability. Please try again later.",
  errNeedArrival: "Select an arrival date.",
  errNeedDeparture: "Select a departure date.",
  errDepartureAfter: "The departure date must be after the arrival date.",
  errUnavailable: "The selected period includes unavailable dates.",
  errRangeUnavailable: "The selected period includes unavailable dates.",
  errNeedName: "Enter your name.",
  errNeedAcceptances: "Tick all three boxes before continuing.",
  errReviewFields: "Check the highlighted fields before continuing.",
  announceArrival: "Arrival date selected.",
  announceDeparture: "Departure date selected.",
  announceCleared: "Date selection cleared.",
  announceInvalidRange:
    "The period includes unavailable dates. Selection restarted.",
  languageLabel: "Select language",
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  metaTitle: "Private parking in central Guardamar | Availability",
  metaDescription:
    "Check the availability of a private parking space in central Guardamar del Segura and send your enquiry through WhatsApp.",
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

/** Concise UI dates, e.g. "25 jul 2026" / "25 Jul 2026". */
export function formatShortParkingDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const formatted = date.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatted.replace(/\./g, "").replace(/\s+/g, " ").trim();
}

export function formatMonthLabel(date: Date, locale: Locale): string {
  const month = date.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    month: "long",
  });
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function formatMonthWithYear(date: Date, locale: Locale): string {
  const month = formatMonthLabel(date, locale);
  const year = date.getFullYear();
  return locale === "es" ? `${month} de ${year}` : `${month} ${year}`;
}

/** Nav title for one or more visible months, always including year. */
export function formatMonthRangeLabel(
  start: Date,
  end: Date,
  locale: Locale
): string {
  const startY = start.getFullYear();
  const endY = end.getFullYear();
  const startM = formatMonthLabel(start, locale);
  const endM = formatMonthLabel(end, locale);

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return formatMonthWithYear(start, locale);
  }

  if (startY === endY) {
    if (locale === "es") {
      return `${startM}–${endM.toLowerCase()} de ${startY}`;
    }
    return `${startM}–${endM} ${startY}`;
  }

  if (locale === "es") {
    return `${startM} de ${startY}–${endM.toLowerCase()} de ${endY}`;
  }
  return `${startM} ${startY}–${endM} ${endY}`;
}

export const PRICE_DASH = DASH;
