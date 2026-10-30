import { GROUP_MINUTES, INDIVIDUAL_MINUTES } from "@/lib/tech/constants";
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
  ];
  return {
    subject: `Solicitud pendiente Tech Made Easy · ${input.reference}`,
    body: lines.join("\n"),
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
