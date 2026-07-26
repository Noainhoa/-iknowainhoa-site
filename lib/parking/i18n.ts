import type { Locale } from "@/lib/i18n/shared";

export type ParkingPriceRow = {
  period: string;
  day: string;
  week: string;
  month: string;
};

export type ParkingCopy = {
  brand: string;
  title: string;
  intro: string;
  locationLine1: string;
  locationLine2: string;
  directionsLabel: string;
  heroAlt: string;
  spaceFact: string;
  galleryLabel: string;
  photoAlts: [string, string, string];
  pricesDisclaimer: string;
  priceColSeason: string;
  priceColDay: string;
  priceColWeek: string;
  priceColMonth: string;
  priceRows: ParkingPriceRow[];
  priceUnavailableLabel: string;
  availabilityTitle: string;
  availabilityHintDeparture: string;
  selectedDatesTitle: string;
  periodsTitle: string;
  addPeriod: string;
  removePeriod: string;
  multiModeLegend: string;
  multiModeOr: string;
  multiModeAnd: string;
  labelEstimate: string;
  labelTotalEstimate: string;
  labelTotalDuration: string;
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
  privacyPolicyAcceptBefore: string;
  privacyPolicyLinkLabel: string;
  privacyPolicyAcceptAfter: string;
  footerPrivacyLabel: string;
  whatsappCta: string;
  whatsappPreparing: string;
  whatsappOpenedTitle: string;
  whatsappOpenedBody: string;
  whatsappConfirmSent: string;
  whatsappOpenAgain: string;
  whatsappEditEnquiry: string;
  whatsappSentTitle: string;
  whatsappSentBody: string;
  supabaseHint: string;
  loadError: string;
  errNeedArrival: string;
  errNeedDeparture: string;
  errDepartureAfter: string;
  errUnavailable: string;
  errRangeUnavailable: string;
  errNeedName: string;
  errNeedPeriod: string;
  errMaxPeriods: string;
  errPeriodsOverlap: string;
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
  title: "Parking privado en Guardamar",
  intro:
    "Plaza de garaje cubierta en Carrer de Jorge Juan. Ideal para agosto y el resto del año.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  directionsLabel: "Cómo llegar en Google Maps",
  heroAlt:
    "Plaza de garaje privada cubierta en el centro de Guardamar del Segura",
  spaceFact: "Garaje cubierto · 4,90 m × 2,40 m",
  galleryLabel: "Fotos de la plaza de garaje",
  photoAlts: [
    "Plaza de garaje privada cubierta en Guardamar del Segura, 240 cm de ancho y 490 cm de largo",
    "Vista frontal de la plaza de parking en garaje cerrado, centro de Guardamar",
    "Plaza de aparcamiento privada con armarios en garaje cubierto en Guardamar",
  ],
  pricesDisclaimer: "Precio final sujeto a confirmación.",
  priceColSeason: "Tarifas por temporada",
  priceColDay: "Día",
  priceColWeek: "Semana",
  priceColMonth: "Mes",
  priceRows: [
    {
      period: "Junio–agosto",
      day: "€10",
      week: "€70",
      month: DASH,
    },
    {
      period: "Septiembre",
      day: DASH,
      week: "€50",
      month: DASH,
    },
    {
      period: "Octubre–mayo",
      day: DASH,
      week: DASH,
      month: "€75",
    },
  ],
  priceUnavailableLabel: "No disponible",
  availabilityTitle: "Selecciona tus fechas",
  availabilityHintDeparture: "Ahora selecciona la fecha de salida.",
  selectedDatesTitle: "Fechas seleccionadas",
  periodsTitle: "Periodos de la solicitud",
  addPeriod: "Añadir estas fechas",
  removePeriod: "Quitar periodo",
  multiModeLegend: "¿Cómo quieres consultar estas fechas?",
  multiModeOr: "Cualquiera de estas opciones (alternativas)",
  multiModeAnd: "Necesito todas estas estancias",
  labelEstimate: "Estimación",
  labelTotalEstimate: "Estimación total",
  labelTotalDuration: "Total",
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
  accessImportant: "Máxima altura de acceso: 1,79 m.",
  bookingDisclaimer: "Enviar la solicitud no confirma la reserva.",
  privacyNote:
    "Los datos introducidos se utilizarán únicamente para responder a esta solicitud por WhatsApp.",
  privacyPolicyAcceptBefore: "He leído y acepto la ",
  privacyPolicyLinkLabel: "Política de Privacidad",
  privacyPolicyAcceptAfter: ".",
  footerPrivacyLabel: "Política de Privacidad",
  whatsappCta: "Solicitar por WhatsApp",
  whatsappPreparing: "Preparando solicitud…",
  whatsappOpenedTitle: "WhatsApp abierto",
  whatsappOpenedBody:
    "Envía el mensaje en WhatsApp. Cuando lo hayas enviado, confírmalo aquí.",
  whatsappConfirmSent: "Sí, ya lo he enviado",
  whatsappOpenAgain: "Abrir WhatsApp otra vez",
  whatsappEditEnquiry: "Editar solicitud",
  whatsappSentTitle: "Mensaje enviado",
  whatsappSentBody:
    "Gracias. Te responderé por WhatsApp para confirmar la disponibilidad, el precio y el pago.",
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
  errNeedPeriod: "Añade al menos un periodo de fechas.",
  errMaxPeriods: "Puedes añadir hasta 3 periodos.",
  errPeriodsOverlap: "Los periodos no pueden solaparse.",
  errNeedAcceptances: "Marca las cuatro casillas antes de continuar.",
  errReviewFields: "Revisa los campos señalados antes de continuar.",
  announceArrival: "Fecha de entrada seleccionada.",
  announceDeparture: "Fecha de salida seleccionada.",
  announceCleared: "Selección de fechas eliminada.",
  announceInvalidRange:
    "El periodo incluye fechas no disponibles. Selección reiniciada.",
  languageLabel: "Seleccionar idioma",
  weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  metaTitle:
    "Parking Guardamar agosto | Plaza garaje centro Guardamar del Segura",
  metaDescription:
    "Alquila plaza de garaje privada y cubierta en el centro de Guardamar del Segura (Jorge Juan 13). 240×490 cm. Ideal agosto y verano. Consulta disponibilidad.",
};

