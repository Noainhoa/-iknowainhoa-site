import { GROUP_MINUTES, INDIVIDUAL_MINUTES, TECH_BRAND } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";
import { formatNationalPhone } from "@/lib/tech/phone";
import { techAdminFocusUrl, techBookingManageUrl } from "@/lib/tech/seo";
import { formatMadrid } from "@/lib/tech/time";

export function euros(cents: number, locale: "es" | "en" | "nl"): string {
  const tag = locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : "es-ES";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function ownerBookingEmail(input: {
  reference: string;
  kind: "group" | "individual";
  startsAt: Date;
  contactName: string;
  attendeeName: string;
  phone: string;
  email: string | null;
  question: string | null;
  venue: string;
  sessionLanguage?: "es" | "en";
}): { subject: string; body: string } {
  const when = formatMadrid(input.startsAt, "es");
  const kind = input.kind === "group" ? "Grupo" : "Individual";
  const language = input.sessionLanguage === "en" ? "Inglés" : "Español";
  const adminUrl = techAdminFocusUrl("booking", input.reference);
  const lines = [
    `Nueva reserva confirmada ${input.reference}.`,
    `Tipo: ${kind}`,
    `Idioma de la sesión: ${language}`,
    `Cuándo: ${when}`,
    `Lugar: ${input.venue}`,
    `Contacto: ${input.contactName}`,
    `Asiste: ${input.attendeeName}`,
    `Teléfono: ${input.phone}`,
    input.email ? `Email: ${input.email}` : "Email: no dejado",
    input.question ? `Pregunta: ${input.question}` : "Pregunta: ninguna",
    "Pago en la sesión como prefiera la persona (efectivo, transferencia, tarjeta o Bizum).",
    "",
    "Abrir esta reserva en el administrador:",
    adminUrl,
  ];
  return {
    subject: `Nueva reserva ${TECH_BRAND} · ${input.reference}`,
    body: lines.join("\n"),
  };
}

export function ownerRequestEmail(input: {
  reference: string;
  startsAt: Date;
  contactName: string;
  attendeeName: string;
  phone: string;
  email: string | null;
  question: string | null;
  sessionLanguage?: "es" | "en";
}): { subject: string; body: string } {
  const when = formatMadrid(input.startsAt, "es");
  const language = input.sessionLanguage === "en" ? "Inglés" : "Español";
  const adminUrl = techAdminFocusUrl("request", input.reference);
  const lines = [
    `Nueva solicitud pendiente ${input.reference}. Esta hora NO está reservada.`,
    `Idioma preferido: ${language}`,
    `Cuándo pide: ${when}`,
    `Duración si la aceptas: ${INDIVIDUAL_MINUTES} minutos`,
    `Contacto: ${input.contactName}`,
    `Asiste: ${input.attendeeName}`,
    `Teléfono: ${input.phone}`,
    input.email ? `Email: ${input.email}` : "Email: no dejado",
    input.question ? `Pregunta: ${input.question}` : "Pregunta: ninguna",
    "Acéptala o recházala en el administrador. Aceptarla crea la cita.",
    "",
    "Abrir esta solicitud en el administrador:",
    adminUrl,
  ];
  return {
    subject: `Solicitud pendiente ${TECH_BRAND} · ${input.reference}`,
    body: lines.join("\n"),
  };
}

/** Customer booking confirmation. Includes the private manage URL once; never store this body with the raw token. */
export function customerBookingEmail(input: {
  locale: TechLocale;
  reference: string;
  kind: "group" | "individual";
  startsAt: Date;
  durationMinutes: number;
  priceCents: number;
  venue: string;
  manageToken: string;
}): { subject: string; body: string } {
  const when = formatMadrid(input.startsAt, input.locale);
  const manageUrl = techBookingManageUrl(input.manageToken, input.locale);
  const phone = formatNationalPhone();
  const price = euros(input.priceCents, input.locale);
  const kindEs = input.kind === "group" ? "Grupo" : "Individual";
  const kindEn = input.kind === "group" ? "Group" : "Individual";
  const kindNl = input.kind === "group" ? "Groep" : "Individueel";

  if (input.locale === "en") {
    return {
      subject: `${TECH_BRAND} booking ${input.reference}`,
      body: [
        `Your ${TECH_BRAND} booking is confirmed (${input.reference}).`,
        `Type: ${kindEn}`,
        `When: ${when}`,
        `Duration: ${input.durationMinutes} minutes`,
        `Price: ${price} (pay at the session, cash or Bizum)`,
        `Place: ${input.venue}`,
        `Ainhoa’s phone: ${phone}`,
        "",
        "Private link to view or cancel your booking (do not share it):",
        manageUrl,
        "",
        "You can cancel free of charge until 24 hours before the session from that link.",
        "If you did not make this booking, ignore this email or call Ainhoa.",
      ].join("\n"),
    };
  }

  if (input.locale === "nl") {
    return {
      subject: `${TECH_BRAND} reservering ${input.reference}`,
      body: [
        `Je ${TECH_BRAND}-reservering is bevestigd (${input.reference}).`,
        `Soort: ${kindNl}`,
        `Wanneer: ${when}`,
        `Duur: ${input.durationMinutes} minuten`,
        `Prijs: ${price} (betalen tijdens de sessie, contant of Bizum)`,
        `Plaats: ${input.venue}`,
        `Telefoon van Ainhoa: ${phone}`,
        "",
        "Privélink om je reservering te bekijken of te annuleren (deel hem niet):",
        manageUrl,
        "",
        "Je kunt gratis annuleren tot 24 uur voor de sessie via die link.",
        "Als jij deze reservering niet hebt gemaakt, negeer deze e-mail of bel Ainhoa.",
      ].join("\n"),
    };
  }

  return {
    subject: `Reserva ${TECH_BRAND} · ${input.reference}`,
    body: [
      `Tu reserva de ${TECH_BRAND} está confirmada (${input.reference}).`,
      `Tipo: ${kindEs}`,
      `Cuándo: ${when}`,
      `Duración: ${input.durationMinutes} minutos`,
      `Precio: ${price} (se paga en la sesión, en efectivo o Bizum)`,
      `Lugar: ${input.venue}`,
      `Teléfono de Ainhoa: ${phone}`,
      "",
      "Enlace privado para ver o cancelar tu reserva (no lo compartas):",
      manageUrl,
      "",
      "Puedes cancelar gratis hasta 24 horas antes desde ese enlace.",
      "Si no has hecho esta reserva, ignora este email o llama a Ainhoa.",
    ].join("\n"),
  };
}

export function customerWhatsAppText(input: {
  locale: TechLocale;
  reference: string;
  when: string;
  kind: "group" | "individual" | "request";
}): string {
  if (input.locale === "en") {
    const kind =
      input.kind === "group" ? "group" : input.kind === "individual" ? "individual appointment" : "request for another time";
    return `Hello Ainhoa, this is my ${TECH_BRAND} booking ${input.reference}. ${kind}. ${input.when}.`;
  }
  if (input.locale === "nl") {
    const kind =
      input.kind === "group" ? "groep" : input.kind === "individual" ? "individuele afspraak" : "verzoek om een ander tijdstip";
    return `Hallo Ainhoa, dit is mijn ${TECH_BRAND}-reservering ${input.reference}. ${kind}. ${input.when}.`;
  }
  const kind =
    input.kind === "group" ? "grupo" : input.kind === "individual" ? "cita individual" : "solicitud de otra hora";
  return `Hola Ainhoa, esta es mi reserva de ${TECH_BRAND} ${input.reference}. ${kind}. ${input.when}.`;
}

export function sessionLength(kind: "group" | "individual"): number {
  return kind === "group" ? GROUP_MINUTES : INDIVIDUAL_MINUTES;
}
