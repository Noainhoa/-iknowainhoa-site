import { TECH_BRAND } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";

export type TechCopy = {
  metaTitle: string;
  metaDescription: string;
  brandName: string;
  brandPlace: string;
  navHelp: string;
  navAbout: string;
  navPrices: string;
  navStories: string;
  navBook: string;
  navMenuOpen: string;
  navMenuClose: string;
  langLabel: string;
  kicker: string;
  headlineBefore: string;
  headlineEm: string;
  headlineAfter: string;
  lede: string;
  metaChips: string[];
  reserveCta: string;
  callCta: string;
  heroArtAlt: string;
  topicsKicker: string;
  topicsTitleBefore: string;
  topicsTitleEm: string;
  topics: { title: string; quote: string }[];
  aboutKicker: string;
  aboutTitleBefore: string;
  aboutTitleEm: string;
  aboutBody: string;
  aboutLanguages: string;
  aboutSign: string;
  portraitLabel: string;
  pricesKicker: string;
  pricesTitleBefore: string;
  pricesTitleEm: string;
  storiesKicker: string;
  storiesTitleBefore: string;
  storiesTitleEm: string;
  storiesLead: string;
  storiesEmpty: string;
  storiesFormTitle: string;
  storiesName: string;
  storiesPlace: string;
  storiesBody: string;
  storiesConsent: string;
  storiesSubmit: string;
  storiesThanks: string;
  storiesThanksBody: string;
  groupKicker: string;
  groupTitle: string;
  groupAmtNote: string;
  groupDuration: string;
  groupPoints: string[];
  individualKicker: string;
  individualTitle: string;
  individualAmtNote: string;
  individualDuration: string;
  individualShortDuration: string;
  individualPoints: string[];
  bookGroup: string;
  bookIndividual: string;
  stepsKicker: string;
  stepsTitleBefore: string;
  stepsTitleEm: string;
  steps: { title: string; body: string }[];
  preferCallBtn: string;
  englishTitle: string;
  englishTitleEm: string;
  englishBody: string;
  contactKicker: string;
  contactTitleBefore: string;
  contactTitleEm: string;
  contactSub: string;
  writeWhatsApp: string;
  placeFooter: string;
  barCall: string;
  barReserve: string;
  preferCall: string;
  talkTitle: string;
  talkBody: string;
  pay: string;
  placeTitle: string;
  placeBody: string;
  choose: string;
  groupOption: string;
  individualOption: string;
  individualShortOption: string;
  otherTime: string;
  otherTimeHelp: string;
  loading: string;
  /** Temporary network / backend failure while loading sessions. */
  loadError: string;
  /** API reachable, but no published times of this kind. */
  empty: string;
  /** Dev/local: booking backend not configured (HTTP 503). */
  notConfigured: string;
  calendarOff: string;
  nextGroupLabel: string;
  nextGroupEmpty: string;
  legendGroup: string;
  legendPrivate: string;
  legendFree: string;
  legendClosed: string;
  weekFull: string;
  joinGroup: string;
  createPrivate: string;
  createGroup: string;
  hourHint: string;
  copyWhatsApp: string;
  copyEmail: string;
  full: string;
  seatsOne: string;
  seatsMany: string;
  formTitle: string;
  requestTitle: string;
  contactName: string;
  attendeeName: string;
  forOther: string;
  sessionLanguageLabel: string;
  sessionLanguageHelp: string;
  sessionLanguageEs: string;
  sessionLanguageEn: string;
  phone: string;
  email: string;
  emailHint: string;
  question: string;
  questionHint: string;
  date: string;
  time: string;
  termsAcceptBefore: string;
  termsLinkLabel: string;
  termsAcceptAfter: string;
  submitBook: string;
  submitRequest: string;
  saving: string;
  errors: Record<string, string>;
  confirmedTitle: string;
  requestedTitle: string;
  reference: string;
  when: string;
  price: string;
  where: string;
  pendingPlace: string;
  keepScreen: string;
  cancelHelp: string;
  cancelLate: string;
  calendar: string;
  call: string;
  whatsapp: string;
  back: string;
  cancelTitle: string;
  cancelButton: string;
  cancelling: string;
  cancelled: string;
  alreadyCancelled: string;
  notFound: string;
  tooLate: string;
  requestPending: string;
  requestWithdrawn: string;
  replayed: string;
  declined: string;
};

