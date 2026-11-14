import type { Locale } from "@/lib/i18n/shared";
import { localeTag } from "@/lib/i18n/shared";
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
  heroAlt: string;
  spaceFact: string;
  galleryLabel: string;
  photoAlts: [string, string, string];
  priceColSeason: string;
  priceColDay: string;
  priceColWeek: string;
  priceColMonth: string;
  priceRows: ParkingPriceRow[];
  pricesDisclaimer: string;
  priceUnavailableLabel: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  aboutTitle: string;
  aboutItems: string[];
  locationSeo: string;
  faqTitle: string;
  faqItems: ParkingFaqItem[];
  availabilityTitle: string;
  /** Short label on the next-available ribbon (e.g. NOTICE). */
  nextAvailableTag: string;
  /** Shown only when the next free day is after today. */
  nextAvailableNotice: (formattedDate: string) => string;
  /** Accessible label for the clickable next-available ribbon. */
  nextAvailableNoticeAria: (formattedDate: string) => string;
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
  conditionsNoticeHold: string;
  conditionsNoticeVehicle: string;
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
  loadingAvailability: string;
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
    "Plaza de garaje cubierta y privada en Carrer de Jorge Juan, 13 (Guardamar del Segura). Consulta disponibilidad por días, semanas o meses según la temporada.",
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
  priceColSeason: "Tarifas por temporada",
  priceColDay: "Día",
  priceColWeek: "Semana",
  priceColMonth: "Mes",
  pricePeriodLabels: ["Junio–agosto", "Septiembre", "Octubre–mayo"],
  pricesDisclaimer:
    "Las tarifas dependen de la temporada. La estimación es orientativa; el precio final se confirma por WhatsApp.",
  priceUnavailableLabel: "No disponible",
  breadcrumbHome: "Inicio",
  breadcrumbCurrent: "Parking en Guardamar",
  aboutTitle: "Sobre esta plaza",
  aboutItems: [
    "Una plaza privada en garaje cubierto",
    "Medidas: 4,90 m de largo × 2,40 m de ancho",
    "Altura máxima de acceso: 1,79 m",
    "Dirección: Carrer de Jorge Juan, 13, Guardamar del Segura (03140)",
    "Disponibilidad por días, semanas o meses según temporada",
  ],
  locationSeo:
    "La plaza está en el centro de Guardamar del Segura, en Carrer de Jorge Juan, 13. Ideal si buscas aparcamiento privado cerca del casco urbano sin depender del parking de calle.",
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
        "Solo si cabe en 4,90 × 2,40 m y no supera 1,79 m de altura de acceso. No es un parking público ni un aparcamiento de varios vehículos.",
    },
  ],
  availabilityTitle: "Selecciona tus fechas",
  nextAvailableTag: "AVISO",
  nextAvailableNotice: (formattedDate) =>
    `Próxima disponibilidad: ${formattedDate}`,
  nextAvailableNoticeAria: (formattedDate) =>
    `Ir a la próxima disponibilidad (${formattedDate}) y usarla como fecha de entrada`,
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
  conditionsNoticeHold:
    "La solicitud no bloquea las fechas. La reserva se confirma tras aceptar las condiciones y realizar el pago.",
  conditionsNoticeVehicle:
    "Plaza para turismos convencionales. Altura máxima de acceso: 1,79 m.",
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
  whatsappTonightLabel: "¿Esta noche?",
  whatsappTonightAria: "WhatsApp: preguntar por esta noche",
  whatsappTonightMessage:
    "Hola, ¿está libre la plaza esta noche? (llegada hoy)",
  supabaseHint:
    "Calendario en modo local: falta configurar Supabase. Todas las fechas futuras aparecen como disponibles hasta que se conecte la base de datos.",
  loadingAvailability: "Cargando disponibilidad…",
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
  metaTitle: "Parking en Guardamar Centro por Días | Plaza Privada",
  metaDescription:
    "Alquila una plaza de garaje privada y cubierta en el centro de Guardamar del Segura (Jorge Juan 13). 4,90×2,40 m · acceso máx. 1,79 m. Tarifas por temporada. Consulta disponibilidad y solicita por WhatsApp.",
};

