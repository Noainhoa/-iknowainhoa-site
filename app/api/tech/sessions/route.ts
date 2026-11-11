import { NextResponse } from "next/server";
import { getTechServiceClient } from "@/lib/tech/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const client = getTechServiceClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const now = new Date().toISOString();
  const { data: sessions, error } = await client
    .from("tech_sessions")
    .select("id, kind, starts_at, duration_minutes, capacity, price_cents, venue_label")
    .eq("status", "published")
    .eq("venue_public", true)
    .gt("starts_at", now)
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 500 });
  }

  const rows = sessions ?? [];
  const ids = rows.map((row) => row.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: bookings, error: countError } = await client
      .from("tech_bookings")
      .select("session_id")
      .eq("status", "confirmed")
      .in("session_id", ids);
    if (countError) {
      return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 500 });
    }
    for (const booking of bookings ?? []) {
      counts.set(booking.session_id, (counts.get(booking.session_id) ?? 0) + 1);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      sessions: rows.map((row) => {
        const taken = counts.get(row.id) ?? 0;
        return {
          id: row.id,
          kind: row.kind,
          startsAt: row.starts_at,
          durationMinutes: row.duration_minutes,
          capacity: row.capacity,
          seatsLeft: Math.max(0, row.capacity - taken),
          priceCents: row.price_cents,
          venueLabel: row.venue_label,
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