const es: TechCopy = {
  metaTitle: TECH_BRAND,
  metaDescription:
    "Ayuda digital cercana en Guardamar del Segura: móvil, tablet y ordenador (Windows o Mac). Grupos pequeños desde 10 € o cita individual. Sesiones en español e inglés.",
  brandName: TECH_BRAND,
  brandPlace: "GUARDAMAR",
  navHelp: "Cómo te ayudo",
  navAbout: "Ainhoa",
  navPrices: "Precios",
  navStories: "Opiniones",
  navBook: "Reservar",
  navMenuOpen: "Abrir menú",
  navMenuClose: "Cerrar menú",
  langLabel: "Idioma",
  kicker: "Ayuda digital en Guardamar",
  headlineBefore: "Móvil, tablet y ordenador,",
  headlineEm: "sin miedo",
  headlineAfter: "y con calma.",
  lede: "Soy Ainhoa. Te ayudo con tu teléfono, tablet y ordenador — Windows o Mac — con paciencia, palabras sencillas y una sonrisa.",
  metaChips: ["Tu propio dispositivo", "Sin prisas", "Español · English"],
  reserveCta: "Reservar sesión",
  callCta: "Llamar 636 67 01 03",
  heroArtAlt:
    "Preguntas habituales en notas: qué hago con un aviso, dónde están las fotos, cómo envío una foto, qué pasa si borro algo y si un mensaje es de verdad.",
  topicsKicker: "Preguntas que oigo cada semana",
  topicsTitleBefore: "Seguro que te suena",
  topicsTitleEm: "alguna",
  topics: [
    { title: "WhatsApp", quote: "¿Cómo le mando una foto a mi hija?" },
    { title: "Fotos", quote: "Mi móvil está lleno y no sé qué borrar." },
    { title: "iCloud", quote: "No quiero perder mis recuerdos si cambio de móvil." },
    { title: "ChatGPT", quote: "¿Para qué sirve y cómo se le pregunta?" },
    { title: "Videollamadas", quote: "Quiero ver a mis nietos sin complicarme." },
    { title: "Seguridad", quote: "Me ha llegado un mensaje raro del banco…" },
  ],
  aboutKicker: "La persona detrás",
  aboutTitleBefore: "Hola, soy",
  aboutTitleEm: "Ainhoa",
  aboutBody:
    "Vivo en Guardamar y la tecnología me encanta, pero lo que más me gusta es verte sonreír cuando algo por fin funciona. Aquí no hay preguntas tontas: solo cosas que nadie te explicó bien.",
  aboutLanguages:
    "Trabajamos con tu propio móvil, tablet u ordenador y tus propias dudas, en español o inglés, al ritmo que necesites.",
  aboutSign: "— Ainhoa",
  portraitLabel: "Retrato ilustrado de Ainhoa",
  pricesKicker: "Precios claros",
  pricesTitleBefore: "Elige cómo te sientes",
  pricesTitleEm: "más cómodo",
  storiesKicker: "Quien ya vino",
  storiesTitleBefore: "En sus",
  storiesTitleEm: "palabras",
  storiesLead: "Cada persona escribe la suya. Ainhoa la lee y, si encaja, la publica aquí.",
  storiesEmpty: "Todavía no hay opiniones publicadas.",
  storiesFormTitle: "Deja la tuya",
  storiesName: "Tu nombre",
  storiesPlace: "Dónde vives, si quieres",
  storiesBody: "Qué te llevaste de la sesión",
  storiesConsent: "Acepto que mi nombre y este texto se muestren en esta página.",
  storiesSubmit: "Enviar opinión",
  storiesThanks: "Gracias.",
  storiesThanksBody: " Ainhoa la leerá antes de publicarla.",
  groupKicker: "En compañía",
  groupTitle: "Sesión en grupo pequeño",
  groupAmtNote: "por persona",
  groupDuration: "60 minutos (hasta 7 personas)",
  groupPoints: [
    "Grupos reducidos y ambiente tranquilo",
    "Un tema por sesión",
    "Aprendes con otros vecinos",
  ],
  individualKicker: "Privada",
  individualTitle: "Sesión privada",
  individualAmtNote: "por sesión",
  individualDuration: "60 minutos",
  individualShortDuration: "30 minutos",
  individualPoints: [
    "Tú y tus dudas, a tu ritmo",
    "Configuramos tu móvil juntos",
    "Sesión cerrada: nadie más puede unirse a tu hueco",
  ],
  bookGroup: "Reservar plaza",
  bookIndividual: "Reservar sesión privada",
  stepsKicker: "Reservar es sencillo",
  stepsTitleBefore: "Tres pasos,",
  stepsTitleEm: "ninguna prisa",
  steps: [
    {
      title: "Elige un día y una hora",
      body: "O llámame y lo hacemos juntos por teléfono.",
    },
    {
      title: "Guarda la confirmación",
      body: "La verás en pantalla (y por email si lo dejas). También puedes escribirme por WhatsApp si lo prefieres.",
    },
    {
      title: "Trae tu móvil",
      body: "Y todas las dudas que quieras.",
    },
  ],
  preferCallBtn: "Prefiero llamar",
  englishTitle: "Speak English?",
  englishTitleEm: "Welcome.",
  englishBody:
    "Sessions run in English too. Whether it’s WhatsApp, your photos or ChatGPT, I’ll explain it slowly and clearly. Call or message me any time.",
  contactKicker: "Hablemos",
  contactTitleBefore: "Llámame,",
  contactTitleEm: "sin compromiso",
  contactSub: "Respondo yo personalmente.",
  writeWhatsApp: "Escribir por WhatsApp",
  placeFooter: `${TECH_BRAND} · Guardamar del Segura`,
  barCall: "Llamar",
  barReserve: "Reservar",
  preferCall: "También puedes llamarme. No hace falta reservar por internet.",
  talkTitle: "¿Prefieres hablar?",
  talkBody: "No hace falta reservar por internet. Llámame al 636 67 01 03, o escríbeme por WhatsApp.",
  pay: "Paga en la sesión como prefieras: efectivo, transferencia, tarjeta o Bizum. Lo importante es que vengas tranquila; no hay pago por internet.",
  placeTitle: "Dónde",
  placeBody: "Guardamar del Segura. Junto a la Escuela de Música Auditorio",
  choose: "Elige el día y la hora",
  groupOption: "En grupo",
  individualOption: "Privada 60",
  individualShortOption: "Privada 30",
  otherTime: "Pedir otra hora",
  otherTimeHelp:
    "Esto no reserva la hora. Ainhoa la revisa y te confirma solo si puede. Hasta entonces, la hora sigue libre.",
  loading: "Buscando huecos…",
  loadError:
    "No he podido cargar las horas ahora. Parece un problema de conexión o del servidor. Inténtalo otra vez, o llámame / escríbeme por WhatsApp.",
  empty:
    "Ahora no hay huecos de este tipo. Puedes pedir otra hora, llamar o escribir por WhatsApp.",
  notConfigured:
    "En este entorno la reserva online aún no está configurada. No es que no haya huecos: aquí no se puede reservar por internet. Llámame o escríbeme por WhatsApp.",
  calendarOff: "El calendario no acepta reservas en este momento.",
  nextGroupLabel: "Próximo grupo",
  nextGroupEmpty: "Aún no hay un grupo publicado.",
  legendGroup: "Grupo",
  legendPrivate: "Privada",
  legendFree: "Libre",
  legendClosed: "Cerrado",
  weekFull: "Esa semana ya está completa.",
  joinGroup: "Unirme al grupo",
  createPrivate: "Crear sesión privada",
  createGroup: "Crear grupo",
  hourHint: "Elige una hora dentro del horario disponible.",
  copyWhatsApp: "Copiar texto para WhatsApp",
  copyEmail: "Copiar para email",
  full: "Completo",
  seatsOne: "Queda 1 plaza",
  seatsMany: "Quedan {n} plazas",
  formTitle: "Tus datos",
  requestTitle: "Pedir otra hora",
  contactName: "Tu nombre",
  attendeeName: "Nombre de quien asiste",
  forOther: "Reservo para otra persona",
  sessionLanguageLabel: "Idioma de la sesión",
  sessionLanguageHelp: "Las sesiones son en español o inglés.",
  sessionLanguageEs: "Español",
  sessionLanguageEn: "Inglés",
  phone: "Teléfono",
  email: "Email, si quieres",
  emailHint: "No hace falta. La confirmación aparece en esta pantalla.",
  question: "Qué te gustaría mirar, si quieres contarlo",
  questionHint: "No escribas contraseñas, códigos ni datos bancarios.",
  date: "Día",
  time: "Hora",
  termsAcceptBefore: "Acepto los ",
  termsLinkLabel: "términos y condiciones",
  termsAcceptAfter: ".",
  submitBook: "Confirmar reserva",
  submitRequest: "Enviar solicitud",
  saving: "Guardando…",
  errors: {
    name: "Escribe tu nombre.",
    attendee: "Escribe el nombre de quien asiste.",
    phone: "Escribe un teléfono con el prefijo, por ejemplo +34…",
    email: "Revisa el email o déjalo vacío.",
    question: "El texto es demasiado largo.",
    quote: "Escribe unas palabras: entre 8 y 400 caracteres.",
    place: "El lugar es demasiado largo.",
    consent: "Marca que aceptas que se muestre tu opinión.",
    secret: "No envíes contraseñas ni códigos. Cuéntalo con tus palabras en la sesión.",
    terms: "Marca que aceptas los términos y condiciones.",
    sessionLanguage: "Elige si prefieres la sesión en español o en inglés.",
    tech_full: "Esa sesión se acaba de llenar. Elige otra.",
    tech_duplicate: "Este teléfono ya tiene una plaza en esa sesión.",
    tech_not_bookable: "Esa sesión ya no se puede reservar.",
    tech_session_started: "Esa sesión ya ha empezado.",
    tech_blocked: "Ese día no está disponible.",
    tech_outside_hours: "Esa hora está fuera del horario disponible.",
    tech_week_full: "Esa semana ya está completa.",
    tech_overlap: "Esa hora coincide con otra sesión.",
    tech_calendar_off: "El calendario no acepta reservas ahora.",
    tech_language_mismatch:
      "Esa sesión no está disponible en ese idioma. Elige otra hora o cambia el idioma.",
    tech_too_far: "Esa fecha está demasiado lejos. Elige una más próxima.",
    tech_too_soon: "Pide una hora con al menos una hora de margen.",
    tech_failed: "No se ha podido guardar. Inténtalo otra vez.",
    tech_rate: "Has enviado varios intentos seguidos. Espera unos minutos.",
    unavailable:
      "En este entorno la reserva online aún no está configurada. Llámame o escríbeme por WhatsApp.",
    network: "No ha llegado la respuesta. Si no ves la confirmación, no vuelvas a enviar: llama a Ainhoa.",
  },
  confirmedTitle: "Reserva guardada",
  requestedTitle: "Solicitud enviada",
  reference: "Referencia",
  when: "Cuándo",
  price: "Precio",
  where: "Dónde",
  pendingPlace: "Guardamar del Segura. Junto a la Escuela de Música Auditorio",
  keepScreen:
    "Guarda esta pantalla o el enlace. Si no dejas email, esta es la forma de ver la reserva y de cancelarla.",
  cancelHelp: "Puedes cancelar gratis hasta 24 horas antes, desde el enlace de esta confirmación.",
  cancelLate: "Faltan menos de 24 horas. Para cambiar o cancelar, llama a Ainhoa. No hay ningún cargo automático.",
  calendar: "Añadir al calendario",
  call: "Llamar a Ainhoa",
  whatsapp: "WhatsApp",
  back: "Volver a reservar",
  cancelTitle: "Tu reserva",
  cancelButton: "Cancelar reserva",
  cancelling: "Cancelando…",
  cancelled: "Reserva cancelada. La plaza queda libre.",
  alreadyCancelled: "Esta reserva ya estaba cancelada.",
  notFound:
    "No encontramos esa confirmación. Si acabas de reservar, vuelve a la pantalla anterior o llama a Ainhoa con la referencia.",
  tooLate: "Faltan menos de 24 horas. Llama a Ainhoa para cancelar o cambiar la hora. No hay ningún cargo automático.",
  requestPending: "Ainhoa todavía no ha confirmado esta hora. No está reservada.",
  requestWithdrawn: "Solicitud retirada. No había ninguna plaza reservada.",
  replayed: "Esta reserva ya estaba guardada. Si cerraste la pantalla de confirmación, llama con la referencia.",
  declined: "Esta solicitud no se aceptó. No hay ninguna plaza reservada.",
};

