import {
  BUSY_BUFFER_MINUTES,
  SESSION_MINUTES,
  TECH_TIMEZONE,
  WEEKLY_SLOT_CAP,
} from "@/lib/tech/constants";
import { intervalsOverlap, madridDayKey, madridLocalToUtc, type Interval } from "@/lib/tech/time";

export type WeeklyBusyBlock = {
  weekday: number; // ISO 1=Mon … 7=Sun
  startMinute: number;
  endMinute: number;
  label?: string | null;
};

export type WeeklyBusyRowLike = WeeklyBusyBlock & { id: string };

/** Fixed bookable window for the admin weekly template grid (08:00–20:00 Madrid). */
export const TEMPLATE_DAY_OPEN_MINUTE = 8 * 60;
export const TEMPLATE_DAY_CLOSE_MINUTE = 20 * 60;

export type CalendarSettings = {
  enabled: boolean;
  dayOpenMinute: number;
  dayCloseMinute: number;
  bufferMinutes: number;
  defaultVenueLabel: string;
};

export type BusyHourTogglePlan = {
  deleteIds: string[];
  updates: Array<{ id: string; startMinute: number; endMinute: number }>;
  inserts: Array<{
    weekday: number;
    startMinute: number;
    endMinute: number;
    label: null;
  }>;
};

export type SessionLanguage = "es" | "en";

export type PublicSessionSlot = {
  id: string;
  kind: "group" | "individual";
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  seatsLeft: number;
  priceCents: number;
  venueLabel: string;
  sessionLanguage: SessionLanguage;
};

export type ClosedRange = { startsAt: string; endsAt: string };

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): number {
  const value = parts.find((item) => item.type === type)?.value ?? "0";
  return Number(value);
}

export function madridIsoWeekday(instant: Date): number {
  const weekday = new Intl.DateTimeFormat("en-GB", {
    timeZone: TECH_TIMEZONE,
    weekday: "short",
  }).format(instant);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[weekday] ?? 1;
}

export function madridMinuteOfDay(instant: Date): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TECH_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(instant);
  let hour = part(parts, "hour");
  if (hour === 24) hour = 0;
  return hour * 60 + part(parts, "minute");
}

