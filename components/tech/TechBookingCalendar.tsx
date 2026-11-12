"use client";

import { useMemo, useState } from "react";
import { buildMonthCells, madridIsoWeekKey, minuteToHhMm } from "@/lib/tech/calendar";
import type { TechCopy } from "@/lib/tech/i18n";
import type { TechLocale } from "@/lib/tech/locale";
import { formatMadrid, madridDayKey, madridLocalToUtc } from "@/lib/tech/time";

export type CalendarSession = {
  id: string;
  kind: "group" | "individual";
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  seatsLeft: number;
  priceCents: number;
  venueLabel: string;
  sessionLanguage?: "es" | "en";
};

export type CalendarSelection =
  | { mode: "join"; session: CalendarSession }
  | {
      mode: "create";
      startsAt: string;
      kind: "group" | "individual";
      durationMinutes: number;
    };

export type BookingProduct = "group" | "individual60" | "individual30";

type Props = {
  copy: TechCopy;
  locale: TechLocale;
  templateReady: boolean;
  sessions: CalendarSession[];
  bookableStarts: string[];
  nextJoinableGroup: CalendarSession | null;
  weekSlotCounts: Record<string, number>;
  dayOpenMinute: number;
  dayCloseMinute: number;
  selection: CalendarSelection | null;
  onSelect: (next: CalendarSelection | null) => void;
  preferredProduct: BookingProduct;
  onPreferredProduct: (product: BookingProduct) => void;
};

function todayMadrid(): string {
  return madridDayKey(new Date());
}

function monthLabel(year: number, month: number, locale: TechLocale): string {
  const tag = locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : "es-ES";
  return new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1))
  );
}

function weekdayLetters(locale: TechLocale): string[] {
  if (locale === "en") return ["M", "T", "W", "T", "F", "S", "S"];
  if (locale === "nl") return ["M", "D", "W", "D", "V", "Z", "Z"];
  return ["L", "M", "X", "J", "V", "S", "D"];
}

