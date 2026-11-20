import { NextResponse } from "next/server";
import { normalizeParkingPlate } from "@/lib/parking/plate";
import { site } from "@/lib/site";
import { sendOwnerMail, smtpConfigured } from "@/lib/tech/mail";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

type FeedbackBody = {
  message?: unknown;
  mood?: unknown;
  reference?: unknown;
  locale?: unknown;
  pageUrl?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
};

const MOOD_TO_STORED: Record<string, "good" | "ok" | "problem"> = {
  up: "good",
  down: "problem",
  good: "good",
  ok: "ok",
  problem: "problem",
};

function asTrimmedString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function moodLabel(mood: string | null): string {
  if (mood === "good") return "Thumbs up";
  if (mood === "ok") return "Regular / OK";
  if (mood === "problem") return "Thumbs down";
  return "—";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as FeedbackBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = asTrimmedString(body.message, 1000);
  const reference =
    normalizeParkingPlate(asTrimmedString(body.reference, 12), 12) || null;
  const locale = asTrimmedString(body.locale, 8) || null;
  const pageUrl = asTrimmedString(body.pageUrl, 500) || null;
  const moodRaw = asTrimmedString(body.mood, 16).toLowerCase();
  const mood = MOOD_TO_STORED[moodRaw] ?? null;
  const contactName = asTrimmedString(body.contactName, 80) || null;
  const contactEmail = asTrimmedString(body.contactEmail, 120) || null;
  const contactPhone = asTrimmedString(body.contactPhone, 40) || null;

  if (message.length < 3) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("parking_submit_feedback", {
    p_message: message,
    p_mood: mood,
    p_reference: reference,
    p_locale: locale,
    p_page_url: pageUrl,
    p_contact_name: contactName,
    p_contact_email: contactEmail,
    p_contact_phone: contactPhone,
  });

  if (error) {
    console.error("[parking-feedback] save failed", error.message);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  if (smtpConfigured()) {
    try {
      await sendOwnerMail(
        `Parking feedback${mood ? ` · ${mood}` : ""}`,
        [
          "Nuevo feedback privado — Parking Guardamar Centro",
          "",
          `Mood: ${moodLabel(mood)}`,
          `Reference: ${reference || "—"}`,
          `Contact name: ${contactName || "—"}`,
          `Contact email: ${contactEmail || "—"}`,
          `Contact phone: ${contactPhone || "—"}`,
          `Locale: ${locale || "—"}`,
          `Page: ${pageUrl || "—"}`,
          `Id: ${id ?? "—"}`,
          "",
          "Message:",
          message,
          "",
          `Inbox: ${site.email}`,
        ].join("\n")
      );
    } catch (mailError) {
      console.error(
        "[parking-feedback] email failed",
        mailError instanceof Error ? mailError.message : mailError
      );
      // Feedback is already saved; do not fail the client for mail issues.
    }
  }

  return NextResponse.json({ ok: true, id: id ?? null });
}
