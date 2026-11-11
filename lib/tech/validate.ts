import type { SessionLanguage } from "@/lib/tech/calendar";
import { SOURCES, type TechSource } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";
import { normalizePhone } from "@/lib/tech/phone";

const SECRET_PATTERN = /(?:contraseña|password|clave\s+pin|\bpin\b)\s*[:=]/i;

export type BookingInput = {
  contactName: string;
  attendeeName: string;
  bookingForOther: boolean;
  phone: string;
  email: string;
  question: string;
  acceptTerms: boolean;
  company: string;
  source: string | null;
  locale: TechLocale;
  sessionLanguage: SessionLanguage | string | null;
};

export type CleanBooking = {
  contactName: string;
  attendeeName: string;
  bookingForOther: boolean;
  phone: string;
  phoneKey: string;
  email: string | null;
  question: string | null;
  source: TechSource | null;
  locale: TechLocale;
  sessionLanguage: SessionLanguage;
};

export type FieldError =
  | "name"
  | "attendee"
  | "phone"
  | "email"
  | "question"
  | "secret"
  | "terms"
  | "sessionLanguage";

export function readSource(value: string | null | undefined): TechSource | null {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase();
  return SOURCES.includes(cleaned as TechSource) ? (cleaned as TechSource) : null;
}

function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validateBooking(input: BookingInput): { ok: true; value: CleanBooking } | { ok: false; errors: FieldError[] } {
  const errors: FieldError[] = [];
  const contactName = cleanName(input.contactName);
  const attendeeName = input.bookingForOther ? cleanName(input.attendeeName) : contactName;
  if (contactName.length < 1 || contactName.length > 80) errors.push("name");
  if (input.bookingForOther && (attendeeName.length < 1 || attendeeName.length > 80)) {
    errors.push("attendee");
  }
  const phoneKey = normalizePhone(input.phone);
  if (!phoneKey) errors.push("phone");
  const email = input.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email");
  if (email.length > 120) errors.push("email");
  const question = input.question.trim();
  if (question.length > 400) errors.push("question");
  if (question && SECRET_PATTERN.test(question)) errors.push("secret");
  if (!input.acceptTerms) errors.push("terms");
  const sessionLanguage = input.sessionLanguage === "en" || input.sessionLanguage === "es" ? input.sessionLanguage : null;
  if (!sessionLanguage) errors.push("sessionLanguage");
  if (errors.length || !phoneKey || !sessionLanguage) return { ok: false, errors };

  return {
    ok: true,
    value: {
      contactName,
      attendeeName,
      bookingForOther: input.bookingForOther,
      phone: input.phone.trim(),
      phoneKey,
      email: email || null,
      question: question || null,
      source: readSource(input.source),
      locale: input.locale,
      sessionLanguage,
    },
  };
}

export type TestimonialError = "name" | "quote" | "place" | "consent" | "secret";

export type CleanTestimonial = {
  displayName: string;
  body: string;
  place: string | null;
  locale: TechLocale;
};

export function validateTestimonial(input: {
  displayName: string;
  body: string;
  place: string;
  consent: boolean;
  locale: TechLocale;
}): { ok: true; value: CleanTestimonial } | { ok: false; errors: TestimonialError[] } {
  const errors: TestimonialError[] = [];
  const displayName = cleanName(input.displayName);
  const body = input.body.trim().replace(/\s+/g, " ");
  const place = cleanName(input.place);
  if (displayName.length < 1 || displayName.length > 60) errors.push("name");
  if (body.length < 8 || body.length > 400) errors.push("quote");
  if (place.length > 80) errors.push("place");
  if (body && SECRET_PATTERN.test(body)) errors.push("secret");
  if (!input.consent) errors.push("consent");
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      displayName,
      body,
      place: place || null,
      locale: input.locale,
    },
  };
}

export function notificationOutcome(emailSent: boolean): {
  bookingKept: true;
  notification: "sent" | "failed";
} {
  return { bookingKept: true, notification: emailSent ? "sent" : "failed" };
}