const en: ParkingCopy = {
  brand: "Parking Guardamar Centro",
  title: "Private parking in Guardamar",
  intro:
    "Covered private garage space on Carrer de Jorge Juan. Ideal for August and the rest of the year.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  directionsLabel: "Directions in Google Maps",
  heroAlt: "Covered private parking space in central Guardamar del Segura",
  spaceFact: "Covered garage · 4.90 m × 2.40 m",
  galleryLabel: "Photos of the parking space",
  photoAlts: [
    "Covered private parking bay in Guardamar del Segura, 240 cm wide by 490 cm long",
    "Front view of the enclosed garage parking space in central Guardamar",
    "Private parking space with cabinets in a covered garage in Guardamar",
  ],
  pricesDisclaimer: "Final price subject to confirmation.",
  priceColSeason: "Seasonal rates",
  priceColDay: "Day",
  priceColWeek: "Week",
  priceColMonth: "Month",
  priceRows: [
    {
      period: "June–August",
      day: "€10",
      week: "€70",
      month: DASH,
    },
    {
      period: "September",
      day: DASH,
      week: "€50",
      month: DASH,
    },
    {
      period: "October–May",
      day: DASH,
      week: DASH,
      month: "€75",
    },
  ],
  priceUnavailableLabel: "Not available",
  availabilityTitle: "Select your dates",
  availabilityHintDeparture: "Now select your departure date.",
  selectedDatesTitle: "Selected dates",
  periodsTitle: "Enquiry periods",
  addPeriod: "Add these dates",
  removePeriod: "Remove period",
  multiModeLegend: "How should these dates be checked?",
  multiModeOr: "Any of these options (alternatives)",
  multiModeAnd: "I need all of these stays",
  labelEstimate: "Estimate",
  labelTotalEstimate: "Total estimate",
  labelTotalDuration: "Total",
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
  accessImportant: "Maximum access height: 1.79 m.",
  bookingDisclaimer: "Sending this enquiry does not confirm the booking.",
  privacyNote:
    "The information entered will only be used to respond to this enquiry through WhatsApp.",
  privacyPolicyAcceptBefore: "I have read and accept the ",
  privacyPolicyLinkLabel: "Privacy Policy",
  privacyPolicyAcceptAfter: ".",
  footerPrivacyLabel: "Privacy Policy",
  whatsappCta: "Enquire through WhatsApp",
  whatsappPreparing: "Preparing enquiry…",
  whatsappOpenedTitle: "WhatsApp opened",
  whatsappOpenedBody:
    "Send the message in WhatsApp. When you have sent it, confirm here.",
  whatsappConfirmSent: "Yes, I sent it",
  whatsappOpenAgain: "Open WhatsApp again",
  whatsappEditEnquiry: "Edit enquiry",
  whatsappSentTitle: "Message sent",
  whatsappSentBody:
    "Thank you. I will reply through WhatsApp to confirm availability, the price and payment.",
  supabaseHint:
    "Calendar in local mode: Supabase is not configured. All future dates show as available until the database is connected.",
  loadError: "Could not load availability. Please try again later.",
  errNeedArrival: "Select an arrival date.",
  errNeedDeparture: "Select a departure date.",
  errDepartureAfter: "The departure date must be after the arrival date.",
  errUnavailable: "The selected period includes unavailable dates.",
  errRangeUnavailable: "The selected period includes unavailable dates.",
  errNeedName: "Enter your name.",
  errNeedPeriod: "Add at least one date period.",
  errMaxPeriods: "You can add up to 3 periods.",
  errPeriodsOverlap: "Periods cannot overlap.",
  errNeedAcceptances: "Tick all four boxes before continuing.",
  errReviewFields: "Check the highlighted fields before continuing.",
  announceArrival: "Arrival date selected.",
  announceDeparture: "Departure date selected.",
  announceCleared: "Date selection cleared.",
  announceInvalidRange:
    "The period includes unavailable dates. Selection restarted.",
  languageLabel: "Select language",
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  metaTitle:
    "August parking Guardamar | Private garage space Guardamar del Segura",
  metaDescription:
    "Rent a private covered garage space in central Guardamar del Segura (Jorge Juan 13). 240×490 cm. Ideal for August and summer. Check availability.",
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
  return `${month} ${year}`;
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
    const endLabel = locale === "es" ? endM.toLowerCase() : endM;
    return `${startM}–${endLabel} ${startY}`;
  }

  const endLabel = locale === "es" ? endM.toLowerCase() : endM;
  return `${startM} ${startY}–${endLabel} ${endY}`;
}

export const PRICE_DASH = DASH;
