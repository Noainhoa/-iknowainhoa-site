import type { TechLocale } from "@/lib/tech/locale";

export type TechCopy = {
  metaTitle: string;
  metaDescription: string;
  brandName: string;
  brandPlace: string;
  navHelp: string;
  navAbout: string;
  navPrices: string;
  navBook: string;
  langLabel: string;
  kicker: string;
  headlineBefore: string;
  headlineEm: string;
  headlineAfter: string;
  lede: string;
  metaChips: string[];
  reserveCta: string;
  callCta: string;
  msgWho: string;
  msgHello: string;
  msgReply: string;
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
  groupKicker: string;
  groupTitle: string;
  groupAmtNote: string;
  groupDuration: string;
  groupPoints: string[];
  individualKicker: string;
  individualTitle: string;
  individualAmtNote: string;
  individualDuration: string;
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
  otherTime: string;
  otherTimeHelp: string;
  loading: string;
  /** Temporary network / backend failure while loading sessions. */
  loadError: string;
  /** API reachable, but no published times of this kind. */
  empty: string;
  /** Dev/local: booking backend not configured (HTTP 503). */
  notConfigured: string;
  full: string;
  seatsOne: string;
  seatsMany: string;
  formTitle: string;
  requestTitle: string;
  contactName: string;
  attendeeName: string;
  forOther: string;
  phone: string;
  email: string;
  emailHint: string;
  question: string;
  questionHint: string;
  date: string;
  time: string;
  attendance: string;
  cancellation: string;
  privacy: string;
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
  privacyTitle: string;
  privacyBody: string;
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
  metaTitle: "Tech Made Easy · Guardamar",
  metaDescription:
    "Ayuda tecnológica cercana en Guardamar del Segura. Grupos pequeños desde 10 € o una cita individual. En español y en inglés.",
  brandName: "Tech Made Easy",
  brandPlace: "GUARDAMAR",
  navHelp: "Cómo te ayudo",
  navAbout: "Ainhoa",
  navPrices: "Precios",
  navBook: "Reservar",
  langLabel: "Idioma",
  kicker: "Ayuda tecnológica en Guardamar",
  headlineBefore: "Tu móvil,",
  headlineEm: "sin miedo",
  headlineAfter: "y con calma.",
  lede: "Soy Ainhoa. Te enseño a usar WhatsApp, tus fotos y tu teléfono con paciencia, palabras sencillas y una sonrisa.",
  metaChips: ["Con tu propio móvil", "Sin prisas", "Español · English"],
  reserveCta: "Reservar sesión",
  callCta: "Llamar 636 67 01 03",
  msgWho: "Ainhoa",
  msgHello: "¡Hola! Cuéntame qué te gustaría aprender.",
  msgReply: "Mandar fotos a mis nietos",
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
  aboutLanguages: "Trabajamos con tu propio móvil y tus propias dudas, en español o en inglés, al ritmo que necesites.",
  aboutSign: "— Ainhoa",
  portraitLabel: "Retrato ilustrado de Ainhoa",
  pricesKicker: "Precios claros",
  pricesTitleBefore: "Elige cómo te sientes",
  pricesTitleEm: "más cómodo",
  groupKicker: "En compañía",
  groupTitle: "Sesión en grupo pequeño",
  groupAmtNote: "por persona",
  groupDuration: "75 minutos",
  groupPoints: [
    "Grupos reducidos y ambiente tranquilo",
    "Un tema por sesión",
    "Aprendes con otros vecinos",
  ],
  individualKicker: "Solo para ti",
  individualTitle: "Ayuda individual",
  individualAmtNote: "por sesión",
  individualDuration: "60 minutos",
  individualPoints: [
    "Tú y tus dudas, a tu ritmo",
    "Configuramos tu móvil juntos",
    "Ideal para resolver un problema",
  ],
  bookGroup: "Reservar plaza",
  bookIndividual: "Pedir ayuda individual",
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
  placeFooter: "Tech Made Easy · Guardamar del Segura",
  barCall: "Llamar",
  barReserve: "Reservar",
  preferCall: "También puedes llamarme. No hace falta reservar por internet.",
  talkTitle: "¿Prefieres hablar?",
  talkBody: "No hace falta reservar por internet. Llámame al 636 67 01 03, o escríbeme por WhatsApp.",
  pay: "Se paga en la sesión, en efectivo o por Bizum. No hay pago por internet.",
  placeTitle: "Dónde",
  placeBody: "Guardamar del Segura — lugar exacto por confirmar.",
  choose: "Elige el día y la hora",
  groupOption: "En grupo",
  individualOption: "Individual",
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
  full: "Completo",
  seatsOne: "Queda 1 plaza",
  seatsMany: "Quedan {n} plazas",
  formTitle: "Tus datos",
  requestTitle: "Pedir otra hora",
  contactName: "Tu nombre",
  attendeeName: "Nombre de quien asiste",
  forOther: "Reservo para otra persona",
  phone: "Teléfono",
  email: "Email, si quieres",
  emailHint: "No hace falta. La confirmación aparece en esta pantalla.",
  question: "Qué te gustaría mirar, si quieres contarlo",
  questionHint: "No escribas contraseñas, códigos ni datos bancarios.",
  date: "Día",
  time: "Hora",
  attendance: "Confirmo que estaré.",
  cancellation:
    "Puedo cancelar gratis hasta 24 horas antes. Más tarde, llamaré a Ainhoa. No hay ningún cargo automático.",
  privacy:
    "Acepto que Ainhoa guarde mi nombre y mi teléfono para organizar esta reserva, y los borre cuando ya no hagan falta.",
  submitBook: "Confirmar reserva",
  submitRequest: "Enviar solicitud",
  saving: "Guardando…",
  errors: {
    name: "Escribe tu nombre.",
    attendee: "Escribe el nombre de quien asiste.",
    phone: "Escribe un teléfono con el prefijo, por ejemplo +34…",
    email: "Revisa el email o déjalo vacío.",
    question: "El texto es demasiado largo.",
    secret: "No envíes contraseñas ni códigos. Cuéntalo con tus palabras en la sesión.",
    attendance: "Marca que estarás.",
    cancellation: "Marca que has leído la cancelación.",
    privacy: "Marca que aceptas guardar los datos de la reserva.",
    tech_full: "Esa sesión se acaba de llenar. Elige otra.",
    tech_duplicate: "Este teléfono ya tiene una plaza en esa sesión.",
    tech_not_bookable: "Esa sesión ya no se puede reservar.",
    tech_session_started: "Esa sesión ya ha empezado.",
    tech_blocked: "Ese día no está disponible.",
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
  pendingPlace: "Guardamar del Segura — lugar exacto por confirmar.",
  keepScreen:
    "Guarda esta pantalla o el enlace. Si no dejas email, esta es la forma de ver la reserva y de cancelarla.",
  cancelHelp: "Puedes cancelar gratis hasta 24 horas antes, desde el enlace de esta confirmación.",
  cancelLate: "Faltan menos de 24 horas. Para cambiar o cancelar, llama a Ainhoa. No hay ningún cargo automático.",
  calendar: "Añadir al calendario",
  call: "Llamar a Ainhoa",
  whatsapp: "WhatsApp",
  back: "Volver a reservar",
  privacyTitle: "Datos",
  privacyBody:
    "Ainhoa Ferrandis Perea guarda el nombre, el teléfono, el email si lo dejas y la nota si la escribes, solo para organizar la sesión. Puedes pedir que los borre. No se piden contraseñas ni datos de cuentas.",
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
  metaTitle: "Tech Made Easy · Guardamar",
  metaDescription:
    "Friendly technology help in Guardamar del Segura. Small groups from €10, or a one-to-one appointment. Spanish and English.",
  brandName: "Tech Made Easy",
  brandPlace: "GUARDAMAR",
  navHelp: "How I help",
  navAbout: "Ainhoa",
  navPrices: "Prices",
  navBook: "Book",
  langLabel: "Language",
  kicker: "Technology help in Guardamar",
  headlineBefore: "Your phone,",
  headlineEm: "without fear",
  headlineAfter: "and with calm.",
  lede: "I’m Ainhoa. I teach you WhatsApp, your photos and your phone with patience, plain words and a smile.",
  metaChips: ["On your own phone", "No rush", "Spanish · English"],
  reserveCta: "Book a session",
  callCta: "Call 636 67 01 03",
  msgWho: "Ainhoa",
  msgHello: "Hi! Tell me what you’d like to learn.",
  msgReply: "Send photos to my grandchildren",
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
  aboutLanguages: "We work with your own phone and your own questions, in Spanish or English, at your pace.",
  aboutSign: "— Ainhoa",
  portraitLabel: "Illustrated portrait of Ainhoa",
  pricesKicker: "Clear prices",
  pricesTitleBefore: "Choose what feels",
  pricesTitleEm: "most comfortable",
  groupKicker: "In company",
  groupTitle: "Small group session",
  groupAmtNote: "per person",
  groupDuration: "75 minutes",
  groupPoints: [
    "Small groups and a calm atmosphere",
    "One topic per session",
    "You learn with neighbours",
  ],
  individualKicker: "Just for you",
  individualTitle: "Individual help",
  individualAmtNote: "per session",
  individualDuration: "60 minutes",
  individualPoints: [
    "You and your questions, at your pace",
    "We set up your phone together",
    "Ideal for sorting one problem",
  ],
  bookGroup: "Book a place",
  bookIndividual: "Ask for individual help",
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
  placeFooter: "Tech Made Easy · Guardamar del Segura",
  barCall: "Call",
  barReserve: "Book",
  preferCall: "You can also call me. You do not have to book online.",
  talkTitle: "Would you rather talk?",
  talkBody: "You do not have to book online. Call me on 636 67 01 03, or message me on WhatsApp.",
  pay: "Pay at the session, in cash or by Bizum. There is no online payment.",
  placeTitle: "Where",
  placeBody: "Guardamar del Segura — exact place to be confirmed.",
  choose: "Choose the day and time",
  groupOption: "In a group",
  individualOption: "One to one",
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
  full: "Full",
  seatsOne: "1 place left",
  seatsMany: "{n} places left",
  formTitle: "Your details",
  requestTitle: "Ask for another time",
  contactName: "Your name",
  attendeeName: "Name of the person attending",
  forOther: "I am booking for someone else",
  phone: "Phone",
  email: "Email, if you want",
  emailHint: "Optional. The confirmation stays on this screen.",
  question: "What you would like help with, if you want to say",
  questionHint: "Do not type passwords, codes, or bank details.",
  date: "Day",
  time: "Time",
  attendance: "I confirm I will be there.",
  cancellation:
    "I can cancel free of charge until 24 hours before. After that, I will call Ainhoa. There is no automatic charge.",
  privacy:
    "I agree that Ainhoa keeps my name and phone number to organise this booking, and deletes them when they are no longer needed.",
  submitBook: "Confirm booking",
  submitRequest: "Send request",
  saving: "Saving…",
  errors: {
    name: "Enter your name.",
    attendee: "Enter the name of the person attending.",
    phone: "Enter a phone number with the country code, for example +34…",
    email: "Check the email or leave it empty.",
    question: "That note is too long.",
    secret: "Do not send passwords or codes. You can explain it in person.",
    attendance: "Please confirm you will attend.",
    cancellation: "Please confirm you have read the cancellation terms.",
    privacy: "Please agree to storing the booking details.",
    tech_full: "That session has just filled up. Please choose another.",
    tech_duplicate: "This phone number already has a place in that session.",
    tech_not_bookable: "That session can no longer be booked.",
    tech_session_started: "That session has already started.",
    tech_blocked: "That day is not available.",
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
  pendingPlace: "Guardamar del Segura — exact place to be confirmed.",
  keepScreen:
    "Keep this screen or the link. If you do not leave an email, this is how you see the booking and cancel it.",
  cancelHelp: "You can cancel free of charge until 24 hours before, from the link on this confirmation.",
  cancelLate: "It is inside 24 hours. To change or cancel, call Ainhoa. There is no automatic charge.",
  calendar: "Add to calendar",
  call: "Call Ainhoa",
  whatsapp: "WhatsApp",
  back: "Back to booking",
  privacyTitle: "Your details",
  privacyBody:
    "Ainhoa Ferrandis Perea keeps the name, phone number, email if you leave one, and note if you write one, only to organise the session. You can ask for them to be deleted. Passwords and account details are not collected.",
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

export function getTechCopy(locale: TechLocale): TechCopy {
  return locale === "en" ? en : es;
}
