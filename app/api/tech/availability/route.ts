import { NextResponse } from "next/server";
import {
  computeBookableStarts,
  countSlotsByWeek,
  nextJoinableGroup,
  type CalendarSettings,
  type ClosedRange,
  type PublicSessionSlot,
  type WeeklyBusyBlock,
} from "@/lib/tech/calendar";
import { getTechServiceClient } from "@/lib/tech/server";
import { madridDayKey } from "@/lib/tech/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const client = getTechServiceClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const url = new URL(request.url);
  const today = madridDayKey(new Date());
  const from = url.searchParams.get("from") || today;
  let to = url.searchParams.get("to") || addDays(today, 41);
  if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }
  // Cap range to keep responses small.
  if (addDays(from, 62) < to) to = addDays(from, 62);

  const [{ data: settingsRow }, { data: busyRows }, { data: blockRows }, { data: sessionRows }] =
    await Promise.all([
      client.from("tech_calendar_settings").select("*").eq("id", 1).maybeSingle(),
      client.from("tech_weekly_busy").select("weekday, start_minute, end_minute, label"),
      client
        .from("tech_blocks")
        .select("starts_at, ends_at")
        .lt("starts_at", `${addDays(to, 1)}T23:59:59Z`)
        .gt("ends_at", `${from}T00:00:00Z`),
      client
        .from("tech_sessions")
        .select("id, kind, starts_at, duration_minutes, capacity, price_cents, venue_label, status, session_language")
        .in("status", ["published", "completed"])
        .gte("starts_at", `${addDays(from, -7)}T00:00:00Z`)
        .lte("starts_at", `${addDays(to, 7)}T23:59:59Z`)
        .order("starts_at", { ascending: true }),
    ]);

  const settings: CalendarSettings = {
    enabled: settingsRow?.enabled === true,
    dayOpenMinute: settingsRow?.day_open_minute ?? 540,
    dayCloseMinute: settingsRow?.day_close_minute ?? 1080,
    bufferMinutes: settingsRow?.buffer_minutes ?? 15,
    defaultVenueLabel: settingsRow?.default_venue_label ?? "Guardamar del Segura",
  };

  const busy: WeeklyBusyBlock[] = (busyRows ?? []).map((row) => ({
    weekday: row.weekday,
    startMinute: row.start_minute,
    endMinute: row.end_minute,
    label: row.label,
  }));

  const closed: ClosedRange[] = (blockRows ?? []).map((row) => ({
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  }));

  const now = new Date();
  const published = (sessionRows ?? []).filter((row) => row.status === "published");
  const ids = published.map((row) => row.id);
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

  const sessions: PublicSessionSlot[] = published
    .filter((row) => new Date(row.starts_at).getTime() > now.getTime())
    .map((row) => {
      const taken = counts.get(row.id) ?? 0;
      return {
        id: row.id,
        kind: row.kind as "group" | "individual",
        startsAt: row.starts_at,
        durationMinutes: row.duration_minutes,
        capacity: row.capacity,
        seatsLeft: Math.max(0, row.capacity - taken),
        priceCents: row.price_cents,
        venueLabel: row.venue_label,
        sessionLanguage: row.session_language === "en" ? "en" : "es",
      };
    });

  const occupied = (sessionRows ?? []).map((row) => {
    const startMs = new Date(row.starts_at).getTime();
    return { startMs, endMs: startMs + row.duration_minutes * 60 * 1000 };
  });

  const slotsByWeek = countSlotsByWeek(
    (sessionRows ?? []).map((row) => ({ startsAt: row.starts_at }))
  );

  const bookableStarts = computeBookableStarts({
    settings,
    busy,
    closed,
    occupied,
    slotsByWeek,
    fromDate: from,
    toDate: to,
    now,
  });

  const weekCounts: Record<string, number> = {};
  for (const [key, value] of slotsByWeek) weekCounts[key] = value;

  return NextResponse.json(
    {
      ok: true,
      templateReady: settings.enabled,
      settings: {
        dayOpenMinute: settings.dayOpenMinute,
        dayCloseMinute: settings.dayCloseMinute,
        bufferMinutes: settings.bufferMinutes,
      },
      closedDates: closed,
      busy,
      sessions,
      bookableStarts,
      nextJoinableGroup: nextJoinableGroup(sessions, now),
      weekSlotCounts: weekCounts,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
