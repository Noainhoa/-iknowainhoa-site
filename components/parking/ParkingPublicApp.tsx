"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import type { Locale } from "@/lib/i18n/shared";
import {
  formatMonthLabel,
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
      setLoadError(t.loadError);
      setRanges([]);
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

  return (
    <div className="pk" lang={locale}>
      <div className="pk-top">
        <Suspense fallback={null}>
          <LanguageToggle locale={locale} />
        </Suspense>
      </div>

      <header className="pk-header">
        <div className="pk-brand">
          <img
            className="pk-logo"
            src="/images/parking/guardamar-parking-logo.png"
            alt="Guardamar Parking"
            width={48}
            height={48}
            decoding="async"
          />
          <h1>{t.title}</h1>
        </div>
        <p>{t.intro}</p>
        {t.accessNote ? <p className="pk-access">{t.accessNote}</p> : null}
      </header>

      <section className="pk-prices" aria-label={t.pricesTitle}>
        <table className="pk-prices-table">
          <thead>
            <tr>
              <th scope="col" className="pk-prices-period">
                <span className="pk-prices-title">
                  <span className="pk-prices-mark" aria-hidden="true" />
                  {t.pricesTitle}
                </span>
              </th>
              <th scope="col">{t.priceColDay}</th>
              <th scope="col">{t.priceColWeek}</th>
              <th scope="col">{t.priceColQuincena}</th>
              <th scope="col">{t.priceColMonth}</th>
            </tr>
          </thead>
          <tbody>
            {t.priceRows.map((row) => (
              <tr key={row.period}>
                <th scope="row" className="pk-prices-period">
                  {row.period}
                </th>
                <td className={row.day === "—" ? "pk-price-empty" : undefined}>
                  {row.day}
                </td>
                <td className={row.week === "—" ? "pk-price-empty" : undefined}>
                  {row.week}
                </td>
                <td
                  className={row.quincena === "—" ? "pk-price-empty" : undefined}
                >
                  {row.quincena}
                </td>
                <td className={row.month === "—" ? "pk-price-empty" : undefined}>
                  {row.month}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <form
        className="pk-form"
        onSubmit={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
      >
        <label>
          <span className="pk-lab">
            {t.name} <span className="req">*</span>
          </span>
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
          />
        </label>
        <div className="pk-row">
          <label>
            <span className="pk-lab">{t.registration}</span>
            <input
              name="registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              placeholder={t.optional}
            />
          </label>
          <label>
            <span className="pk-lab">{t.vehicle}</span>
            <input
              name="vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder={t.optional}
            />
          </label>
        </div>
        <div className="pk-row">
          <label>
            <span className="pk-lab">
              {t.arrivalTiming} <span className="req">*</span>
            </span>
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
            <span className="pk-lab">
              {t.departureTiming} <span className="req">*</span>
            </span>
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
          <span className="pk-lab">{t.comments}</span>
          <textarea
            name="comments"
            rows={2}
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
          --pk-navy: #005288;
          --pk-red: #e31c23;
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
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .pk-logo {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 50%;
          display: block;
        }
        .pk-header h1 {
          margin: 0;
          font-size: 1.55rem;
          line-height: 1.2;
          font-weight: 750;
        }
        .pk-header p {
          margin: 0;
          color: var(--muted);
          line-height: 1.45;
          font-size: 0.98rem;
        }
        .pk-access {
          margin-top: 8px !important;
          font-size: 0.9rem !important;
        }
        .pk-prices {
          margin: 20px 0 0;
          padding: 0;
          background: transparent;
          border: 0;
          border-top: 1px solid color-mix(in srgb, var(--pk-navy) 22%, transparent);
          border-bottom: 1px solid color-mix(in srgb, var(--pk-navy) 22%, transparent);
        }
        .pk-prices-table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 0.86rem;
          line-height: 1.35;
          table-layout: fixed;
        }
        .pk-prices-table thead th {
          padding: 0 4px 8px;
          text-align: right;
          font-size: 0.68rem;
          font-weight: 650;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
          vertical-align: middle;
        }
        .pk-prices-table thead th.pk-prices-period {
          text-align: left;
          padding-left: 0;
          padding-right: 8px;
          color: var(--pk-navy);
        }
        .pk-prices-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          font-weight: 650;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pk-navy);
        }
        .pk-prices-mark {
          width: 14px;
          height: 1px;
          background: var(--pk-red);
          flex-shrink: 0;
        }
        .pk-prices-table tbody tr + tr th,
        .pk-prices-table tbody tr + tr td {
          border-top: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
        }
        .pk-prices-table tbody th,
        .pk-prices-table tbody td {
          padding: 9px 4px;
          vertical-align: baseline;
        }
        .pk-prices-table tbody th.pk-prices-period {
          text-align: left;
          color: var(--muted);
          padding-left: 0;
          padding-right: 8px;
          font-weight: 450;
          width: 34%;
        }
        .pk-prices-table tbody td {
          text-align: right;
          white-space: nowrap;
          color: var(--pk-navy);
          font-weight: 750;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
          font-size: 0.95rem;
        }
        .pk-prices-table tbody td.pk-price-empty {
          color: color-mix(in srgb, var(--muted) 70%, transparent);
          font-weight: 450;
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
        .pk-form {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }
        .pk-form label {
          display: grid;
          gap: 5px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .pk-lab {
          display: inline;
          line-height: 1.2;
        }
        .pk-form input,
        .pk-form textarea,
        .pk-form select {
          width: 100%;
          box-sizing: border-box;
          min-height: 42px;
          padding: 9px 11px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font: inherit;
          font-weight: 400;
          background: #fff;
        }
        .pk-form textarea {
          min-height: 64px;
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
          font-weight: 700;
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