const en: ParkingCopySource = {
  brand: "Parking Guardamar Centro",
  title: "Private parking in central Guardamar",
  intro:
    "Covered private garage space at Carrer de Jorge Juan, 13 (Guardamar del Segura). Check availability by day, week or month depending on the season.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  directionsLabel: "Directions in Google Maps",
  heroAlt: "Covered private parking space in central Guardamar del Segura",
  spaceFact: "Covered garage · 4.90 m × 2.40 m",
  galleryLabel: "Garage space photos",
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
  pricesDisclaimer:
    "Rates depend on the season. The estimate is indicative; the final price is confirmed on WhatsApp.",
  priceUnavailableLabel: "Not available",
  breadcrumbHome: "Home",
  breadcrumbCurrent: "Parking in Guardamar",
  aboutTitle: "About this space",
  aboutItems: [
    "One private bay in a covered garage",
    "Size: 4.90 m long × 2.40 m wide",
    "Maximum access height: 1.79 m",
    "Address: Carrer de Jorge Juan, 13, Guardamar del Segura (03140)",
    "Available by day, week or month depending on the season",
  ],
  locationSeo:
    "The space is in central Guardamar del Segura, at Carrer de Jorge Juan, 13. Useful if you want private parking near the town centre without relying on street parking.",
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
        "Only if it fits 4.90 × 2.40 m and does not exceed 1.79 m access height. This is not a public multi-space car park.",
    },
  ],
  availabilityTitle: "Select your dates",
  nextAvailableTag: "NOTICE",
  nextAvailableNotice: (formattedDate) => `Next available: ${formattedDate}`,
  nextAvailableNoticeAria: (formattedDate) =>
    `Go to next available date (${formattedDate}) and use it as arrival`,
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
  conditionsNoticeHold:
    "Sending an enquiry does not hold the dates. The booking is confirmed after accepting the conditions and completing payment.",
  conditionsNoticeVehicle:
    "Space for conventional passenger cars. Maximum access height: 1.79 m.",
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
  whatsappTonightLabel: "Tonight?",
  whatsappTonightAria: "WhatsApp: ask about tonight",
  whatsappTonightMessage:
    "Hi, is the parking space free tonight? (arrival today)",
  supabaseHint:
    "Calendar in local mode: Supabase is not configured. All future dates show as available until the database is connected.",
  loadingAvailability: "Loading availability…",
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
  metaTitle: "Private Parking in Guardamar Centre | Daily Rental",
  metaDescription:
    "Rent a private covered garage space in central Guardamar del Segura (Jorge Juan 13). 4.90×2.40 m · max access height 1.79 m. Seasonal rates. Check availability and enquire on WhatsApp.",
};

