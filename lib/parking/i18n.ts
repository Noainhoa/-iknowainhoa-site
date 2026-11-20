import type { Locale } from "@/lib/i18n/shared";
import { localeTag } from "@/lib/i18n/shared";
import {
  parkingAccessHeightLabel,
  parkingBaySizeLabel,
} from "@/lib/parking/constants";
import {
  localizedPriceRows,
  PRICE_DASH,
  type ParkingPriceRow,
  type ParkingRatesMap,
} from "@/lib/parking/pricing";

export type { ParkingPriceRow };

export type ParkingFaqItem = {
  question: string;
  answer: string;
};

export type ParkingCopy = {
  brand: string;
  title: string;
  intro: string;
  locationLine1: string;
  locationLine2: string;
  directionsLabel: string;
  googleRatingLabel: string;
  googleRatingAria: string;
  googleOnMapsLabel: string;
  googlePrevReviewAria: string;
  googleNextReviewAria: string;
  /** Relatable fitted-vehicle note shown near Google reviews (no personal data). */
  fittedVehicleNoteBefore: string;
  fittedVehicleName: string;
  fittedVehicleNoteAfter: string;
  fittedVehiclePreviewAria: string;
  heroAlt: string;
  spaceFact: string;
  galleryLabel: string;
  galleryDimsToggleAria: string;
  galleryOpenAria: string;
  galleryCloseAria: string;
  galleryPrevAria: string;
  galleryNextAria: string;
  photoAlts: [string, string, string];
  priceColSeason: string;
  priceColDay: string;
  priceColWeek: string;
  priceColMonth: string;
  priceRows: ParkingPriceRow[];
  priceUnavailableLabel: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  aboutTitle: string;
  aboutItems: string[];
  faqTitle: string;
  faqItems: ParkingFaqItem[];
  availabilityTitle: string;
  /** Short label on the next-available ribbon (e.g. NOTICE). */
  nextAvailableTag: string;
  /** Shown only when the next free day is after today. */
  nextAvailableNotice: (formattedDate: string) => string;
  /** Accessible label for the clickable next-available ribbon. */
  nextAvailableNoticeAria: (formattedDate: string) => string;
  selectedDatesTitle: string;
  periodsTitle: string;
  addPeriod: string;
  removePeriod: string;
  multiModeLegend: string;
  multiModeOr: string;
  multiModeAnd: string;
  /** CTA after a period is selected — scrolls to the enquiry form. */
  continueToForm: string;
  /** Hint under the first period: more stays via calendar selection. */
  moreDatesHint: string;
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
  contactTitle: string;
  contactWhatsApp: string;
  contactDatesCta: string;
  contactPlace: string;
  contactWhatsAppMessage: string;
  feedbackSummary: string;
  feedbackMoodLabel: string;
  feedbackMoodUp: string;
  feedbackMoodDown: string;
  feedbackMessageLabel: string;
  feedbackMessagePlaceholder: string;
  feedbackReferenceLabel: string;
  feedbackReferencePlaceholder: string;
  feedbackSubmit: string;
  feedbackSubmitting: string;
  feedbackSuccess: string;
  feedbackError: string;
  feedbackPrivacyBefore: string;
  feedbackPrivacyLink: string;
  feedbackPrivacyAfter: string;
  feedbackContactAsk: string;
  feedbackContactName: string;
  feedbackContactNamePlaceholder: string;
  feedbackContactEmail: string;
  feedbackContactEmailPlaceholder: string;
  feedbackContactPhone: string;
  feedbackContactPhonePlaceholder: string;
  feedbackContactNeed: string;
  conditionsLinkLabel: string;
  whatsappCta: string;
  whatsappPreparing: string;
  whatsappOpenedTitle: string;
  whatsappOpenedBody: string;
  whatsappConfirmSent: string;
  whatsappOpenAgain: string;
  whatsappEditEnquiry: string;
  whatsappSentTitle: string;
  whatsappSentBody: string;
  whatsappTonightLabel: string;
  whatsappTonightAria: string;
  whatsappTonightMessage: string;
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

type ParkingCopySource = Omit<ParkingCopy, "priceRows"> & {
  pricePeriodLabels: [string, string, string];
};

const es: ParkingCopySource = {
  brand: "Parking Guardamar Centro",
  title: "Parking privado en el centro de Guardamar",
  intro:
    "Plaza privada cubierta en el centro de Guardamar del Segura: útil cerca del casco urbano sin depender del parking de calle.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  directionsLabel: "Cómo llegar en Google Maps",
  googleRatingLabel: "4,5",
  googleRatingAria: "4,5 de 5 en Google · 2 reseñas",
  googleOnMapsLabel: "en reseñas de Google",
  googlePrevReviewAria: "Reseña anterior",
  googleNextReviewAria: "Reseña siguiente",
  fittedVehicleNoteBefore: "Por referencia, un ",
  fittedVehicleName: "Mercedes Classe 580",
  fittedVehicleNoteAfter:
    " ha aparcado aquí. No furgonetas: altura máxima de acceso 1,79 m.",
  fittedVehiclePreviewAria: "Ver foto de un Mercedes Classe 580",
  heroAlt:
    "Plaza de garaje privada cubierta en el centro de Guardamar del Segura",
  spaceFact: "Garaje cubierto · 4,90 m × 2,40 m",
  galleryLabel: "Fotos de la plaza de garaje",
  galleryDimsToggleAria: "Mostrar u ocultar medidas de la plaza",
  galleryOpenAria: "Ampliar foto",
  galleryCloseAria: "Cerrar",
  galleryPrevAria: "Foto anterior",
  galleryNextAria: "Foto siguiente",
  photoAlts: [
    "Plaza de garaje privada cubierta en Guardamar del Segura, 240 cm de ancho y 490 cm de largo",
    "Vista frontal de la plaza de parking en garaje cerrado, centro de Guardamar",
    "Plaza de aparcamiento privada con armarios en garaje cubierto en Guardamar",
  ],
  priceColSeason: "Tarifas por temporada",
  priceColDay: "Día",
  priceColWeek: "Semana",
  priceColMonth: "Mes",
  pricePeriodLabels: ["Junio–agosto", "Septiembre", "Octubre–mayo"],
  priceUnavailableLabel: "No disponible",
  breadcrumbHome: "Inicio",
  breadcrumbCurrent: "Parking en Guardamar",
  aboutTitle: "Sobre esta plaza",
  aboutItems: [
    "Carrer de Jorge Juan, 13 (03140)",
    "4,90 m × 2,40 m · altura máxima de acceso 1,79 m",
    "Por días, semanas o meses según temporada",
  ],
  faqTitle: "Preguntas frecuentes",
  faqItems: [
    {
      question: "¿Cómo se solicita la plaza?",
      answer:
        "Elige las fechas en el calendario, completa el formulario y envía la solicitud por WhatsApp. La reserva no queda confirmada hasta recibir respuesta.",
    },
    {
      question: "¿Cuál es la altura máxima de acceso?",
      answer:
        "La altura máxima de acceso al garaje es de 1,79 m. Comprueba la altura de tu vehículo antes de solicitar.",
    },
    {
      question: "¿Qué tamaño tiene la plaza?",
      answer:
        "Es una plaza cubierta de aproximadamente 4,90 m de largo por 2,40 m de ancho.",
    },
    {
      question: "¿Cómo funcionan las tarifas?",
      answer:
        "En junio–agosto hay tarifa por día (€10) y por semana (€70). En septiembre, por semana (€50). De octubre a mayo, por mes (€75). La estimación del calendario es orientativa.",
    },
    {
      question: "¿Puedo aparcar cualquier coche?",
      answer:
        "Solo si cabe en 4,90 × 2,40 m y no supera 1,79 m de altura de acceso. Por referencia, un Mercedes Classe 580 ha aparcado aquí; las furgonetas altas no. No es un parking público ni un aparcamiento de varios vehículos.",
    },
  ],
  availabilityTitle: "Disponibilidad",
  nextAvailableTag: "AVISO",
  nextAvailableNotice: (formattedDate) =>
    `Libre a partir de ${formattedDate}`,
  nextAvailableNoticeAria: (formattedDate) =>
    `Ir a la primera fecha libre (${formattedDate}) y usarla como fecha de entrada`,
  selectedDatesTitle: "Fechas seleccionadas",
  periodsTitle: "Periodos de la solicitud",
  addPeriod: "Añadir estas fechas",
  removePeriod: "Quitar periodo",
  multiModeLegend: "¿Cómo quieres consultar estas fechas?",
  multiModeOr: "Cualquiera de estas opciones (alternativas)",
  multiModeAnd: "Necesito todas estas estancias",
  continueToForm: "Siguiente",
  moreDatesHint:
    "Si quieres consultar más fechas a la vez, añádelas seleccionándolas en el calendario.",
  labelEstimate: "Estimación",
  labelTotalEstimate: "Estimación total",
  labelTotalDuration: "Total",
  legend: "Leyenda",
  available: "Libre",
  unavailable: "Ocupado",
  past: "Pasado",
  selected: "Seleccionado",
  prevMonths: "Meses anteriores",
  nextMonths: "Meses siguientes",
  clearDates: "Borrar fechas",
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
  registrationPlaceholder: "1234 ABC",
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
  contactTitle: "Llámanos: respondo yo personalmente.",
  contactWhatsApp: "Escribir por WhatsApp",
  contactDatesCta: "Consultar fechas",
  contactPlace: "Parking Guardamar Centro",
  contactWhatsAppMessage:
    "Hola, me interesa la plaza de parking en Guardamar Centro.",
  feedbackSummary: "Envíanos tu opinión, nos interesa.",
  feedbackMoodLabel: "¿Cómo fue tu experiencia?",
  feedbackMoodUp: "Pulgar arriba",
  feedbackMoodDown: "Pulgar abajo",
  feedbackMessageLabel: "Tu mensaje",
  feedbackMessagePlaceholder: "Dinos más sobre tu experiencia…",
  feedbackReferenceLabel: "Matrícula (opcional)",
  feedbackReferencePlaceholder: "1234 ABC",
  feedbackSubmit: "Enviar feedback",
  feedbackSubmitting: "Enviando…",
  feedbackSuccess: "Gracias. He recibido tu feedback.",
  feedbackError: "No se ha podido enviar. Inténtalo de nuevo o escríbeme por WhatsApp.",
  feedbackPrivacyBefore:
    "Esto es solo para uso interno. Si quieres dejar una reseña en Google, ",
  feedbackPrivacyLink: "sigue este enlace",
  feedbackPrivacyAfter: ".",
  feedbackContactAsk: "Sí, quiero que me contactéis sobre este feedback",
  feedbackContactName: "Nombre",
  feedbackContactNamePlaceholder: "Tu nombre",
  feedbackContactEmail: "Email",
  feedbackContactEmailPlaceholder: "tu@email.com",
  feedbackContactPhone: "Teléfono",
  feedbackContactPhonePlaceholder: "600 000 000",
  feedbackContactNeed: "Deja un email o un teléfono para poder contactarte.",
  conditionsLinkLabel: "Ver condiciones de reserva",
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
  whatsappTonightLabel: "¿Parking esta noche?",
  whatsappTonightAria: "WhatsApp: preguntar si hay parking esta noche",
  whatsappTonightMessage:
    "Hola, ¿está libre la plaza esta noche? (llegada hoy)",
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
  weekdays: ["L", "M", "X", "J", "V", "S", "D"],
  metaTitle: "Parking en Guardamar Centro por Días | Plaza Privada",
  metaDescription:
    "Alquila una plaza de garaje privada y cubierta en el centro de Guardamar del Segura (Jorge Juan 13). 4,90×2,40 m · acceso máx. 1,79 m. Tarifas por temporada. Consulta disponibilidad y solicita por WhatsApp.",
};

const en: ParkingCopySource = {
  brand: "Parking Guardamar Centro",
  title: "Private parking in central Guardamar",
  intro:
    "Private covered garage in central Guardamar del Segura — useful near the town centre without relying on street parking.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  directionsLabel: "Directions in Google Maps",
  googleRatingLabel: "4.5",
  googleRatingAria: "4.5 out of 5 on Google · 2 reviews",
  googleOnMapsLabel: "on Google Reviews",
  googlePrevReviewAria: "Previous review",
  googleNextReviewAria: "Next review",
  fittedVehicleNoteBefore: "For reference, a ",
  fittedVehicleName: "Mercedes Classe 580",
  fittedVehicleNoteAfter:
    " has parked here. Not for vans: maximum access height 1.79 m.",
  fittedVehiclePreviewAria: "Show a photo of a Mercedes Classe 580",
  heroAlt: "Covered private parking space in central Guardamar del Segura",
  spaceFact: "Covered garage · 4.90 m × 2.40 m",
  galleryLabel: "Garage space photos",
  galleryDimsToggleAria: "Show or hide bay dimensions",
  galleryOpenAria: "Enlarge photo",
  galleryCloseAria: "Close",
  galleryPrevAria: "Previous photo",
  galleryNextAria: "Next photo",
  photoAlts: [
    "Private covered garage space in Guardamar del Segura, 240 cm wide and 490 cm long",
    "Front view of the private parking bay in a closed garage, Guardamar centre",
    "Private parking space with cupboards in a covered garage in Guardamar",
  ],
  priceColSeason: "Seasonal rates",
  priceColDay: "Day",
  priceColWeek: "Week",
  priceColMonth: "Month",
  pricePeriodLabels: ["June–August", "September", "October–May"],
  priceUnavailableLabel: "Not available",
  breadcrumbHome: "Home",
  breadcrumbCurrent: "Parking in Guardamar",
  aboutTitle: "About this space",
  aboutItems: [
    "Carrer de Jorge Juan, 13 (03140)",
    "4.90 m × 2.40 m · max access height 1.79 m",
    "By day, week or month depending on the season",
  ],
  faqTitle: "Frequently asked questions",
  faqItems: [
    {
      question: "How do I enquire about the space?",
      answer:
        "Select your dates on the calendar, fill in the form and send the enquiry through WhatsApp. The booking is not confirmed until you receive a reply.",
    },
    {
      question: "What is the maximum access height?",
      answer:
        "The maximum garage access height is 1.79 m. Check your vehicle height before enquiring.",
    },
    {
      question: "What size is the space?",
      answer:
        "It is a covered bay of approximately 4.90 m long by 2.40 m wide.",
    },
    {
      question: "How do rates work?",
      answer:
        "June–August: €10/day and €70/week. September: €50/week. October–May: €75/month. Calendar estimates are indicative only.",
    },
    {
      question: "Can any car park here?",
      answer:
        "Only if it fits 4.90 × 2.40 m and does not exceed 1.79 m access height. For reference, a Mercedes Classe 580 has parked here; tall vans have not. This is not a public multi-space car park.",
    },
  ],
  availabilityTitle: "Availability",
  nextAvailableTag: "NOTICE",
  nextAvailableNotice: (formattedDate) => `Free from ${formattedDate}`,
  nextAvailableNoticeAria: (formattedDate) =>
    `Go to the first free date (${formattedDate}) and use it as arrival`,
  selectedDatesTitle: "Selected dates",
  periodsTitle: "Enquiry periods",
  addPeriod: "Add these dates",
  removePeriod: "Remove period",
  multiModeLegend: "How should these dates be checked?",
  multiModeOr: "Any of these options (alternatives)",
  multiModeAnd: "I need all of these stays",
  continueToForm: "Next",
  moreDatesHint:
    "To check more dates at the same time, add them by selecting them on the calendar.",
  labelEstimate: "Estimate",
  labelTotalEstimate: "Total estimate",
  labelTotalDuration: "Total",
  legend: "Legend",
  available: "Free",
  unavailable: "Occupied",
  past: "Past",
  selected: "Selected",
  prevMonths: "Previous months",
  nextMonths: "Next months",
  clearDates: "Clear dates",
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
  registrationPlaceholder: "1234 ABC",
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
  contactTitle: "Call us, I answer personally.",
  contactWhatsApp: "Message on WhatsApp",
  contactDatesCta: "Check dates",
  contactPlace: "Parking Guardamar Centro",
  contactWhatsAppMessage:
    "Hi, I’m interested in the parking space in Guardamar Centro.",
  feedbackSummary: "Already used the space? Send private feedback",
  feedbackMoodLabel: "How was your experience?",
  feedbackMoodUp: "Thumbs up",
  feedbackMoodDown: "Thumbs down",
  feedbackMessageLabel: "Your message",
  feedbackMessagePlaceholder: "Tell us more about your experience…",
  feedbackReferenceLabel: "Registration plate (optional)",
  feedbackReferencePlaceholder: "1234 ABC",
  feedbackSubmit: "Send feedback",
  feedbackSubmitting: "Sending…",
  feedbackSuccess: "Thank you. I’ve received your feedback.",
  feedbackError: "Could not send. Try again or message me on WhatsApp.",
  feedbackPrivacyBefore:
    "This is for internal use only. If you would like to leave a Google review, ",
  feedbackPrivacyLink: "follow this link",
  feedbackPrivacyAfter: ".",
  feedbackContactAsk: "Yes, please contact me about this feedback",
  feedbackContactName: "Name",
  feedbackContactNamePlaceholder: "Your name",
  feedbackContactEmail: "Email",
  feedbackContactEmailPlaceholder: "you@email.com",
  feedbackContactPhone: "Phone",
  feedbackContactPhonePlaceholder: "600 000 000",
  feedbackContactNeed: "Leave an email or a phone number so I can contact you.",
  conditionsLinkLabel: "View booking conditions",
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
  whatsappTonightLabel: "Parking tonight?",
  whatsappTonightAria: "WhatsApp: ask if parking is free tonight",
  whatsappTonightMessage:
    "Hi, is the parking space free tonight? (arrival today)",
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
  weekdays: ["M", "T", "W", "T", "F", "S", "S"],
  metaTitle: "Private Parking in Guardamar Centre | Daily Rental",
  metaDescription:
    "Rent a private covered garage space in central Guardamar del Segura (Jorge Juan 13). 4.90×2.40 m · max access height 1.79 m. Seasonal rates. Check availability and enquire on WhatsApp.",
};

const fr: ParkingCopySource = {
  brand: "Parking Guardamar Centro",
  title: "Parking privé au centre de Guardamar",
  intro:
    "Place privée couverte au centre de Guardamar del Segura : pratique près du centre-ville sans dépendre du stationnement de rue.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  directionsLabel: "Itinéraire sur Google Maps",
  googleRatingLabel: "4,5",
  googleRatingAria: "4,5 sur 5 sur Google · 2 avis",
  googleOnMapsLabel: "sur les avis Google",
  googlePrevReviewAria: "Avis précédent",
  googleNextReviewAria: "Avis suivant",
  fittedVehicleNoteBefore: "Pour référence, une ",
  fittedVehicleName: "Mercedes Classe 580",
  fittedVehicleNoteAfter:
    " a déjà stationné ici. Pas pour les vans : hauteur d’accès max. 1,79 m.",
  fittedVehiclePreviewAria: "Voir une photo d’une Mercedes Classe 580",
  heroAlt: "Place de parking privée couverte au centre de Guardamar del Segura",
  spaceFact: "Garage couvert · 4,90 m × 2,40 m",
  galleryLabel: "Photos de la place de garage",
  galleryDimsToggleAria: "Afficher ou masquer les dimensions de la place",
  galleryOpenAria: "Agrandir la photo",
  galleryCloseAria: "Fermer",
  galleryPrevAria: "Photo précédente",
  galleryNextAria: "Photo suivante",
  photoAlts: [
    "Place de garage privée couverte à Guardamar del Segura, 240 cm de large et 490 cm de long",
    "Vue de face de la place de parking dans un garage fermé, centre de Guardamar",
    "Place de stationnement privée avec placards dans un garage couvert à Guardamar",
  ],
  priceColSeason: "Tarifs par saison",
  priceColDay: "Jour",
  priceColWeek: "Semaine",
  priceColMonth: "Mois",
  pricePeriodLabels: ["Juin–août", "Septembre", "Octobre–mai"],
  priceUnavailableLabel: "Non disponible",
  breadcrumbHome: "Accueil",
  breadcrumbCurrent: "Parking à Guardamar",
  aboutTitle: "À propos de cette place",
  aboutItems: [
    "Carrer de Jorge Juan, 13 (03140)",
    "4,90 m × 2,40 m · hauteur d’accès max. 1,79 m",
    "À la journée, à la semaine ou au mois selon la saison",
  ],
  faqTitle: "Questions fréquentes",
  faqItems: [
    {
      question: "Comment demander la place ?",
      answer:
        "Choisissez vos dates sur le calendrier, remplissez le formulaire et envoyez la demande via WhatsApp. La réservation n’est confirmée qu’après réponse.",
    },
    {
      question: "Quelle est la hauteur maximale d’accès ?",
      answer:
        "La hauteur maximale d’accès au garage est de 1,79 m. Vérifiez la hauteur de votre véhicule avant de demander.",
    },
    {
      question: "Quelle est la taille de la place ?",
      answer:
        "C’est une place couverte d’environ 4,90 m de long sur 2,40 m de large.",
    },
    {
      question: "Comment fonctionnent les tarifs ?",
      answer:
        "Juin–août : 10 €/jour et 70 €/semaine. Septembre : 50 €/semaine. Octobre–mai : 75 €/mois. Les estimations du calendrier sont indicatives.",
    },
    {
      question: "Puis-je garer n’importe quelle voiture ?",
      answer:
        "Uniquement si elle tient dans 4,90 × 2,40 m et ne dépasse pas 1,79 m de hauteur d’accès. Pour référence, une Mercedes Classe 580 a déjà stationné ici ; pas les vans hauts. Ce n’est pas un parking public multi-places.",
    },
  ],
  availabilityTitle: "Disponibilité",
  nextAvailableTag: "AVIS",
  nextAvailableNotice: (formattedDate) =>
    `Libre à partir du ${formattedDate}`,
  nextAvailableNoticeAria: (formattedDate) =>
    `Aller à la première date libre (${formattedDate}) et l’utiliser comme date d’arrivée`,
  selectedDatesTitle: "Dates sélectionnées",
  periodsTitle: "Périodes de la demande",
  addPeriod: "Ajouter ces dates",
  removePeriod: "Retirer la période",
  multiModeLegend: "Comment souhaitez-vous vérifier ces dates ?",
  multiModeOr: "N’importe laquelle de ces options (alternatives)",
  multiModeAnd: "J’ai besoin de tous ces séjours",
  continueToForm: "Suivant",
  moreDatesHint:
    "Pour consulter d’autres dates en même temps, ajoutez-les en les sélectionnant sur le calendrier.",
  labelEstimate: "Estimation",
  labelTotalEstimate: "Estimation totale",
  labelTotalDuration: "Total",
  legend: "Légende",
  available: "Libre",
  unavailable: "Occupé",
  past: "Passé",
  selected: "Sélectionné",
  prevMonths: "Mois précédents",
  nextMonths: "Mois suivants",
  clearDates: "Effacer les dates",
  labelArrival: "Arrivée",
  labelDeparture: "Départ",
  labelDuration: "Durée",
  duration: (n) => `${n} ${n === 1 ? "jour" : "jours"}`,
  formTitle: "Coordonnées pour la demande",
  name: "Nom",
  registration: "Immatriculation",
  vehicle: "Modèle",
  comments: "Commentaires",
  namePlaceholder: "Votre nom",
  registrationPlaceholder: "1234 ABC",
  vehiclePlaceholder: "Facultatif",
  commentsPlaceholder: "Heure d’arrivée, questions…",
  accessImportant: "Hauteur maximale d’accès : 1,79 m.",
  bookingDisclaimer: "Envoyer la demande ne confirme pas la réservation.",
  privacyNote:
    "Les données saisies seront utilisées uniquement pour répondre à cette demande via WhatsApp.",
  privacyPolicyAcceptBefore: "J’ai lu et j’accepte la ",
  privacyPolicyLinkLabel: "Politique de confidentialité",
  privacyPolicyAcceptAfter: ".",
  footerPrivacyLabel: "Politique de confidentialité",
  contactTitle: "Appelez-nous, je réponds personnellement.",
  contactWhatsApp: "Écrire sur WhatsApp",
  contactDatesCta: "Voir les dates",
  contactPlace: "Parking Guardamar Centro",
  contactWhatsAppMessage:
    "Bonjour, je suis intéressé(e) par la place de parking à Guardamar Centro.",
  feedbackSummary: "Déjà utilisé la place ? Envoyez un retour privé",
  feedbackMoodLabel: "Comment était votre expérience ?",
  feedbackMoodUp: "Pouce vers le haut",
  feedbackMoodDown: "Pouce vers le bas",
  feedbackMessageLabel: "Votre message",
  feedbackMessagePlaceholder: "Dites-nous en plus sur votre expérience…",
  feedbackReferenceLabel: "Immatriculation (facultatif)",
  feedbackReferencePlaceholder: "1234 ABC",
  feedbackSubmit: "Envoyer le retour",
  feedbackSubmitting: "Envoi…",
  feedbackSuccess: "Merci. J’ai bien reçu votre retour.",
  feedbackError: "Envoi impossible. Réessayez ou écrivez-moi sur WhatsApp.",
  feedbackPrivacyBefore:
    "Ceci est réservé à un usage interne. Si vous souhaitez laisser un avis Google, ",
  feedbackPrivacyLink: "suivez ce lien",
  feedbackPrivacyAfter: ".",
  feedbackContactAsk: "Oui, contactez-moi au sujet de ce retour",
  feedbackContactName: "Nom",
  feedbackContactNamePlaceholder: "Votre nom",
  feedbackContactEmail: "E-mail",
  feedbackContactEmailPlaceholder: "vous@email.com",
  feedbackContactPhone: "Téléphone",
  feedbackContactPhonePlaceholder: "600 000 000",
  feedbackContactNeed:
    "Indiquez un e-mail ou un téléphone pour que je puisse vous contacter.",
  conditionsLinkLabel: "Voir les conditions de réservation",
  whatsappCta: "Demander via WhatsApp",
  whatsappPreparing: "Préparation de la demande…",
  whatsappOpenedTitle: "WhatsApp ouvert",
  whatsappOpenedBody:
    "Envoyez le message dans WhatsApp. Quand c’est fait, confirmez ici.",
  whatsappConfirmSent: "Oui, je l’ai envoyé",
  whatsappOpenAgain: "Rouvrir WhatsApp",
  whatsappEditEnquiry: "Modifier la demande",
  whatsappSentTitle: "Message envoyé",
  whatsappSentBody:
    "Merci. Je vous répondrai sur WhatsApp pour confirmer la disponibilité, le prix et le paiement.",
  whatsappTonightLabel: "Parking ce soir ?",
  whatsappTonightAria: "WhatsApp : demander si le parking est libre ce soir",
  whatsappTonightMessage:
    "Bonjour, la place est-elle libre ce soir ? (arrivée aujourd’hui)",
  supabaseHint:
    "Calendrier en mode local : Supabase n’est pas configuré. Toutes les dates futures apparaissent comme disponibles jusqu’à la connexion à la base de données.",
  loadError:
    "Impossible de charger la disponibilité. Réessayez plus tard.",
  errNeedArrival: "Sélectionnez une date d’arrivée.",
  errNeedDeparture: "Sélectionnez une date de départ.",
  errDepartureAfter:
    "La date de départ doit être postérieure à la date d’arrivée.",
  errUnavailable: "La période sélectionnée inclut des dates non disponibles.",
  errRangeUnavailable: "La période sélectionnée inclut des dates non disponibles.",
  errNeedName: "Indiquez votre nom.",
  errNeedPeriod: "Ajoutez au moins une période de dates.",
  errMaxPeriods: "Vous pouvez ajouter jusqu’à 3 périodes.",
  errPeriodsOverlap: "Les périodes ne peuvent pas se chevaucher.",
  errNeedAcceptances: "Cochez les quatre cases avant de continuer.",
  errReviewFields: "Vérifiez les champs signalés avant de continuer.",
  announceArrival: "Date d’arrivée sélectionnée.",
  announceDeparture: "Date de départ sélectionnée.",
  announceCleared: "Sélection de dates effacée.",
  announceInvalidRange:
    "La période inclut des dates non disponibles. Sélection réinitialisée.",
  languageLabel: "Choisir la langue",
  weekdays: ["L", "M", "M", "J", "V", "S", "D"],
  metaTitle: "Parking privé au centre de Guardamar | Location",
  metaDescription:
    "Louez une place de garage privée et couverte au centre de Guardamar del Segura (Jorge Juan 13). 4,90×2,40 m · hauteur d’accès max. 1,79 m. Tarifs saisonniers. Consultez la disponibilité et demandez via WhatsApp.",
};

const copyByLocale: Record<Locale, ParkingCopySource> = { es, en, fr };

export function getParkingCopy(
  locale: Locale,
  rates?: ParkingRatesMap,
  periodLabels?: [string, string, string]
): ParkingCopy {
  const source = copyByLocale[locale];
  const { pricePeriodLabels, ...rest } = source;
  const height = parkingAccessHeightLabel(locale);
  const bay = parkingBaySizeLabel(locale);
  const spaceFact =
    locale === "es"
      ? `Garaje cubierto · ${bay}`
      : locale === "fr"
        ? `Garage couvert · ${bay}`
        : `Covered garage · ${bay}`;
  const accessImportant =
    locale === "es"
      ? `Máxima altura de acceso: ${height}.`
      : locale === "fr"
        ? `Hauteur maximale d’accès : ${height}.`
        : `Maximum access height: ${height}.`;
  return {
    ...rest,
    spaceFact,
    accessImportant,
    priceRows: localizedPriceRows(periodLabels ?? pricePeriodLabels, rates),
  };
}

export function formatParkingDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(localeTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Concise UI dates, e.g. "25 jul 2026" / "25 Jul 2026". */
export function formatShortParkingDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const formatted = date.toLocaleDateString(localeTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatted.replace(/\./g, "").replace(/\s+/g, " ").trim();
}

export function formatMonthLabel(date: Date, locale: Locale): string {
  const month = date.toLocaleDateString(localeTag(locale), {
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
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return formatMonthWithYear(start, locale);
  }

  const months: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Same year → "January, February, March 2027"
  // Cross year → "November, December 2026, January 2027"
  const chunks: string[] = [];
  let i = 0;
  let isFirstName = true;
  while (i < months.length) {
    const year = months[i].getFullYear();
    const names: string[] = [];
    while (i < months.length && months[i].getFullYear() === year) {
      const label = formatMonthLabel(months[i], locale);
      names.push(locale === "en" || isFirstName ? label : label.toLowerCase());
      isFirstName = false;
      i += 1;
    }
    chunks.push(`${names.join(", ")} ${year}`);
  }
  return chunks.join(", ");
}

export { PRICE_DASH };
