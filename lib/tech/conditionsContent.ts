import { TECH_BRAND, TECH_PATH } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";

export const TECH_CONDITIONS_PATH = `${TECH_PATH}/condiciones`;

export type ConditionsSection = {
  heading: string;
  paragraphs: string[];
};

export type TechConditionsCopy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  sections: ConditionsSection[];
  backToBooking: string;
  langLabel: string;
};

const es: TechConditionsCopy = {
  metaTitle: `Condiciones de reserva | ${TECH_BRAND}`,
  metaDescription:
    "Condiciones de la reserva en Guardamar Click: asistencia, cancelación, datos personales y lo que no se pide.",
  title: "Condiciones de reserva",
  intro:
    "Al marcar la casilla en el formulario, aceptas estas condiciones para organizar tu sesión con Ainhoa Ferrandis Perea.",
  backToBooking: "Volver a reservar",
  langLabel: "Idioma",
  sections: [
    {
      heading: "Asistencia",
      paragraphs: [
        "Confirmas que estarás en la sesión reservada (o la persona para quien reserves).",
      ],
    },
    {
      heading: "Cancelación",
      paragraphs: [
        "Puedes cancelar gratis hasta 24 horas antes, desde el enlace de confirmación.",
        "Si faltan menos de 24 horas, llama a Ainhoa para cambiar o cancelar. No hay ningún cargo automático.",
      ],
    },
    {
      heading: "Datos",
      paragraphs: [
        "Ainhoa Ferrandis Perea guarda el nombre, el teléfono, el email si lo dejas y la nota si la escribes, solo para organizar la sesión.",
        "Puedes pedir que los borre cuando ya no hagan falta.",
      ],
    },
    {
      heading: "Qué no se pide",
      paragraphs: [
        "No se piden contraseñas, códigos ni datos de cuentas bancarias. No los escribas en el formulario.",
      ],
    },
  ],
};

const en: TechConditionsCopy = {
  metaTitle: `Booking conditions | ${TECH_BRAND}`,
  metaDescription:
    "Guardamar Click booking conditions: attendance, cancellation, personal data, and what is not collected.",
  title: "Booking conditions",
  intro:
    "By ticking the box on the form, you accept these conditions so Ainhoa Ferrandis Perea can organise your session.",
  backToBooking: "Back to booking",
  langLabel: "Language",
  sections: [
    {
      heading: "Attendance",
      paragraphs: [
        "You confirm that you will be at the booked session (or the person you are booking for).",
      ],
    },
    {
      heading: "Cancellation",
      paragraphs: [
        "You can cancel free of charge until 24 hours before, from the confirmation link.",
        "Inside 24 hours, call Ainhoa to change or cancel. There is no automatic charge.",
      ],
    },
    {
      heading: "Your details",
      paragraphs: [
        "Ainhoa Ferrandis Perea keeps the name, phone number, email if you leave one, and note if you write one, only to organise the session.",
        "You can ask for them to be deleted when they are no longer needed.",
      ],
    },
    {
      heading: "What is not collected",
      paragraphs: [
        "Passwords, codes, and bank account details are not requested. Do not write them in the form.",
      ],
    },
  ],
};

const nl: TechConditionsCopy = {
  metaTitle: `Reserveringsvoorwaarden | ${TECH_BRAND}`,
  metaDescription:
    "Voorwaarden van Guardamar Click: aanwezigheid, annulering, persoonsgegevens en wat niet wordt gevraagd.",
  title: "Reserveringsvoorwaarden",
  intro:
    "Door het vakje op het formulier aan te vinken, accepteer je deze voorwaarden zodat Ainhoa Ferrandis Perea je sessie kan organiseren.",
  backToBooking: "Terug naar reserveren",
  langLabel: "Taal",
  sections: [
    {
      heading: "Aanwezigheid",
      paragraphs: [
        "Je bevestigt dat je bij de gereserveerde sessie bent (of de persoon voor wie je reserveert).",
      ],
    },
    {
      heading: "Annulering",
      paragraphs: [
        "Je kunt gratis annuleren tot 24 uur van tevoren, via de bevestigingslink.",
        "Binnen 24 uur bel je Ainhoa om te wijzigen of te annuleren. Er wordt niets automatisch afgeschreven.",
      ],
    },
    {
      heading: "Je gegevens",
      paragraphs: [
        "Ainhoa Ferrandis Perea bewaart de naam, het telefoonnummer, de e-mail als je die achterlaat en de notitie als je die schrijft, alleen om de sessie te organiseren.",
        "Je kunt vragen om ze te verwijderen wanneer ze niet meer nodig zijn.",
      ],
    },
    {
      heading: "Wat niet wordt gevraagd",
      paragraphs: [
        "Wachtwoorden, codes en bankgegevens worden niet gevraagd. Schrijf ze niet in het formulier.",
      ],
    },
  ],
};

const byLocale: Record<TechLocale, TechConditionsCopy> = { es, en, nl };

export function getTechConditionsCopy(locale: TechLocale): TechConditionsCopy {
  return byLocale[locale] ?? es;
}
