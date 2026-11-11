import { NextResponse } from "next/server";
import {
  GROUP_MINUTES,
  GROUP_PRICE_CENTS,
  INDIVIDUAL_MINUTES,
  INDIVIDUAL_PRICE_CENTS,
} from "@/lib/tech/constants";
import { deliverNotification } from "@/lib/tech/deliver";
import { allowPublicWrite } from "@/lib/tech/guard";
import { sendCustomerMail } from "@/lib/tech/mail";
import { customerBookingEmail, ownerBookingEmail } from "@/lib/tech/messages";
import { getTechServiceClient } from "@/lib/tech/server";
import { techBookingManagePath } from "@/lib/tech/seo";
import { hashToken, isReference, newCancelToken, newReference } from "@/lib/tech/tokens";
import { localeFromBody } from "@/lib/tech/locale";
import { validateBooking } from "@/lib/tech/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20_000) return null;
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  if (text(body.company).trim()) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const locale = localeFromBody(body.locale);
  const validated = validateBooking({
    contactName: text(body.contactName),
    attendeeName: text(body.attendeeName),
    bookingForOther: body.bookingForOther === true,
    phone: text(body.phone),
    email: text(body.email),
    question: text(body.question),
    acceptTerms: body.acceptTerms === true,
    company: "",
    source: text(body.source) || null,
    locale,
    sessionLanguage: text(body.sessionLanguage),
  });
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.errors[0] }, { status: 400 });
  }

  const sessionId = text(body.sessionId);
  const startsAtRaw = text(body.startsAt);
  const createKind = text(body.kind);
  const idempotencyKey = text(body.idempotencyKey);
  const isCreate = !sessionId && Boolean(startsAtRaw);
  const isJoin = Boolean(sessionId);

  if (!UUID.test(idempotencyKey)) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  if (isJoin && !UUID.test(sessionId)) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  if (isCreate && createKind !== "group" && createKind !== "individual") {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  if (!isJoin && !isCreate) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  if (isCreate) {
    const starts = new Date(startsAtRaw);
    if (Number.isNaN(starts.getTime())) {
      return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
    }
  }

  const client = getTechServiceClient();
  if (!client) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });

  try {
    const allowed = await allowPublicWrite(client, request, validated.value.phoneKey, "book");
    if (!allowed) return NextResponse.json({ ok: false, error: "tech_rate" }, { status: 429 });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const token = newCancelToken();
  const reference = newReference();
  if (!isReference(reference)) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 500 });
  }

  let kindForMail: "group" | "individual" = "group";
  let startsForMail = new Date();
  let venueForMail = "";

  if (isJoin) {
    const { data: sessionRow, error: sessionError } = await client
      .from("tech_sessions")
      .select("kind, starts_at, venue_label, session_language")
      .eq("id", sessionId)
      .maybeSingle();
    if (sessionError || !sessionRow) {
      return NextResponse.json({ ok: false, error: "tech_not_bookable" }, { status: 400 });
    }
    if (sessionRow.session_language !== validated.value.sessionLanguage) {
      return NextResponse.json({ ok: false, error: "tech_language_mismatch" }, { status: 409 });
    }
    kindForMail = sessionRow.kind as "group" | "individual";
    startsForMail = new Date(sessionRow.starts_at);
    venueForMail = sessionRow.venue_label;
  } else {
    kindForMail = createKind as "group" | "individual";
    startsForMail = new Date(startsAtRaw);
    const { data: settings } = await client
      .from("tech_calendar_settings")
      .select("default_venue_label")
      .eq("id", 1)
      .maybeSingle();
    venueForMail = settings?.default_venue_label || "Guardamar del Segura";
  }

  const mail = ownerBookingEmail({
    reference,
    kind: kindForMail,
    startsAt: startsForMail,
    contactName: validated.value.contactName,
    attendeeName: validated.value.attendeeName,
    phone: validated.value.phone,
    email: validated.value.email,
    question: validated.value.question,
    venue: venueForMail,
    sessionLanguage: validated.value.sessionLanguage,
  });

  const { data, error } = isJoin
    ? await client.rpc("tech_place_booking", {
        payload: {
          session_id: sessionId,
          idempotency_key: idempotencyKey,
          reference,
          token_hash: hashToken(token),
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
      })
    : await client.rpc("tech_create_and_book", {
        payload: {
          kind: createKind,
          starts_at: new Date(startsAtRaw).toISOString(),
          idempotency_key: idempotencyKey,
          reference,
          token_hash: hashToken(token),
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
          venue_label: venueForMail,
          subject: mail.subject,
          body: mail.body,
        },
      });

  if (error || !data || data.ok !== true) {
    const code = typeof data?.error === "string" ? data.error : "tech_failed";
    const status =
      code === "tech_full" ||
      code === "tech_duplicate" ||
      code === "tech_week_full" ||
      code === "tech_overlap" ||
      code === "tech_language_mismatch"
        ? 409
        : 400;
    return NextResponse.json({ ok: false, error: code }, { status });
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

  const kind = (data.kind ?? kindForMail) as "group" | "individual";
  const durationMinutes =
    typeof data.duration_minutes === "number"
      ? data.duration_minutes
      : kind === "group"
        ? GROUP_MINUTES
        : INDIVIDUAL_MINUTES;
  const priceCents =
    typeof data.price_cents === "number"
      ? data.price_cents
      : kind === "group"
        ? GROUP_PRICE_CENTS
        : INDIVIDUAL_PRICE_CENTS;
  const startsAt = data.starts_at ?? startsForMail.toISOString();
  const venueLabel = data.venue_label ?? venueForMail;

  let customerNotification: "sent" | "failed" | "skipped" = "skipped";
  if (!replayed && validated.value.email) {
    try {
      const customerMail = customerBookingEmail({
        locale: validated.value.locale,
        reference: String(data.reference ?? reference),
        kind,
        startsAt: new Date(startsAt),
        durationMinutes,
        priceCents,
        venue: venueLabel,
        manageToken: token,
      });
      await sendCustomerMail(validated.value.email, customerMail.subject, customerMail.body);
      customerNotification = "sent";
    } catch {
      customerNotification = "failed";
    }
  }

  return NextResponse.json({
    ok: true,
    replayed,
    joined: data.joined === true,
    reference: data.reference,
    token: replayed ? null : token,
    confirmationPath: replayed ? null : techBookingManagePath(token, locale),
    startsAt,
    durationMinutes,
    priceCents,
    venueLabel,
    kind,
    notification,
    customerNotification,
  });
}
