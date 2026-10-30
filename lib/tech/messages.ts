import { GROUP_MINUTES, INDIVIDUAL_MINUTES } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";
import { formatNationalPhone } from "@/lib/tech/phone";
import { techAdminFocusUrl, techBookingManageUrl } from "@/lib/tech/seo";
import { formatMadrid } from "@/lib/tech/time";

export function euros(cents: number, locale: "es" | "en"): string {
  const tag = locale === "en" ? "en-GB" : "es-ES";
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
}): { subject: string; body: string } {
  const when = formatMadrid(input.startsAt, "es");
  const kind = input.kind === "group" ? "Grupo" : "Individual";
  const adminUrl = techAdminFocusUrl("booking", input.reference);
  const lines = [
    `Nueva reserva confirmada ${input.reference}.`,
    `Tipo: ${kind}`,
    `Cuándo: ${when}`,
    `Lugar: ${input.venue}`,
    `Contacto: ${input.contactName}`,
    `Asiste: ${input.attendeeName}`,
    `Teléfono: ${input.phone}`,
    input.email ? `Email: ${input.email}` : "Email: no dejado",
    input.question ? `Pregunta: ${input.question}` : "Pregunta: ninguna",
    "Pago en la sesión, en efectivo o Bizum.",
    "",
    "Abrir esta reserva en el administrador:",
    adminUrl,
  ];
  return {
    subject: `Nueva reserva Tech Made Easy · ${input.reference}`,
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
}): { subject: string; body: string } {
  const when = formatMadrid(input.startsAt, "es");
  const adminUrl = techAdminFocusUrl("request", input.reference);
  const lines = [
    `Nueva solicitud pendiente ${input.reference}. Esta hora NO está reservada.`,
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
    subject: `Solicitud pendiente Tech Made Easy · ${input.reference}`,
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
  const manageUrl = techBookingManageUrl(input.manageToken);
  const phone = formatNationalPhone();
  const price = euros(input.priceCents, input.locale);
  const kindEs = input.kind === "group" ? "Grupo" : "Individual";
  const kindEn = input.kind === "group" ? "Group" : "Individual";

  if (input.locale === "en") {
    return {
      subject: `Tech Made Easy booking ${input.reference}`,
      body: [
        `Your Tech Made Easy booking is confirmed (${input.reference}).`,
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

  return {
    subject: `Reserva Tech Made Easy · ${input.reference}`,
    body: [
      `Tu reserva de Tech Made Easy está confirmada (${input.reference}).`,
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
  locale: "es" | "en";
  reference: string;
  when: string;
  kind: "group" | "individual" | "request";
}): string {
  if (input.locale === "en") {
    const kind =
      input.kind === "group" ? "group" : input.kind === "individual" ? "individual appointment" : "request for another time";
    return `Hello Ainhoa, this is my Tech Made Easy booking ${input.reference}. ${kind}. ${input.when}.`;
  }
  const kind =
    input.kind === "group" ? "grupo" : input.kind === "individual" ? "cita individual" : "solicitud de otra hora";
  return `Hola Ainhoa, esta es mi reserva de Tech Made Easy ${input.reference}. ${kind}. ${input.when}.`;
}

export function sessionLength(kind: "group" | "individual"): number {
  return kind === "group" ? GROUP_MINUTES : INDIVIDUAL_MINUTES;
}