export default function TechBookingCalendar({
  copy,
  locale,
  templateReady,
  sessions,
  bookableStarts,
  nextJoinableGroup,
  weekSlotCounts,
  dayOpenMinute,
  dayCloseMinute,
  selection,
  onSelect,
  preferredProduct,
  onPreferredProduct,
}: Props) {
  const preferredKind = preferredProduct === "group" ? "group" : "individual";
  const preferredDuration = preferredProduct === "individual30" ? 30 : 60;
  const today = todayMadrid();
  const [y, m] = today.split("-").map(Number);
  const [view, setView] = useState({ year: y, month: m });
  const [day, setDay] = useState<string | null>(null);

  const cells = useMemo(() => buildMonthCells(view), [view]);
  const bookableByDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const iso of bookableStarts) {
      const key = madridDayKey(new Date(iso));
      const list = map.get(key) ?? [];
      list.push(iso);
      map.set(key, list);
    }
    return map;
  }, [bookableStarts]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const session of sessions) {
      const key = madridDayKey(new Date(session.startsAt));
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    }
    return map;
  }, [sessions]);

  const hourRows = useMemo(() => {
    const rows: number[] = [];
    for (let minute = dayOpenMinute; minute + 60 <= dayCloseMinute; minute += 60) {
      rows.push(minute);
    }
    return rows;
  }, [dayOpenMinute, dayCloseMinute]);

  function shiftMonth(delta: number) {
    const base = new Date(Date.UTC(view.year, view.month - 1 + delta, 1));
    setView({ year: base.getUTCFullYear(), month: base.getUTCMonth() + 1 });
    setDay(null);
    onSelect(null);
  }

  const daySessions = day ? sessionsByDay.get(day) ?? [] : [];
  const dayFree = day ? bookableByDay.get(day) ?? [] : [];
  const weekKey = day ? madridIsoWeekKey(madridLocalToUtc(day, "12:00")) : null;
  const weekFull = weekKey ? (weekSlotCounts[weekKey] ?? 0) >= 3 : false;

  function cellState(iso: string | null): string {
    if (!iso) return "empty";
    if (iso < today) return "past";
    if (iso === day) return "selected";
    const hasJoinable = (sessionsByDay.get(iso) ?? []).some((s) => s.kind === "group" && s.seatsLeft > 0);
    const hasPrivate = (sessionsByDay.get(iso) ?? []).some((s) => s.kind === "individual");
    const hasFree = (bookableByDay.get(iso) ?? []).length > 0;
    if (hasJoinable) return "group";
    if (hasPrivate && !hasFree) return "private";
    if (hasFree) return "free";
    if ((sessionsByDay.get(iso) ?? []).length) return "busy";
    return "closed";
  }

  return (
    <div className="tme-cal">
      {nextJoinableGroup ? (
        <button
          type="button"
          className="tme-next-group"
          onClick={() => {
            onPreferredProduct("group");
            onSelect({ mode: "join", session: nextJoinableGroup });
            setDay(madridDayKey(new Date(nextJoinableGroup.startsAt)));
          }}
        >
          <span className="tme-next-group-k">{copy.nextGroupLabel}</span>
          <strong>{formatMadrid(new Date(nextJoinableGroup.startsAt), locale)}</strong>
          <span>
            {nextJoinableGroup.seatsLeft === 1
              ? copy.seatsOne
              : copy.seatsMany.replace("{n}", String(nextJoinableGroup.seatsLeft))}
          </span>
        </button>
      ) : copy.nextGroupEmpty ? (
        <p className="tme-note" role="status">
          {copy.nextGroupEmpty}
        </p>
      ) : null}

      {!templateReady ? (
        <p className="tme-note" role="status">
          {copy.calendarOff}
        </p>
      ) : null}

      <div className="tme-cal-legend" aria-hidden="true">
        <span>
          <i className="tme-swatch is-group" /> {copy.legendGroup}
        </span>
        <span>
          <i className="tme-swatch is-private" /> {copy.legendPrivate}
        </span>
        <span>
          <i className="tme-swatch is-free" /> {copy.legendFree}
        </span>
        <span>
          <i className="tme-swatch is-closed" /> {copy.legendClosed}
        </span>
      </div>
      <p className="tme-hint">{copy.hourHint}</p>

      <div className="tme-cal-nav">
        <button
          type="button"
          className="tme-secondary"
          onClick={() => shiftMonth(-1)}
          aria-label={locale === "en" ? "Previous month" : locale === "nl" ? "Vorige maand" : "Mes anterior"}
        >
          ‹
        </button>
        <strong className="tme-cal-range">{monthLabel(view.year, view.month, locale)}</strong>
        <button
          type="button"
          className="tme-secondary"
          onClick={() => shiftMonth(1)}
          aria-label={locale === "en" ? "Next month" : locale === "nl" ? "Volgende maand" : "Mes siguiente"}
        >
          ›
        </button>
      </div>

      <div className="tme-weekdays" aria-hidden="true">
        {(locale === "en"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : weekdayLetters(locale)
        ).map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="tme-grid" role="grid" aria-label={copy.choose}>
        {cells.map((cell, index) => {
          const state = cellState(cell.iso);
          if (!cell.iso || state === "past" || state === "closed" || state === "busy") {
            return (
              <div key={`${cell.iso ?? "e"}-${index}`} className={`tme-cell ${state}`} aria-hidden={!cell.iso}>
                {cell.iso ? Number(cell.iso.slice(-2)) : ""}
              </div>
            );
          }
          return (
            <button
              key={cell.iso}
              type="button"
              className={`tme-cell day ${state}`}
              aria-pressed={day === cell.iso}
              onClick={() => {
                setDay(cell.iso);
                onSelect(null);
              }}
            >
              {Number(cell.iso.slice(-2))}
            </button>
          );
        })}
      </div>

      {day ? (
        <div className="tme-hours">
          <h3 style={{ fontSize: 18, margin: "16px 0 8px" }}>
            {formatMadrid(madridLocalToUtc(day, "12:00"), locale).replace(/,.*/, "")}
          </h3>
          {weekFull ? <p className="tme-note">{copy.weekFull}</p> : null}

          <div className="tme-choice" role="group" aria-label={copy.choose}>
            <button
              type="button"
              aria-pressed={preferredProduct === "group"}
              onClick={() => onPreferredProduct("group")}
            >
              {copy.groupOption}
            </button>
            <button
              type="button"
              aria-pressed={preferredProduct === "individual60"}
              onClick={() => onPreferredProduct("individual60")}
            >
              {copy.individualOption}
            </button>
            <button
              type="button"
              aria-pressed={preferredProduct === "individual30"}
              onClick={() => onPreferredProduct("individual30")}
            >
              {copy.individualShortOption}
            </button>
          </div>

          <div className="tme-hour-grid">
            {daySessions.map((session) => {
              const open = session.kind === "group" && session.seatsLeft > 0;
              const selected =
                selection?.mode === "join" && selection.session.id === session.id;
              const label =
                session.kind === "group"
                  ? open
                    ? copy.joinGroup
                    : copy.full
                  : copy.legendPrivate;
              return (
                <button
                  key={session.id}
                  type="button"
                  className={`tme-hour ${session.kind === "group" ? "is-group" : "is-private"}${selected ? " is-selected" : ""}`}
                  disabled={session.kind === "individual" || !open}
                  onClick={() => {
                    if (!open) return;
                    onPreferredProduct("group");
                    onSelect({ mode: "join", session });
                  }}
                >
                  <strong>
                    {formatMadrid(new Date(session.startsAt), locale).replace(/^.*,\s*/, "")}
                  </strong>
                  <span>{label}</span>
                  {session.kind === "group" ? (
                    <span>
                      {session.capacity - session.seatsLeft}/{session.capacity}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {dayFree.map((iso) => {
              const selected =
                selection?.mode === "create" &&
                selection.startsAt === iso &&
                selection.kind === preferredKind &&
                selection.durationMinutes === preferredDuration;
              const disabled = weekFull || !templateReady;
              return (
                <button
                  key={iso}
                  type="button"
                  className={`tme-hour is-free${selected ? " is-selected" : ""}`}
                  disabled={disabled}
                  onClick={() =>
                    onSelect({
                      mode: "create",
                      startsAt: iso,
                      kind: preferredKind,
                      durationMinutes: preferredDuration,
                    })
                  }
                >
                  <strong>
                    {formatMadrid(new Date(iso), locale).replace(/^.*,\s*/, "")}
                  </strong>
                  <span>{preferredKind === "group" ? copy.createGroup : copy.createPrivate}</span>
                </button>
              );
            })}

            {!daySessions.length && !dayFree.length
              ? hourRows.map((minute) => (
                  <div key={minute} className="tme-hour is-closed" aria-hidden="true">
                    <strong>{minuteToHhMm(minute)}</strong>
                    <span>{copy.legendClosed}</span>
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