const en: TechCopy = {
  metaTitle: TECH_BRAND,
  metaDescription:
    "Friendly digital help in Guardamar del Segura: phone, tablet and computer (Windows or Mac). Small groups from €10, or one-to-one. Sessions in Spanish and English.",
  brandName: TECH_BRAND,
  brandPlace: "GUARDAMAR",
  navHelp: "How I help",
  navAbout: "Ainhoa",
  navPrices: "Prices",
  navStories: "Testimonials",
  navBook: "Book",
  navMenuOpen: "Open menu",
  navMenuClose: "Close menu",
  langLabel: "Language",
  kicker: "Digital help in Guardamar",
  headlineBefore: "Phone, tablet and computer,",
  headlineEm: "without fear",
  headlineAfter: "and with calm.",
  lede: "I’m Ainhoa. I help with your phone, tablet and computer — Windows or Mac — with patience, plain words and a smile.",
  metaChips: ["Your own device", "No rush", "Spanish · English"],
  reserveCta: "Book a session",
  callCta: "Call 636 67 01 03",
  heroArtAlt:
    "Everyday phone questions on notes: what to do with an alert, where photos are, how to send a photo, deleting by mistake, and whether a message is real.",
  topicsKicker: "Questions I hear every week",
  topicsTitleBefore: "One of these may sound",
  topicsTitleEm: "familiar",
  topics: [
    { title: "WhatsApp", quote: "How do I send a photo to my daughter?" },
    { title: "Photos", quote: "My phone is full and I don’t know what to delete." },
    { title: "iCloud", quote: "I don’t want to lose my memories if I change phone." },
    { title: "ChatGPT", quote: "What is it for, and how do I ask?" },
    { title: "Video calls", quote: "I want to see my grandchildren without the fuss." },
    { title: "Safety", quote: "I got a strange message from the bank…" },
  ],
  aboutKicker: "The person behind it",
  aboutTitleBefore: "Hello, I’m",
  aboutTitleEm: "Ainhoa",
  aboutBody:
    "I live in Guardamar and I love technology, but what I love most is seeing you smile when something finally works. There are no silly questions here — only things nobody explained clearly.",
  aboutLanguages:
    "We work with your own phone, tablet or computer and your own questions, in Spanish or English, at your pace.",
  aboutSign: "— Ainhoa",
  portraitLabel: "Illustrated portrait of Ainhoa",
  storiesKicker: "From people who came",
  storiesTitleBefore: "In their",
  storiesTitleEm: "words",
  storiesLead: "Each person writes their own. Ainhoa reads it and publishes it here when it fits.",
  storiesEmpty: "No testimonials are published yet.",
  storiesFormTitle: "Leave yours",
  storiesName: "Your name",
  storiesPlace: "Where you live, if you want",
  storiesBody: "What you took from the session",
  storiesConsent: "I agree that my name and this text can be shown on this page.",
  storiesSubmit: "Send testimonial",
  storiesThanks: "Thank you.",
  storiesThanksBody: " Ainhoa will read it before it is published.",
  pricesKicker: "Clear prices",
  pricesTitleBefore: "Choose what feels",
  pricesTitleEm: "most comfortable",
  groupKicker: "In company",
  groupTitle: "Small group session",
  groupAmtNote: "per person",
  groupDuration: "60 minutes (up to 7 people)",
  groupPoints: [
    "Small groups and a calm atmosphere",
    "One topic per session",
    "You learn with neighbours",
  ],
  individualKicker: "Private",
  individualTitle: "Private session",
  individualAmtNote: "per session",
  individualDuration: "60 minutes",
  individualShortDuration: "30 minutes",
  individualPoints: [
    "You and your questions, at your pace",
    "We set up your phone together",
    "Closed session: no one else can join your slot",
  ],
  bookGroup: "Book a place",
  bookIndividual: "Book a private session",
  stepsKicker: "Booking is simple",
  stepsTitleBefore: "Three steps,",
  stepsTitleEm: "no rush",
  steps: [
    {
      title: "Choose a day and time",
      body: "Or call me and we’ll do it together on the phone.",
    },
    {
      title: "Keep the confirmation",
      body: "You’ll see it on screen (and by email if you leave one). You can also message me on WhatsApp if you prefer.",
    },
    {
      title: "Bring your phone",
      body: "And every question you want to ask.",
    },
  ],
  preferCallBtn: "I’d rather call",
  englishTitle: "¿Hablas español?",
  englishTitleEm: "Bienvenida.",
  englishBody:
    "Las sesiones también son en español. WhatsApp, fotos o ChatGPT: te lo explico con calma. Llámame o escríbeme cuando quieras.",
  contactKicker: "Let’s talk",
  contactTitleBefore: "Call me,",
  contactTitleEm: "no pressure",
  contactSub: "I answer personally.",
  writeWhatsApp: "Message on WhatsApp",
  placeFooter: `${TECH_BRAND} · Guardamar del Segura`,
  barCall: "Call",
  barReserve: "Book",
  preferCall: "You can also call me. You do not have to book online.",
  talkTitle: "Would you rather talk?",
  talkBody: "You do not have to book online. Call me on 636 67 01 03, or message me on WhatsApp.",
  pay: "Pay at the session in whatever way suits you: cash, bank transfer, card or Bizum. Money should not be the stressful part; there is no online checkout.",
  placeTitle: "Where",
  placeBody: "Guardamar del Segura. Next to the Music School Auditorium",
  choose: "Choose the day and time",
  groupOption: "In a group",
  individualOption: "Private 60",
  individualShortOption: "Private 30",
  otherTime: "Ask for another time",
  otherTimeHelp:
    "This does not reserve the time. Ainhoa checks it and confirms only if she can. Until then, the time stays free.",
  loading: "Looking for available times…",
  loadError:
    "I couldn’t load the available times just now. This looks like a connection or server problem. Please try again, or call / message me on WhatsApp.",
  empty:
    "There are no times of this kind available right now. You can ask for another time, call, or use WhatsApp.",
  notConfigured:
    "Online booking is not set up in this environment. That does not mean there are no times — booking here is unavailable. Please call or message me on WhatsApp.",
  calendarOff: "The calendar is not accepting bookings right now.",
  nextGroupLabel: "Next group session",
  nextGroupEmpty: "No group session is published yet.",
  legendGroup: "Group",
  legendPrivate: "Private",
  legendFree: "Free",
  legendClosed: "Closed",
  weekFull: "That week is already full.",
  joinGroup: "Join the group",
  createPrivate: "Create private session",
  createGroup: "Create group session",
  hourHint: "Choose a time within the available hours.",
  copyWhatsApp: "Copy text for WhatsApp",
  copyEmail: "Copy for email",
  full: "Full",
  seatsOne: "1 place left",
  seatsMany: "{n} places left",
  formTitle: "Your details",
  requestTitle: "Ask for another time",
  contactName: "Your name",
  attendeeName: "Name of the person attending",
  forOther: "I am booking for someone else",
  sessionLanguageLabel: "Session language",
  sessionLanguageHelp: "Sessions are in Spanish or English.",
  sessionLanguageEs: "Spanish",
  sessionLanguageEn: "English",
  phone: "Phone",
  email: "Email, if you want",
  emailHint: "Optional. The confirmation stays on this screen.",
  question: "What you would like help with, if you want to say",
  questionHint: "Do not type passwords, codes, or bank details.",
  date: "Day",
  time: "Time",
  termsAcceptBefore: "I accept the ",
  termsLinkLabel: "terms and conditions",
  termsAcceptAfter: ".",
  submitBook: "Confirm booking",
  submitRequest: "Send request",
  saving: "Saving…",
  errors: {
    name: "Enter your name.",
    attendee: "Enter the name of the person attending.",
    phone: "Enter a phone number with the country code, for example +34…",
    email: "Check the email or leave it empty.",
    question: "That note is too long.",
    quote: "Write a few words: between 8 and 400 characters.",
    place: "That place name is too long.",
    consent: "Please agree that your testimonial can be shown.",
    secret: "Do not send passwords or codes. You can explain it in person.",
    terms: "Please accept the terms and conditions.",
    sessionLanguage: "Choose whether you prefer the session in Spanish or English.",
    tech_full: "That session has just filled up. Please choose another.",
    tech_duplicate: "This phone number already has a place in that session.",
    tech_not_bookable: "That session can no longer be booked.",
    tech_session_started: "That session has already started.",
    tech_blocked: "That day is not available.",
    tech_outside_hours: "That time is outside the available hours.",
    tech_week_full: "That week is already full.",
    tech_overlap: "That time overlaps with another session.",
    tech_calendar_off: "The calendar is not accepting bookings right now.",
    tech_language_mismatch:
      "That session is not available in that language. Please choose another time or change the language.",
    tech_too_far: "That date is too far ahead. Please choose a nearer one.",
    tech_too_soon: "Please ask for a time at least one hour from now.",
    tech_failed: "It could not be saved. Please try again.",
    tech_rate: "Several attempts were sent in a row. Please wait a few minutes.",
    unavailable:
      "Online booking is not set up in this environment. Please call or message me on WhatsApp.",
    network: "The answer did not arrive. If you do not see a confirmation, do not send it again: call Ainhoa.",
  },
  confirmedTitle: "Booking saved",
  requestedTitle: "Request sent",
  reference: "Reference",
  when: "When",
  price: "Price",
  where: "Where",
  pendingPlace: "Guardamar del Segura. Next to the Music School Auditorium",
  keepScreen:
    "Keep this screen or the link. If you do not leave an email, this is how you see the booking and cancel it.",
  cancelHelp: "You can cancel free of charge until 24 hours before, from the link on this confirmation.",
  cancelLate: "It is inside 24 hours. To change or cancel, call Ainhoa. There is no automatic charge.",
  calendar: "Add to calendar",
  call: "Call Ainhoa",
  whatsapp: "WhatsApp",
  back: "Back to booking",
  cancelTitle: "Your booking",
  cancelButton: "Cancel booking",
  cancelling: "Cancelling…",
  cancelled: "Booking cancelled. The place is free again.",
  alreadyCancelled: "This booking was already cancelled.",
  notFound:
    "That confirmation could not be found. If you just booked, go back to the previous screen or call Ainhoa with the reference.",
  tooLate: "It is inside 24 hours. Call Ainhoa to cancel or change the time. There is no automatic charge.",
  requestPending: "Ainhoa has not confirmed this time yet. It is not reserved.",
  requestWithdrawn: "Request withdrawn. No place had been reserved.",
  replayed: "This booking was already saved. If you closed the confirmation screen, call with the reference.",
  declined: "This request was not accepted. No place was reserved.",
};