const fr: ParkingCopySource = {
  brand: "Parking Guardamar Centro",
  title: "Parking privé au centre de Guardamar",
  intro:
    "Place de garage privée et couverte au Carrer de Jorge Juan, 13 (Guardamar del Segura). Consultez la disponibilité à la journée, à la semaine ou au mois selon la saison.",
  locationLine1: "Carrer de Jorge Juan, 13",
  locationLine2: "Guardamar del Segura",
  directionsLabel: "Itinéraire sur Google Maps",
  heroAlt: "Place de parking privée couverte au centre de Guardamar del Segura",
  spaceFact: "Garage couvert · 4,90 m × 2,40 m",
  galleryLabel: "Photos de la place de garage",
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
  pricesDisclaimer:
    "Les tarifs dépendent de la saison. L’estimation est indicative ; le prix final est confirmé sur WhatsApp.",
  priceUnavailableLabel: "Non disponible",
  breadcrumbHome: "Accueil",
  breadcrumbCurrent: "Parking à Guardamar",
  aboutTitle: "À propos de cette place",
  aboutItems: [
    "Une place privée dans un garage couvert",
    "Dimensions : 4,90 m de long × 2,40 m de large",
    "Hauteur maximale d’accès : 1,79 m",
    "Adresse : Carrer de Jorge Juan, 13, Guardamar del Segura (03140)",
    "Disponible à la journée, à la semaine ou au mois selon la saison",
  ],
  locationSeo:
    "La place se trouve au centre de Guardamar del Segura, au Carrer de Jorge Juan, 13. Pratique si vous cherchez un parking privé près du centre-ville sans dépendre du stationnement de rue.",
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
        "Uniquement si elle tient dans 4,90 × 2,40 m et ne dépasse pas 1,79 m de hauteur d’accès. Ce n’est pas un parking public multi-places.",
    },
  ],
  availabilityTitle: "Choisissez vos dates",
  nextAvailableTag: "AVIS",
  nextAvailableNotice: (formattedDate) =>
    `Prochaine disponibilité : ${formattedDate}`,
  nextAvailableNoticeAria: (formattedDate) =>
    `Aller à la prochaine disponibilité (${formattedDate}) et l’utiliser comme date d’arrivée`,
  availabilityHintDeparture: "Sélectionnez maintenant la date de départ.",
  selectedDatesTitle: "Dates sélectionnées",
  periodsTitle: "Périodes de la demande",
  addPeriod: "Ajouter ces dates",
  removePeriod: "Retirer la période",
  multiModeLegend: "Comment souhaitez-vous vérifier ces dates ?",
  multiModeOr: "N’importe laquelle de ces options (alternatives)",
  multiModeAnd: "J’ai besoin de tous ces séjours",
  labelEstimate: "Estimation",
  labelTotalEstimate: "Estimation totale",
  labelTotalDuration: "Total",
  legend: "Légende",
  available: "Disponible",
  unavailable: "Non disponible",
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
  registrationPlaceholder: "Facultatif",
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
  conditionsNoticeHold:
    "La demande ne bloque pas les dates. La réservation est confirmée après acceptation des conditions et paiement.",
  conditionsNoticeVehicle:
    "Place destinée aux voitures particulières conventionnelles. Hauteur maximale d’accès : 1,79 m.",
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
  whatsappTonightLabel: "Ce soir ?",
  whatsappTonightAria: "WhatsApp : demander pour ce soir",
  whatsappTonightMessage:
    "Bonjour, la place est-elle libre ce soir ? (arrivée aujourd’hui)",
  supabaseHint:
    "Calendrier en mode local : Supabase n’est pas configuré. Toutes les dates futures apparaissent comme disponibles jusqu’à la connexion à la base de données.",
  loadingAvailability: "Chargement de la disponibilité…",
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
  weekdays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  metaTitle: "Parking privé au centre de Guardamar | Location",
  metaDescription:
    "Louez une place de garage privée et couverte au centre de Guardamar del Segura (Jorge Juan 13). 4,90×2,40 m · hauteur d’accès max. 1,79 m. Tarifs saisonniers. Consultez la disponibilité et demandez via WhatsApp.",
};

const copyByLocale: Record<Locale, ParkingCopySource> = { es, en, fr };

export function getParkingCopy(
  locale: Locale,
  rates?: ParkingRatesMap
): ParkingCopy {
  const source = copyByLocale[locale];
  const { pricePeriodLabels, ...rest } = source;
  return {
    ...rest,
    priceRows: localizedPriceRows(pricePeriodLabels, rates),
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
  const startY = start.getFullYear();
  const endY = end.getFullYear();
  const startM = formatMonthLabel(start, locale);
  const endM = formatMonthLabel(end, locale);

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return formatMonthWithYear(start, locale);
  }

  if (startY === endY) {
    const endLabel = locale === "en" ? endM : endM.toLowerCase();
    return `${startM}–${endLabel} ${startY}`;
  }

  const endLabel = locale === "en" ? endM : endM.toLowerCase();
  return `${startM} ${startY}–${endLabel} ${endY}`;
}

export { PRICE_DASH };
