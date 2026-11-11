import { NextResponse } from "next/server";
import { allowRate, clientAddress, rateBucket } from "@/lib/tech/guard";
import { RATE_MAX_PER_IP } from "@/lib/tech/constants";
import { localeFromBody } from "@/lib/tech/locale";
import { getTechServiceClient } from "@/lib/tech/server";
import { validateTestimonial } from "@/lib/tech/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function GET() {
  const client = getTechServiceClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const { data, error } = await client
    .from("tech_testimonials")
    .select("id, display_name, body, place")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      testimonials: (data ?? []).map((row) => ({
        id: row.id,
        name: row.display_name,
        body: row.body,
        place: row.place,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 8_000) return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (text(record.website).trim()) return NextResponse.json({ ok: true, ignored: true });

  const validated = validateTestimonial({
    displayName: text(record.name),
    body: text(record.body),
    place: text(record.place),
    consent: record.consent === true,
    locale: localeFromBody(record.locale),
  });
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.errors[0] }, { status: 400 });
  }

  const client = getTechServiceClient();
  if (!client) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });

  try {
    const allowed = await allowRate(
      client,
      rateBucket("testimonial-ip", clientAddress(request)),
      RATE_MAX_PER_IP
    );
    if (!allowed) return NextResponse.json({ ok: false, error: "tech_rate" }, { status: 429 });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const { error } = await client.from("tech_testimonials").insert({
    display_name: validated.value.displayName,
    body: validated.value.body,
    place: validated.value.place,
    locale: validated.value.locale,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