/** ISO week key in Madrid, e.g. 2026-W45 */
export function madridIsoWeekKey(instant: Date): string {
  const day = madridDayKey(instant);
  const [y, m, d] = day.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function minuteToHhMm(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function rangesOverlapMinutes(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function slotHitsBusy(
  startMinute: number,
  durationMinutes: number,
  busy: WeeklyBusyBlock[],
  weekday: number,
  bufferMinutes = BUSY_BUFFER_MINUTES
): boolean {
  const endMinute = startMinute + durationMinutes;
  for (const block of busy) {
    if (block.weekday !== weekday) continue;
    const busyStart = Math.max(0, block.startMinute - bufferMinutes);
    const busyEnd = Math.min(1440, block.endMinute + bufferMinutes);
    if (rangesOverlapMinutes(startMinute, endMinute, busyStart, busyEnd)) return true;
  }
  return false;
}

export function isClosedDay(dayKey: string, closed: ClosedRange[]): boolean {
  const dayStart = madridLocalToUtc(dayKey, "00:00");
  const [y, m, d] = dayKey.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const nextKey = next.toISOString().slice(0, 10);
  const dayEnd = madridLocalToUtc(nextKey, "00:00");
  const dayInterval: Interval = { startMs: dayStart.getTime(), endMs: dayEnd.getTime() };
  return closed.some((range) =>
    intervalsOverlap(dayInterval, {
      startMs: new Date(range.startsAt).getTime(),
      endMs: new Date(range.endsAt).getTime(),
    })
  );
}

export function eachDateInclusive(from: string, to: string): string[] {
  const out: string[] = [];
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const cursor = new Date(Date.UTC(fy, fm - 1, fd));
  const end = new Date(Date.UTC(ty, tm - 1, td));
  while (cursor.getTime() <= end.getTime()) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/**
 * Bookable 1h start instants for creating a new session.
 * Empty when the calendar template is not enabled.
 */
export function computeBookableStarts(args: {
  settings: CalendarSettings;
  busy: WeeklyBusyBlock[];
  closed: ClosedRange[];
  occupied: Interval[];
  slotsByWeek: Map<string, number>;
  fromDate: string;
  toDate: string;
  now?: Date;
}): string[] {
  const { settings, busy, closed, occupied, slotsByWeek, fromDate, toDate } = args;
  const now = args.now ?? new Date();
  if (!settings.enabled) return [];

  const starts: string[] = [];
  const buffer = settings.bufferMinutes;
  for (const day of eachDateInclusive(fromDate, toDate)) {
    if (isClosedDay(day, closed)) continue;
    const sample = madridLocalToUtc(day, "12:00");
    const weekday = madridIsoWeekday(sample);
    const weekKey = madridIsoWeekKey(sample);
    if ((slotsByWeek.get(weekKey) ?? 0) >= WEEKLY_SLOT_CAP) continue;

    for (
      let minute = settings.dayOpenMinute;
      minute + SESSION_MINUTES <= settings.dayCloseMinute;
      minute += 60
    ) {
      if (slotHitsBusy(minute, SESSION_MINUTES, busy, weekday, buffer)) continue;
      let instant: Date;
      try {
        instant = madridLocalToUtc(day, minuteToHhMm(minute));
      } catch {
        continue;
      }
      if (instant.getTime() <= now.getTime()) continue;
      const candidate: Interval = {
        startMs: instant.getTime(),
        endMs: instant.getTime() + SESSION_MINUTES * 60 * 1000,
      };
      if (occupied.some((item) => intervalsOverlap(item, candidate))) continue;
      starts.push(instant.toISOString());
    }
  }
  return starts;
}

export function nextJoinableGroup(sessions: PublicSessionSlot[], now = new Date()): PublicSessionSlot | null {
  const open = sessions
    .filter(
      (session) =>
        session.kind === "group" &&
        session.seatsLeft > 0 &&
        new Date(session.startsAt).getTime() > now.getTime()
    )
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return open[0] ?? null;
}

export function countSlotsByWeek(sessions: { startsAt: string; status?: string }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const session of sessions) {
    const key = madridIsoWeekKey(new Date(session.startsAt));
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function buildMonthCells(view: { year: number; month: number }): Array<{ iso: string | null }> {
  const first = new Date(Date.UTC(view.year, view.month - 1, 1));
  const firstWeekday = ((first.getUTCDay() + 6) % 7) + 1; // Mon=1
  const daysInMonth = new Date(Date.UTC(view.year, view.month, 0)).getUTCDate();
  const cells: Array<{ iso: string | null }> = [];
  for (let i = 1; i < firstWeekday; i++) cells.push({ iso: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${view.year}-${String(view.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ iso });
  }
  while (cells.length % 7 !== 0) cells.push({ iso: null });
  return cells;
}

/** 1-hour starts from 08:00 through 19:00 (last slot ends at 20:00). */
export function templateHourStarts(): number[] {
  const out: number[] = [];
  for (
    let minute = TEMPLATE_DAY_OPEN_MINUTE;
    minute + SESSION_MINUTES <= TEMPLATE_DAY_CLOSE_MINUTE;
    minute += 60
  ) {
    out.push(minute);
  }
  return out;
}

export function hourIsWeeklyBusy(
  busy: Array<{ weekday: number; startMinute: number; endMinute: number }>,
  weekday: number,
  hourStart: number
): boolean {
  const hourEnd = hourStart + SESSION_MINUTES;
  return busy.some(
    (block) =>
      block.weekday === weekday &&
      rangesOverlapMinutes(hourStart, hourEnd, block.startMinute, block.endMinute)
  );
}

/**
 * Plan insert/update/delete ops so one template hour cell toggles free ↔ busy
 * without dropping unrelated minutes from multi-hour blocks.
 */
export function planBusyHourToggle(
  busy: WeeklyBusyRowLike[],
  weekday: number,
  hourStart: number
): BusyHourTogglePlan {
  const hourEnd = hourStart + SESSION_MINUTES;
  const overlapping = busy.filter(
    (block) =>
      block.weekday === weekday &&
      rangesOverlapMinutes(hourStart, hourEnd, block.startMinute, block.endMinute)
  );

  if (overlapping.length === 0) {
    return {
      deleteIds: [],
      updates: [],
      inserts: [{ weekday, startMinute: hourStart, endMinute: hourEnd, label: null }],
    };
  }

  const deleteIds: string[] = [];
  const updates: BusyHourTogglePlan["updates"] = [];
  const inserts: BusyHourTogglePlan["inserts"] = [];

  for (const block of overlapping) {
    const keepLeft = block.startMinute < hourStart;
    const keepRight = block.endMinute > hourEnd;
    if (keepLeft && keepRight) {
      updates.push({ id: block.id, startMinute: block.startMinute, endMinute: hourStart });
      inserts.push({
        weekday,
        startMinute: hourEnd,
        endMinute: block.endMinute,
        label: null,
      });
    } else if (keepLeft) {
      updates.push({ id: block.id, startMinute: block.startMinute, endMinute: hourStart });
    } else if (keepRight) {
      updates.push({ id: block.id, startMinute: hourEnd, endMinute: block.endMinute });
    } else {
      deleteIds.push(block.id);
    }
  }

  return { deleteIds, updates, inserts };
}

export function applyBusyHourToggleLocal(
  busy: WeeklyBusyRowLike[],
  weekday: number,
  hourStart: number,
  newId: () => string = () => crypto.randomUUID()
): WeeklyBusyRowLike[] {
  const plan = planBusyHourToggle(busy, weekday, hourStart);
  const removed = new Set(plan.deleteIds);
  const byId = new Map(plan.updates.map((row) => [row.id, row]));
  const next = busy
    .filter((row) => !removed.has(row.id))
    .map((row) => {
      const update = byId.get(row.id);
      if (!update) return row;
      return {
        ...row,
        startMinute: update.startMinute,
        endMinute: update.endMinute,
      };
    });
  for (const insert of plan.inserts) {
    next.push({
      id: newId(),
      weekday: insert.weekday,
      startMinute: insert.startMinute,
      endMinute: insert.endMinute,
      label: insert.label,
    });
  }
  return next;
}
