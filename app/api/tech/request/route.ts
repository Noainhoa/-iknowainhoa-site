import { NextResponse } from "next/server";
import { INDIVIDUAL_MINUTES, INDIVIDUAL_PRICE_CENTS } from "@/lib/tech/constants";
import { deliverNotification } from "@/lib/tech/deliver";
import { allowPublicWrite } from "@/lib/tech/guard";
import { ownerRequestEmail } from "@/lib/tech/messages";
import { getTechServiceClient } from "@/lib/tech/server";
import { techBookingManagePath } from "@/lib/tech/seo";
import { requestTimeAllowed } from "@/lib/tech/time";
import { hashToken, newCancelToken, newReference } from "@/lib/tech/tokens";
import { localeFromBody } from "@/lib/tech/locale";
import { validateBooking } from "@/lib/tech/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20_000) return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (text(record.company).trim()) return NextResponse.json({ ok: true, ignored: true });

  const locale = localeFromBody(record.locale);
  const validated = validateBooking({
    contactName: text(record.contactName),
    attendeeName: text(record.attendeeName),
    bookingForOther: record.bookingForOther === true,
    phone: text(record.phone),
    email: text(record.email),
    question: text(record.question),
    acceptTerms: record.acceptTerms === true,
    company: "",
    source: text(record.source) || null,
    locale,
    sessionLanguage: text(record.sessionLanguage),
  });
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.errors[0] }, { status: 400 });
  }

  const idempotencyKey = text(record.idempotencyKey);
  const requestedStart = new Date(text(record.requestedStart));
  if (!UUID.test(idempotencyKey) || Number.isNaN(requestedStart.getTime())) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  if (!requestTimeAllowed(requestedStart, new Date())) {
    return NextResponse.json({ ok: false, error: "tech_too_soon" }, { status: 400 });
  }

  const client = getTechServiceClient();
  if (!client) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });

  try {
    const allowed = await allowPublicWrite(client, request, validated.value.phoneKey, "request");
    if (!allowed) return NextResponse.json({ ok: false, error: "tech_rate" }, { status: 429 });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const token = newCancelToken();
  const reference = newReference();
  const mail = ownerRequestEmail({
    reference,
    startsAt: requestedStart,
    contactName: validated.value.contactName,
    attendeeName: validated.value.attendeeName,
    phone: validated.value.phone,
    email: validated.value.email,
    question: validated.value.question,
    sessionLanguage: validated.value.sessionLanguage,
  });

  const { data, error } = await client.rpc("tech_place_request", {
    payload: {
      idempotency_key: idempotencyKey,
      reference,
      token_hash: hashToken(token),
      requested_start: requestedStart.toISOString(),
      contact_name: validated.value.contactName,
      attendee_name: validated.value.attendeeName,
      booking_for_other: validated.value.bookingForOther,
      phone: validated.value.phone,
      phone_key: validated.value.phoneKey,
      email: validated.value.email,
      question: validated.value.question,
      locale: validated.value.locale,
      session_language: validated.value.sessionLanguage,
      source: validated.value.source,
      subject: mail.subject,
      body: mail.body,
    },
  });

  if (error || !data || data.ok !== true) {
    const code = typeof data?.error === "string" ? data.error : "tech_failed";
    return NextResponse.json({ ok: false, error: code }, { status: 400 });
  }

  const replayed = data.replayed === true;
  let subject = mail.subject;
  let bodyText = mail.body;
  if (replayed && data.notification_id) {
    const { data: note } = await client
      .from("tech_notifications")
      .select("subject, body")
      .eq("id", data.notification_id)
      .maybeSingle();
    if (note) {
      subject = note.subject;
      bodyText = note.body;
    }
  }

  const notification = await deliverNotification(
    client,
    data.notification_id ?? null,
    data.notification_status ?? null,
    subject,
    bodyText
  );

  return NextResponse.json({
    ok: true,
    replayed,
    reference: data.reference,
    token: replayed ? null : token,
    confirmationPath: replayed ? null : techBookingManagePath(token, locale),
    startsAt: data.requested_start ?? requestedStart.toISOString(),
    durationMinutes: INDIVIDUAL_MINUTES,
    priceCents: INDIVIDUAL_PRICE_CENTS,
    venueLabel: "",
    kind: "request",
    notification,
  });
}