const nl: TechCopy = {
  metaTitle: TECH_BRAND,
  metaDescription:
    "Vriendelijke digitale hulp in Guardamar del Segura: telefoon, tablet en computer (Windows of Mac). Kleine groepen vanaf €10, of een-op-een. Sessies in het Spaans en Engels.",
  brandName: TECH_BRAND,
  brandPlace: "GUARDAMAR",
  navHelp: "Hoe ik help",
  navAbout: "Ainhoa",
  navPrices: "Prijzen",
  navStories: "Ervaringen",
  navBook: "Reserveren",
  navMenuOpen: "Menu openen",
  navMenuClose: "Menu sluiten",
  langLabel: "Taal",
  kicker: "Digitale hulp in Guardamar",
  headlineBefore: "Telefoon, tablet en computer,",
  headlineEm: "zonder angst",
  headlineAfter: "en in alle rust.",
  lede: "Ik ben Ainhoa. Ik help je met je telefoon, tablet en computer — Windows of Mac — met geduld, eenvoudige woorden en een glimlach.",
  metaChips: ["Je eigen apparaat", "Zonder haast", "Español · English"],
  reserveCta: "Sessie reserveren",
  callCta: "Bel 636 67 01 03",
  heroArtAlt:
    "Alledaagse telefoonvragen op briefjes: wat te doen bij een melding, waar foto’s zijn, hoe je een foto stuurt, per ongeluk wissen, en of een bericht echt is.",
  topicsKicker: "Vragen die ik elke week hoor",
  topicsTitleBefore: "Misschien herken je",
  topicsTitleEm: "er eentje",
  topics: [
    { title: "WhatsApp", quote: "Hoe stuur ik een foto naar mijn dochter?" },
    { title: "Foto’s", quote: "Mijn telefoon is vol en ik weet niet wat ik kan wissen." },
    { title: "iCloud", quote: "Ik wil mijn herinneringen niet kwijtraken als ik van telefoon wissel." },
    { title: "ChatGPT", quote: "Waarvoor dient het, en hoe stel ik een vraag?" },
    { title: "Videobellen", quote: "Ik wil mijn kleinkinderen zien zonder gedoe." },
    { title: "Veiligheid", quote: "Ik kreeg een vreemd bericht van de bank…" },
  ],
  aboutKicker: "De persoon erachter",
  aboutTitleBefore: "Hallo, ik ben",
  aboutTitleEm: "Ainhoa",
  aboutBody:
    "Ik woon in Guardamar en ik ben dol op technologie, maar het mooiste vind ik je glimlach als iets eindelijk lukt. Hier bestaan geen domme vragen: alleen dingen die niemand rustig heeft uitgelegd.",
  aboutLanguages:
    "We werken met je eigen telefoon, tablet of computer en je eigen vragen, in het Spaans of Engels, in jouw tempo.",
  aboutSign: "— Ainhoa",
  portraitLabel: "Geïllustreerd portret van Ainhoa",
  pricesKicker: "Duidelijke prijzen",
  pricesTitleBefore: "Kies wat voor jou",
  pricesTitleEm: "het prettigst voelt",
  storiesKicker: "Van wie al kwam",
  storiesTitleBefore: "In hun",
  storiesTitleEm: "woorden",
  storiesLead: "Iedereen schrijft de eigen tekst. Ainhoa leest hem en publiceert hem hier als hij past.",
  storiesEmpty: "Er staan nog geen ervaringen online.",
  storiesFormTitle: "Laat de jouwe achter",
  storiesName: "Je naam",
  storiesPlace: "Waar je woont, als je wilt",
  storiesBody: "Wat je meenam van de sessie",
  storiesConsent: "Ik ga akkoord dat mijn naam en deze tekst op deze pagina komen.",
  storiesSubmit: "Ervaring versturen",
  storiesThanks: "Dank je.",
  storiesThanksBody: " Ainhoa leest hem voordat hij online komt.",
  groupKicker: "Samen",
  groupTitle: "Sessie in kleine groep",
  groupAmtNote: "per persoon",
  groupDuration: "60 minuten (tot 7 personen)",
  groupPoints: [
    "Kleine groepen en een rustige sfeer",
    "Eén onderwerp per sessie",
    "Je leert samen met buren",
  ],
  individualKicker: "Privé",
  individualTitle: "Privésessie",
  individualAmtNote: "per sessie",
  individualDuration: "60 minuten",
  individualShortDuration: "30 minuten",
  individualPoints: [
    "Jij en je vragen, in jouw tempo",
    "We stellen je telefoon samen in",
    "Gesloten sessie: niemand anders kan bij jouw tijdslot aansluiten",
  ],
  bookGroup: "Plek reserveren",
  bookIndividual: "Privésessie reserveren",
  stepsKicker: "Reserveren is eenvoudig",
  stepsTitleBefore: "Drie stappen,",
  stepsTitleEm: "zonder haast",
  steps: [
    {
      title: "Kies een dag en tijd",
      body: "Of bel me en dan doen we het samen aan de telefoon.",
    },
    {
      title: "Bewaar de bevestiging",
      body: "Je ziet hem op het scherm (en per e-mail als je die achterlaat). Je kunt me ook via WhatsApp schrijven als je dat liever doet.",
    },
    {
      title: "Breng je telefoon mee",
      body: "En alle vragen die je wilt stellen.",
    },
  ],
  preferCallBtn: "Ik bel liever",
  englishTitle: "Spaans of Engels?",
  englishTitleEm: "Dat kan.",
  englishBody:
    "Ainhoa spreekt Spaans en Engels. Ze spreekt geen Nederlands, maar helpt rustig en duidelijk met WhatsApp, foto’s, ChatGPT of je andere vragen.",
  contactKicker: "Laten we praten",
  contactTitleBefore: "Bel me,",
  contactTitleEm: "zonder verplichting",
  contactSub: "Ik antwoord persoonlijk.",
  writeWhatsApp: "Schrijf via WhatsApp",
  placeFooter: `${TECH_BRAND} · Guardamar del Segura`,
  barCall: "Bellen",
  barReserve: "Reserveren",
  preferCall: "Je kunt me ook bellen. Online reserveren hoeft niet.",
  talkTitle: "Praat je liever even?",
  talkBody: "Online reserveren hoeft niet. Bel me op 636 67 01 03, of schrijf me via WhatsApp.",
  pay: "Betaal tijdens de sessie zoals jij wilt: contant, via overschrijving, met kaart of met Bizum. Geld hoeft geen stress te geven; er is geen online betaling.",
  placeTitle: "Waar",
  placeBody: "Guardamar del Segura. Naast de Escuela de Música Auditorio",
  choose: "Kies de dag en tijd",
  groupOption: "In een groep",
  individualOption: "Privé 60",
  individualShortOption: "Privé 30",
  otherTime: "Vraag een andere tijd aan",
  otherTimeHelp:
    "Dit reserveert de tijd nog niet. Ainhoa bekijkt je aanvraag en bevestigt alleen als het kan. Tot die tijd blijft de tijd vrij.",
  loading: "Beschikbare tijden zoeken…",
  loadError:
    "Ik kon de beschikbare tijden nu niet laden. Het lijkt op een verbindings- of serverprobleem. Probeer het opnieuw, of bel / schrijf me via WhatsApp.",
  empty:
    "Er zijn nu geen tijden van dit type beschikbaar. Je kunt een andere tijd aanvragen, bellen of WhatsApp gebruiken.",
  notConfigured:
    "Online reserveren is in deze omgeving nog niet ingesteld. Dat betekent niet dat er geen tijden zijn: reserveren kan hier niet. Bel of schrijf me via WhatsApp.",
  calendarOff: "De agenda accepteert op dit moment geen reserveringen.",
  nextGroupLabel: "Volgende groepssessie",
  nextGroupEmpty: "Er is nog geen groepssessie gepubliceerd.",
  legendGroup: "Groep",
  legendPrivate: "Privé",
  legendFree: "Vrij",
  legendClosed: "Gesloten",
  weekFull: "Die week is al vol.",
  joinGroup: "Meedoen met de groep",
  createPrivate: "Privésessie maken",
  createGroup: "Groepssessie maken",
  hourHint: "Kies een tijd binnen de beschikbare uren.",
  copyWhatsApp: "Tekst voor WhatsApp kopiëren",
  copyEmail: "Kopiëren voor e-mail",
  full: "Vol",
  seatsOne: "Nog 1 plek vrij",
  seatsMany: "Nog {n} plekken vrij",
  formTitle: "Je gegevens",
  requestTitle: "Andere tijd aanvragen",
  contactName: "Je naam",
  attendeeName: "Naam van wie komt",
  forOther: "Ik reserveer voor iemand anders",
  sessionLanguageLabel: "Taal van de sessie",
  sessionLanguageHelp: "Sessies zijn in het Spaans of Engels.",
  sessionLanguageEs: "Spaans",
  sessionLanguageEn: "Engels",
  phone: "Telefoon",
  email: "E-mail, als je wilt",
  emailHint: "Niet verplicht. De bevestiging blijft op dit scherm.",
  question: "Waarmee je hulp wilt, als je dat wilt vertellen",
  questionHint: "Schrijf geen wachtwoorden, codes of bankgegevens.",
  date: "Dag",
  time: "Tijd",
  termsAcceptBefore: "Ik accepteer de ",
  termsLinkLabel: "algemene voorwaarden",
  termsAcceptAfter: ".",
  submitBook: "Reservering bevestigen",
  submitRequest: "Aanvraag versturen",
  saving: "Opslaan…",
  errors: {
    name: "Vul je naam in.",
    attendee: "Vul de naam in van wie komt.",
    phone: "Vul een telefoonnummer in met landcode, bijvoorbeeld +34…",
    email: "Controleer de e-mail of laat hem leeg.",
    question: "Die tekst is te lang.",
    quote: "Schrijf een paar woorden: tussen 8 en 400 tekens.",
    place: "Die plaatsnaam is te lang.",
    consent: "Geef akkoord dat je ervaring getoond mag worden.",
    secret: "Stuur geen wachtwoorden of codes. Je kunt het tijdens de sessie uitleggen.",
    terms: "Accepteer de algemene voorwaarden.",
    sessionLanguage: "Kies of je de sessie liever in het Spaans of Engels wilt.",
    tech_full: "Die sessie is net vol geraakt. Kies een andere.",
    tech_duplicate: "Dit telefoonnummer heeft al een plek in die sessie.",
    tech_not_bookable: "Die sessie kan niet meer worden gereserveerd.",
    tech_session_started: "Die sessie is al begonnen.",
    tech_blocked: "Die dag is niet beschikbaar.",
    tech_outside_hours: "Die tijd valt buiten de beschikbare uren.",
    tech_week_full: "Die week is al vol.",
    tech_overlap: "Die tijd overlapt met een andere sessie.",
    tech_calendar_off: "De agenda accepteert nu geen reserveringen.",
    tech_language_mismatch:
      "Die sessie is niet beschikbaar in die taal. Kies een andere tijd of verander de taal.",
    tech_too_far: "Die datum is te ver weg. Kies een datum dichterbij.",
    tech_too_soon: "Vraag een tijd aan met minstens een uur marge.",
    tech_failed: "Opslaan is niet gelukt. Probeer het opnieuw.",
    tech_rate: "Er zijn meerdere pogingen achter elkaar verstuurd. Wacht een paar minuten.",
    unavailable:
      "Online reserveren is in deze omgeving nog niet ingesteld. Bel of schrijf me via WhatsApp.",
    network:
      "Het antwoord is niet aangekomen. Als je geen bevestiging ziet, verstuur het dan niet opnieuw: bel Ainhoa.",
  },
  confirmedTitle: "Reservering opgeslagen",
  requestedTitle: "Aanvraag verstuurd",
  reference: "Referentie",
  when: "Wanneer",
  price: "Prijs",
  where: "Waar",
  pendingPlace: "Guardamar del Segura. Naast de Escuela de Música Auditorio",
  keepScreen:
    "Bewaar dit scherm of de link. Als je geen e-mail achterlaat, kun je zo je reservering bekijken en annuleren.",
  cancelHelp: "Je kunt gratis annuleren tot 24 uur van tevoren, via de link in deze bevestiging.",
  cancelLate:
    "Het is binnen 24 uur. Bel Ainhoa om de tijd te veranderen of te annuleren. Er wordt niets automatisch afgeschreven.",
  calendar: "Toevoegen aan agenda",
  call: "Ainhoa bellen",
  whatsapp: "WhatsApp",
  back: "Terug naar reserveren",
  cancelTitle: "Je reservering",
  cancelButton: "Reservering annuleren",
  cancelling: "Annuleren…",
  cancelled: "Reservering geannuleerd. De plek is weer vrij.",
  alreadyCancelled: "Deze reservering was al geannuleerd.",
  notFound:
    "Die bevestiging kon niet worden gevonden. Als je net hebt gereserveerd, ga terug naar het vorige scherm of bel Ainhoa met de referentie.",
  tooLate:
    "Het is binnen 24 uur. Bel Ainhoa om te annuleren of de tijd te veranderen. Er wordt niets automatisch afgeschreven.",
  requestPending: "Ainhoa heeft deze tijd nog niet bevestigd. Hij is niet gereserveerd.",
  requestWithdrawn: "Aanvraag ingetrokken. Er was geen plek gereserveerd.",
  replayed:
    "Deze reservering was al opgeslagen. Als je het bevestigingsscherm hebt gesloten, bel dan met de referentie.",
  declined: "Deze aanvraag is niet geaccepteerd. Er is geen plek gereserveerd.",
};

export function getTechCopy(locale: TechLocale): TechCopy {
  if (locale === "en") return en;
  if (locale === "nl") return nl;
  return es;
}
