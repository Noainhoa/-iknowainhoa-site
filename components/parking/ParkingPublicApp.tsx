"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import type { Locale } from "@/lib/i18n/shared";
import {
  formatMonthLabel,
  formatParkingDate,
  getParkingCopy,
  type MiddayTiming,
} from "@/lib/parking/i18n";
import { getParkingSupabase, parkingSupabaseConfigured } from "@/lib/parking/supabase";
import {
  buildWhatsAppMessage,
  isDateUnavailable,
  parseISODate,
  rangeContainsUnavailable,
  toISODate,
  whatsAppHref,
  countInclusiveDays,
  type ParkingUnavailableRange,
} from "@/lib/parking/types";

function buildMonthCells(view: Date): (Date | null)[] {
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const mondayIndex = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < mondayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ParkingPublicApp({ locale }: { locale: Locale }) {
  const t = getParkingCopy(locale);
  const today = useMemo(() => startOfToday(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [ranges, setRanges] = useState<ParkingUnavailableRange[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [configured] = useState(() => parkingSupabaseConfigured());

  const [arrival, setArrival] = useState<string | null>(null);
  const [departure, setDeparture] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [arrivalTiming, setArrivalTiming] = useState<MiddayTiming | "">("");
  const [departureTiming, setDepartureTiming] = useState<MiddayTiming | "">("");
  const [comments, setComments] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!configured) {
      setRanges([]);
      setLoadError(null);
      return;
    }
    const supabase = getParkingSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.rpc("parking_unavailable_ranges");
    if (error) {
      const fallback = await supabase
        .from("parking_public_availability")
        .select("id, start_date, end_date, availability");
      if (fallback.error) {
        setLoadError(t.loadError);
        setRanges([]);
        return;
      }
      setLoadError(null);
      setRanges((fallback.data || []) as ParkingUnavailableRange[]);
      return;
    }
    setLoadError(null);
    setRanges((data || []) as ParkingUnavailableRange[]);
  }, [configured, t.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const months = useMemo(
    () => [
      new Date(view.getFullYear(), view.getMonth(), 1),
      new Date(view.getFullYear(), view.getMonth() + 1, 1),
      new Date(view.getFullYear(), view.getMonth() + 2, 1),
    ],
    [view]
  );
  const previewEnd = departure || (arrival && hover ? hover : null);

  function dayState(iso: string): "past" | "unavailable" | "available" | "selected" | "inrange" {
    const d = parseISODate(iso);
    if (d < today) return "past";
    if (isDateUnavailable(iso, ranges)) return "unavailable";
    if (arrival && departure && iso >= arrival && iso <= departure) {
      return iso === arrival || iso === departure ? "selected" : "inrange";
    }
    if (arrival && !departure && previewEnd) {
      const a = arrival <= previewEnd ? arrival : previewEnd;
      const b = arrival <= previewEnd ? previewEnd : arrival;
      if (iso >= a && iso <= b) {
        if (rangeContainsUnavailable(a, b, ranges)) return "available";
        return iso === a || iso === b ? "selected" : "inrange";
      }
    }
    if (iso === arrival) return "selected";
    return "available";
  }

  function onSelectDay(iso: string) {
    const state = dayState(iso);
    if (state === "past" || state === "unavailable") return;

    if (!arrival || (arrival && departure)) {
      setArrival(iso);
      setDeparture(null);
      setHover(null);
      return;
    }

    let start = arrival;
    let end = iso;
    if (end < start) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    if (rangeContainsUnavailable(start, end, ranges)) {
      setFormError(t.errRangeUnavailable);
      setArrival(iso);
      setDeparture(null);
      return;
    }
    setFormError(null);
    setArrival(start);
    setDeparture(end);
  }

  function clearDates() {
    setArrival(null);
    setDeparture(null);
    setHover(null);
  }

  function openWhatsApp() {
    setFormError(null);
    if (!arrival || !departure) {
      setFormError(t.errNeedDates);
      return;
    }
    if (!name.trim()) {
      setFormError(t.errNeedName);
      return;
    }
    if (!arrivalTiming || !departureTiming) {
      setFormError(t.errNeedTiming);
      return;
    }
    if (rangeContainsUnavailable(arrival, departure, ranges)) {
      setFormError(t.errUnavailable);
      return;
    }
    const message = buildWhatsAppMessage({
      locale,
      arrival,
      departure,
      name: name.trim(),
      registration,
      vehicle,
      arrivalTiming,
      departureTiming,
      comments,
    });
    window.open(whatsAppHref(message), "_blank", "noopener,noreferrer");
  }

  const daysCount =
    arrival && departure ? countInclusiveDays(arrival, departure) : 0;

  return (
    <div className="pk" lang={locale}>
      <div className="pk-top">
        <Suspense fallback={null}>
          <LanguageToggle locale={locale} />
        </Suspense>
      </div>

      <header className="pk-header">
        <p className="pk-brand">{t.brand}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>

      <section className="pk-prices" aria-label={t.pricesTitle}>
        <h2>{t.pricesTitle}</h2>
        <ul>
          <li>{t.priceHigh}</li>
          <li>{t.priceSeptember}</li>
          <li>{t.priceLow}</li>
        </ul>
      </section>

      {!configured ? (
        <p className="pk-banner" role="status">
          {t.supabaseHint}
        </p>
      ) : null}
      {loadError ? (
        <p className="pk-banner pk-banner-error" role="alert">
          {loadError}
        </p>
      ) : null}

      <section className="pk-legend" aria-label={t.legend}>
        <span>
          <i className="swatch available" /> {t.available}
        </span>
        <span>
          <i className="swatch unavailable" /> {t.unavailable}
        </span>
        <span>
          <i className="swatch past" /> {t.past}
        </span>
        <span>
          <i className="swatch selected" /> {t.selected}
        </span>
      </section>

      <section className="pk-cal" aria-label={locale === "es" ? "Calendario" : "Calendar"}>
        <div className="pk-cal-nav">
          <button
            type="button"
            className="pk-nav-btn"
            aria-label={t.prevMonth}
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
            }
          >
            ‹
          </button>
          <h2>
            {formatMonthLabel(months[0], locale)} –{" "}
            {formatMonthLabel(months[2], locale)}
          </h2>
          <button
            type="button"
            className="pk-nav-btn"
            aria-label={t.nextMonth}
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
            }
          >
            ›
          </button>
        </div>

        <div className="pk-months">
          {months.map((monthDate) => {
            const cells = buildMonthCells(monthDate);
            return (
              <div
                key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
                className="pk-month"
              >
                <h3>{formatMonthLabel(monthDate, locale)}</h3>
                <div className="pk-weekdays">
                  {t.weekdays.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="pk-grid">
                  {cells.map((cell, i) => {
                    if (!cell) {
                      return (
                        <div
                          key={`e-${monthDate.getMonth()}-${i}`}
                          className="pk-cell empty"
                        />
                      );
                    }
                    const iso = toISODate(cell);
                    const state = dayState(iso);
                    const disabled = state === "past" || state === "unavailable";
                    const label =
                      state === "past"
                        ? t.past
                        : state === "unavailable"
                          ? t.unavailable
                          : state === "selected" || state === "inrange"
                            ? t.selected
                            : t.available;
                    return (
                      <button
                        key={iso}
                        type="button"
                        className={`pk-cell day ${state}`}
                        disabled={disabled}
                        aria-label={`${cell.getDate()} ${formatMonthLabel(monthDate, locale)} — ${label}`}
                        aria-pressed={state === "selected" || state === "inrange"}
                        onMouseEnter={() => {
                          if (arrival && !departure && !disabled) setHover(iso);
                        }}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => onSelectDay(iso)}
                      >
                        <span className="num">{cell.getDate()}</span>
                        <span className="sr-only">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {(arrival || departure) && (
          <button type="button" className="pk-clear" onClick={clearDates}>
            {t.clearDates}
          </button>
        )}
      </section>

      {arrival && departure ? (
        <p className="pk-summary" role="status">
          {t.summaryRange(
            formatParkingDate(arrival, locale),
            formatParkingDate(departure, locale)
          )}
          <br />
          {t.duration(daysCount)}
        </p>
      ) : arrival ? (
        <p className="pk-summary">{t.pickDeparture}</p>
      ) : (
        <p className="pk-summary">{t.pickArrival}</p>
      )}

      <form
        className="pk-form"
        onSubmit={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
      >
        <label>
          {t.name} <span className="req">*</span>
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
          />
        </label>
        <label>
          {t.registration}
          <input
            name="registration"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder={t.optional}
          />
        </label>
        <label>
          {t.vehicle}
          <input
            name="vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder={t.optional}
          />
        </label>
        <div className="pk-row">
          <label>
            {t.arrivalTiming} <span className="req">*</span>
            <select
              required
              name="arrivalTiming"
              value={arrivalTiming}
              onChange={(e) =>
                setArrivalTiming(e.target.value as MiddayTiming | "")
              }
            >
              <option value="">{t.timingPlaceholder}</option>
              <option value="before_midday">{t.beforeMidday}</option>
              <option value="after_midday">{t.afterMidday}</option>
            </select>
          </label>
          <label>
            {t.departureTiming} <span className="req">*</span>
            <select
              required
              name="departureTiming"
              value={departureTiming}
              onChange={(e) =>
                setDepartureTiming(e.target.value as MiddayTiming | "")
              }
            >
              <option value="">{t.timingPlaceholder}</option>
              <option value="before_midday">{t.beforeMidday}</option>
              <option value="after_midday">{t.afterMidday}</option>
            </select>
          </label>
        </div>
        <label>
          {t.comments}
          <textarea
            name="comments"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={t.optional}
          />
        </label>

        {formError ? (
          <p className="pk-form-error" role="alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" className="pk-wa">
          {t.whatsappCta}
        </button>
        <p className="pk-note">{t.whatsappNote}</p>
      </form>

      <style jsx>{`
        .pk {
          --ink: #1a1a1a;
          --muted: #5a5a5a;
          --line: #e6e6e6;
          --bg: #fafaf8;
          --card: #ffffff;
          --available: #d8f0df;
          --available-ink: #1b5e34;
          --unavailable: #f0d9d9;
          --unavailable-ink: #7a2e2e;
          --past: #ececec;
          --past-ink: #8a8a8a;
          --selected: #b7e4c7;
          --wa: #128c7e;
          --wa-hover: #0e6e63;
          max-width: 560px;
          margin: 0 auto;
          padding: 20px 16px 48px;
          color: var(--ink);
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }
        .pk-top {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 12px;
        }
        .pk-brand {
          margin: 0 0 6px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .pk-header h1 {
          margin: 0 0 10px;
          font-size: 1.55rem;
          line-height: 1.2;
          font-weight: 750;
        }
        .pk-header p {
          margin: 0;
          color: var(--muted);
          line-height: 1.55;
          font-size: 0.98rem;
        }
        .pk-prices {
          margin: 18px 0 0;
          padding: 14px 16px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 12px;
        }
        .pk-prices h2 {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 750;
        }
        .pk-prices ul {
          margin: 0;
          padding-left: 1.1rem;
          color: var(--muted);
          line-height: 1.55;
          font-size: 0.95rem;
        }
        .pk-prices li + li {
          margin-top: 4px;
        }
        .pk-banner {
          margin: 16px 0 0;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fff6d6;
          border: 1px solid #f0e0a0;
          font-size: 0.9rem;
          line-height: 1.45;
        }
        .pk-banner-error {
          background: #fde8e8;
          border-color: #f0bcbc;
        }
        .pk-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 14px;
          margin: 18px 0 14px;
          font-size: 0.82rem;
          color: var(--muted);
        }
        .pk-legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .swatch {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          display: inline-block;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .swatch.available {
          background: var(--available);
        }
        .swatch.unavailable {
          background: var(--unavailable);
        }
        .swatch.past {
          background: var(--past);
        }
        .swatch.selected {
          background: var(--selected);
          outline: 2px solid var(--available-ink);
          outline-offset: 0;
        }
        .pk-cal {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px;
        }
        .pk-cal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
        }
        .pk-cal-nav h2 {
          margin: 0;
          font-size: 0.95rem;
          text-transform: capitalize;
          font-weight: 700;
          text-align: center;
          line-height: 1.3;
        }
        .pk-months {
          display: grid;
          gap: 18px;
        }
        .pk-month h3 {
          margin: 0 0 10px;
          font-size: 1rem;
          text-transform: capitalize;
          font-weight: 700;
        }
        .pk-nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--bg);
          font-size: 1.4rem;
          cursor: pointer;
        }
        .pk-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 6px;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 650;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .pk-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .pk-cell {
          min-height: 44px;
          border-radius: 10px;
          border: 0;
          background: transparent;
        }
        .pk-cell.day {
          cursor: pointer;
          display: grid;
          place-items: center;
          font-weight: 600;
          font-size: 0.95rem;
          position: relative;
        }
        .pk-cell.available {
          background: var(--available);
          color: var(--available-ink);
        }
        .pk-cell.unavailable {
          background: var(--unavailable);
          color: var(--unavailable-ink);
          cursor: not-allowed;
          opacity: 0.95;
        }
        .pk-cell.past {
          background: var(--past);
          color: var(--past-ink);
          cursor: not-allowed;
        }
        .pk-cell.selected,
        .pk-cell.inrange {
          background: var(--selected);
          color: var(--available-ink);
          box-shadow: inset 0 0 0 2px var(--available-ink);
        }
        .pk-cell:disabled {
          opacity: 1;
        }
        .pk-clear {
          margin-top: 12px;
          width: 100%;
          min-height: 44px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--bg);
          cursor: pointer;
          font-size: 0.95rem;
        }
        .pk-summary {
          margin: 16px 0;
          padding: 12px 14px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 12px;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        .pk-form {
          display: grid;
          gap: 12px;
        }
        .pk-form label {
          display: grid;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .pk-form input,
        .pk-form textarea,
        .pk-form select {
          width: 100%;
          box-sizing: border-box;
          min-height: 44px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font: inherit;
          font-weight: 400;
          background: #fff;
        }
        .pk-form textarea {
          min-height: 88px;
          resize: vertical;
        }
        .pk-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 380px) {
          .pk-row {
            grid-template-columns: 1fr;
          }
        }
        .req {
          color: #b42318;
        }
        .pk-form-error {
          margin: 0;
          color: #7a2e2e;
          font-size: 0.9rem;
        }
        .pk-wa {
          min-height: 52px;
          border: 0;
          border-radius: 12px;
          background: var(--wa);
          color: #fff;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
        }
        .pk-wa:hover {
          background: var(--wa-hover);
        }
        .pk-note {
          margin: 0;
          font-size: 0.82rem;
          color: var(--muted);
          line-height: 1.45;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
      `}</style>
    </div>
  );
}

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
