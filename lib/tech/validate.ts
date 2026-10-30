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
  acceptAttendance: boolean;
  acceptCancellation: boolean;
  acceptPrivacy: boolean;
  company: string;
  source: string | null;
  locale: TechLocale;
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
};

export type FieldError =
  | "name"
  | "attendee"
  | "phone"
  | "email"
  | "question"
  | "secret"
  | "attendance"
  | "cancellation"
  | "privacy";

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
  if (!input.acceptAttendance) errors.push("attendance");
  if (!input.acceptCancellation) errors.push("cancellation");
  if (!input.acceptPrivacy) errors.push("privacy");
  if (errors.length || !phoneKey) return { ok: false, errors };

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
    },
  };
}

export function notificationOutcome(emailSent: boolean): {
  bookingKept: true;
  notification: "sent" | "failed";
} {
  return { bookingKept: true, notification: emailSent ? "sent" : "failed" };
}
