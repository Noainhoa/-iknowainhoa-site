"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import type { Locale } from "@/lib/i18n/shared";
import {
  formatMonthRangeLabel,
  formatMonthWithYear,
  formatParkingDate,
  getParkingCopy,
  PRICE_DASH,
} from "@/lib/parking/i18n";
import { getParkingSupabase, parkingSupabaseConfigured } from "@/lib/parking/supabase";
import {
  buildWhatsAppMessage,
  countInclusiveDays,
  isDateUnavailable,
  parseISODate,
  rangeContainsUnavailable,
  toISODate,
  whatsAppHref,
  type ParkingUnavailableRange,
} from "@/lib/parking/types";

const STORAGE_KEY = "parking-enquiry";

type PersistedEnquiry = {
  arrival: string | null;
  departure: string | null;
  name: string;
  registration: string;
  vehicle: string;
  comments: string;
};

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

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

function useVisibleMonthCount() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 960px)").matches) setN(3);
      else if (window.matchMedia("(min-width: 720px)").matches) setN(2);
      else setN(1);
    };
    update();
    const mq1 = window.matchMedia("(min-width: 720px)");
    const mq2 = window.matchMedia("(min-width: 960px)");
    mq1.addEventListener("change", update);
    mq2.addEventListener("change", update);
    return () => {
      mq1.removeEventListener("change", update);
      mq2.removeEventListener("change", update);
    };
  }, []);
  return n;
}

function readPersisted(): PersistedEnquiry | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedEnquiry>;
    return {
      arrival: typeof parsed.arrival === "string" ? parsed.arrival : null,
      departure: typeof parsed.departure === "string" ? parsed.departure : null,
      name: typeof parsed.name === "string" ? parsed.name : "",
      registration:
        typeof parsed.registration === "string" ? parsed.registration : "",
      vehicle: typeof parsed.vehicle === "string" ? parsed.vehicle : "",
      comments: typeof parsed.comments === "string" ? parsed.comments : "",
    };
  } catch {
    return null;
  }
}

function isPriceDash(value: string) {
  return value === PRICE_DASH || value === "—";
}

function PriceCell({ value, unavailableLabel }: { value: string; unavailableLabel: string }) {
  if (isPriceDash(value)) {
    return (
      <span className="pk-price-empty" aria-label={unavailableLabel}>
        {PRICE_DASH}
      </span>
    );
  }
  return <span>{value}</span>;
}

export default function ParkingPublicApp({ locale }: { locale: Locale }) {
  const t = getParkingCopy(locale);
  const today = useMemo(() => startOfToday(), []);
  const currentMonth = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );
  const visibleMonthCount = useVisibleMonthCount();

  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [ranges, setRanges] = useState<ParkingUnavailableRange[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [configured] = useState(() => parkingSupabaseConfigured());

  const [arrival, setArrival] = useState<string | null>(
    () => readPersisted()?.arrival ?? null
  );
  const [departure, setDeparture] = useState<string | null>(
    () => readPersisted()?.departure ?? null
  );
  const [hover, setHover] = useState<string | null>(null);

  const [name, setName] = useState(() => readPersisted()?.name ?? "");
  const [registration, setRegistration] = useState(
    () => readPersisted()?.registration ?? ""
  );
  const [vehicle, setVehicle] = useState(() => readPersisted()?.vehicle ?? "");
  const [comments, setComments] = useState(() => readPersisted()?.comments ?? "");

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    arrival?: string;
    departure?: string;
    name?: string;
  }>({});
  const [liveMessage, setLiveMessage] = useState("");
  const [preparing, setPreparing] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const arrivalSummaryRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const preparingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((message: string) => {
    setLiveMessage("");
    requestAnimationFrame(() => setLiveMessage(message));
  }, []);

  useEffect(() => {
    const payload: PersistedEnquiry = {
      arrival,
      departure,
      name,
      registration,
      vehicle,
      comments,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota / private mode */
    }
  }, [arrival, departure, name, registration, vehicle, comments]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    return () => {
      if (preparingTimer.current) clearTimeout(preparingTimer.current);
    };
  }, []);

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
    // Fetch availability once on mount / when locale copy changes loadError text.
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const months = useMemo(
    () =>
      Array.from(
        { length: visibleMonthCount },
        (_, i) => new Date(view.getFullYear(), view.getMonth() + i, 1)
      ),
    [view, visibleMonthCount]
  );

  const canGoPrev =
    view.getFullYear() > currentMonth.getFullYear() ||
    (view.getFullYear() === currentMonth.getFullYear() &&
      view.getMonth() > currentMonth.getMonth());

  const previewEnd = departure || (arrival && hover ? hover : null);
  const bothDatesSelected = Boolean(arrival && departure);
  const durationDays =
    arrival && departure ? countInclusiveDays(arrival, departure) : 0;

  function dayState(
    iso: string
  ): "past" | "unavailable" | "available" | "selected" | "inrange" {
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
      setFormError(null);
      setFieldErrors((prev) => ({ ...prev, arrival: undefined, departure: undefined }));
      announce(t.announceArrival);
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
      setFieldErrors({ arrival: t.errRangeUnavailable });
      setArrival(iso);
      setDeparture(null);
      setHover(null);
      announce(t.announceInvalidRange);
      return;
    }
    setFormError(null);
    setFieldErrors((prev) => ({ ...prev, arrival: undefined, departure: undefined }));
    setArrival(start);
    setDeparture(end);
    setHover(null);
    announce(t.announceDeparture);
  }

  function clearDates() {
    setArrival(null);
    setDeparture(null);
    setHover(null);
    setFormError(null);
    setFieldErrors((prev) => ({ ...prev, arrival: undefined, departure: undefined }));
    announce(t.announceCleared);
  }

  function changeDates() {
    clearDates();
    const cal = document.getElementById("pk-availability");
    cal?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validate(): {
    ok: boolean;
    errors: { arrival?: string; departure?: string; name?: string };
    summary: string | null;
  } {
    const errors: { arrival?: string; departure?: string; name?: string } = {};

    if (!arrival) {
      errors.arrival = t.errNeedArrival;
    }
    if (!departure) {
      errors.departure = t.errNeedDeparture;
    }
    if (arrival && departure && departure < arrival) {
      errors.departure = t.errDepartureAfter;
    }
    if (
      arrival &&
      departure &&
      departure >= arrival &&
      rangeContainsUnavailable(arrival, departure, ranges)
    ) {
      errors.arrival = t.errRangeUnavailable;
    }
    if (!name.trim()) {
      errors.name = t.errNeedName;
    }

    const keys = Object.keys(errors);
    if (keys.length === 0) {
      return { ok: true, errors: {}, summary: null };
    }

    const summary =
      keys.length > 1
        ? t.errReviewFields
        : (errors.arrival || errors.departure || errors.name || t.errReviewFields);

    return { ok: false, errors, summary };
  }

  function focusFirstInvalid(errors: {
    arrival?: string;
    departure?: string;
    name?: string;
  }) {
    if (errors.arrival || errors.departure) {
      arrivalSummaryRef.current?.focus();
      const cal = document.getElementById("pk-availability");
      cal?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (errors.name) {
      nameRef.current?.focus();
    }
  }

  function openWhatsApp() {
    if (preparing) return;

    const result = validate();
    setFieldErrors(result.errors);
    setFormError(result.summary);

    if (!result.ok) {
      focusFirstInvalid(result.errors);
      return;
    }

    if (!arrival || !departure) return;

    const message = buildWhatsAppMessage({
      locale,
      arrival,
      departure,
      name: name.trim(),
      registration,
      vehicle,
      comments,
    });
    const href = whatsAppHref(message);

    setPreparing(true);
    if (preparingTimer.current) clearTimeout(preparingTimer.current);
    preparingTimer.current = setTimeout(() => {
      window.open(href, "_blank", "noopener,noreferrer");
      setPreparing(false);
      preparingTimer.current = null;
    }, 450);
  }

  const priceCols = [
    { key: "day" as const, label: t.priceColDay },
    { key: "week" as const, label: t.priceColWeek },
    { key: "quincena" as const, label: t.priceColQuincena },
    { key: "month" as const, label: t.priceColMonth },
  ];

  return (
    <div className="pk" lang={locale}>
      <div className="pk-top">
        <Suspense fallback={null}>
          <LanguageToggle locale={locale} label={t.languageLabel} />
        </Suspense>
      </div>

      <div className="pk-live" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      <header className="pk-header">
        <div className="pk-brand">
          <img
            className="pk-logo"
            src="/images/parking/guardamar-parking-logo.png"
            alt=""
            width={72}
            height={72}
            decoding="async"
          />
          <div className="pk-brand-text">
            <p className="pk-brand-name">{t.brand}</p>
            <h1>{t.title}</h1>
          </div>
        </div>
        <p className="pk-intro">{t.intro}</p>
        <p className="pk-location">
          <span>{t.locationLine1}</span>
          <span>{t.locationLine2}</span>
        </p>
      </header>

      <div className="pk-hero-wrap">
        <img
          className="pk-hero"
          src="/images/parking/guardamar-parking-logo.png"
          alt={t.heroAlt}
          width={320}
          height={320}
          decoding="async"
        />
      </div>

      <section className="pk-facts" aria-label={locale === "es" ? "Datos clave" : "Key facts"}>
        <ul>
          <li>{t.factPrivate}</li>
          <li>{t.factHeight}</li>
          <li>{t.factConfirmation}</li>
        </ul>
      </section>

      <section className="pk-prices" aria-labelledby="pk-prices-heading">
        <h2 id="pk-prices-heading">{t.pricesTitle}</h2>
        <p className="pk-prices-support">{t.pricesSupport}</p>

        <table className="pk-prices-table">
          <thead>
            <tr>
              <th scope="col">{t.priceColSeason}</th>
              {priceCols.map((col) => (
                <th key={col.key} scope="col">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.priceRows.map((row) => (
              <tr key={row.period}>
                <th scope="row">{row.period}</th>
                {priceCols.map((col) => (
                  <td key={col.key}>
                    <PriceCell value={row[col.key]} unavailableLabel={t.priceUnavailableLabel} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pk-prices-cards">
          {t.priceRows.map((row) => (
            <article key={row.period} className="pk-price-card">
              <h3>{row.period}</h3>
              <dl>
                {priceCols.map((col) => (
                  <div key={col.key} className="pk-price-row">
                    <dt>{col.label}</dt>
                    <dd>
                      <PriceCell value={row[col.key]} unavailableLabel={t.priceUnavailableLabel} />
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <p className="pk-prices-disclaimer">{t.pricesDisclaimer}</p>
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

      <section
        id="pk-availability"
        className="pk-availability"
        aria-labelledby="pk-availability-heading"
      >
        <h2 id="pk-availability-heading">{t.availabilityTitle}</h2>
        <p className="pk-availability-hint">
          {arrival && !departure ? t.availabilityHintDeparture : t.availabilityHint}
        </p>

        <div className="pk-legend" aria-label={t.legend}>
          <span>
            <i className="swatch available" aria-hidden="true" /> {t.available}
          </span>
          <span>
            <i className="swatch unavailable" aria-hidden="true" /> {t.unavailable}
          </span>
          <span>
            <i className="swatch past" aria-hidden="true" /> {t.past}
          </span>
          <span>
            <i className="swatch selected" aria-hidden="true" /> {t.selected}
          </span>
        </div>

        <div className="pk-cal">
          <div className="pk-cal-nav">
            <button
              type="button"
              className="pk-nav-btn"
              aria-label={t.prevMonths}
              disabled={!canGoPrev}
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <h3 className="pk-cal-range">
              {formatMonthRangeLabel(months[0], months[months.length - 1], locale)}
            </h3>
            <button
              type="button"
              className="pk-nav-btn"
              aria-label={t.nextMonths}
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>

          <div
            className="pk-months"
            style={{ gridTemplateColumns: `repeat(${visibleMonthCount}, minmax(0, 1fr))` }}
          >
            {months.map((monthDate) => {
              const cells = buildMonthCells(monthDate);
              const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
              return (
                <div key={monthKey} className="pk-month">
                  <h3>{formatMonthWithYear(monthDate, locale)}</h3>
                  <div className="pk-weekdays" aria-hidden="true">
                    {t.weekdays.map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="pk-grid">
                    {cells.map((cell, i) => {
                      if (!cell) {
                        return (
                          <div key={`e-${monthKey}-${i}`} className="pk-cell empty" />
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
                          aria-label={`${cell.getDate()} ${formatMonthWithYear(monthDate, locale)} — ${label}`}
                          aria-pressed={state === "selected" || state === "inrange"}
                          onMouseEnter={() => {
                            if (arrival && !departure && !disabled) setHover(iso);
                          }}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => {
                            if (arrival && !departure && !disabled) setHover(iso);
                          }}
                          onBlur={() => setHover(null)}
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
        </div>

        {bothDatesSelected && arrival && departure ? (
          <div
            className="pk-selected"
            ref={arrivalSummaryRef}
            tabIndex={-1}
            aria-labelledby="pk-selected-heading"
          >
            <div className="pk-selected-head">
              <h3 id="pk-selected-heading">{t.selectedDatesTitle}</h3>
              <button type="button" className="pk-change" onClick={changeDates}>
                {t.changeDates}
              </button>
            </div>
            <dl className="pk-selected-list">
              <div>
                <dt>{t.labelArrival}</dt>
                <dd>{formatParkingDate(arrival, locale)}</dd>
              </div>
              <div>
                <dt>{t.labelDeparture}</dt>
                <dd>{formatParkingDate(departure, locale)}</dd>
              </div>
              <div>
                <dt>{t.labelDuration}</dt>
                <dd>{t.duration(durationDays)}</dd>
              </div>
            </dl>
            {(fieldErrors.arrival || fieldErrors.departure) && (
              <p className="pk-field-error" id="pk-dates-error" role="alert">
                {fieldErrors.arrival || fieldErrors.departure}
              </p>
            )}
          </div>
        ) : (fieldErrors.arrival || fieldErrors.departure) ? (
          <p className="pk-field-error pk-field-error-alone" id="pk-dates-error" role="alert">
            {fieldErrors.arrival || fieldErrors.departure}
          </p>
        ) : null}
      </section>

      <section className="pk-form-section" aria-labelledby="pk-form-heading">
        <h2 id="pk-form-heading">{t.formTitle}</h2>

        <form
          className="pk-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            openWhatsApp();
          }}
        >
          <label className={fieldErrors.name ? "has-error" : undefined}>
            <span className="pk-lab">
              {t.name} <span className="req">*</span>
            </span>
            <input
              ref={nameRef}
              required
              name="name"
              autoComplete="name"
              value={name}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? "pk-name-error" : undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder={t.namePlaceholder}
            />
            {fieldErrors.name ? (
              <span className="pk-field-error" id="pk-name-error" role="alert">
                {fieldErrors.name}
              </span>
            ) : null}
          </label>

          <label>
            <span className="pk-lab">{t.registration}</span>
            <input
              name="registration"
              autoComplete="off"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              placeholder={t.registrationPlaceholder}
            />
          </label>

          <label>
            <span className="pk-lab">{t.vehicle}</span>
            <input
              name="vehicle"
              autoComplete="off"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder={t.vehiclePlaceholder}
            />
          </label>

          <label>
            <span className="pk-lab">{t.comments}</span>
            <textarea
              name="comments"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t.commentsPlaceholder}
            />
          </label>

          <div className="pk-before-book">
            <p className="pk-access-important">{t.accessImportant}</p>
            <p>{t.bookingDisclaimer}</p>
            <p>{t.privacyNote}</p>
          </div>

          <button type="submit" className="pk-wa" disabled={preparing} aria-busy={preparing}>
            {preparing ? t.whatsappPreparing : t.whatsappCta}
          </button>

          {formError ? (
            <p className="pk-form-error" role="alert" ref={formErrorRef}>
              {formError}
            </p>
          ) : null}
        </form>
      </section>

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
          --shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          max-width: 640px;
          margin: 0 auto;
          padding: 20px 16px 56px;
          color: var(--ink);
          background: var(--bg);
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }

        .pk-top {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }

        .pk-live {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        .pk-header {
          margin-bottom: 28px;
        }

        .pk-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          margin-bottom: 14px;
          width: 100%;
        }

        .pk-logo {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          border-radius: 50%;
          display: block;
          object-fit: contain;
        }

        .pk-brand-text {
          min-width: 0;
        }

        .pk-brand-name {
          margin: 0 0 4px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--pk-navy);
        }

        .pk-header h1 {
          margin: 0;
          font-size: clamp(1.45rem, 6.2vw, 1.75rem);
          line-height: 1.15;
          font-weight: 750;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        .pk-intro {
          margin: 0 0 12px;
          color: var(--muted);
          line-height: 1.5;
          font-size: 1rem;
          text-align: center;
        }

        .pk-location {
          margin: 0;
          display: grid;
          gap: 2px;
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.4;
          text-align: center;
        }

        @media (min-width: 520px) {
          .pk-brand {
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: 16px;
          }
          .pk-logo {
            width: 80px;
            height: 80px;
          }
          .pk-header h1 {
            font-size: clamp(1.7rem, 3.5vw, 2rem);
            line-height: 1.12;
          }
          .pk-intro,
          .pk-location {
            text-align: left;
          }
        }

        .pk-hero-wrap {
          display: flex;
          justify-content: center;
          margin: 0 0 28px;
        }

        .pk-hero {
          width: min(100%, 220px);
          aspect-ratio: 1 / 1;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .pk-facts {
          margin: 0 0 32px;
          padding: 16px 18px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          box-shadow: var(--shadow);
        }

        .pk-facts ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 10px;
        }

        .pk-facts li {
          position: relative;
          padding-left: 18px;
          font-size: 0.95rem;
          line-height: 1.4;
          color: var(--ink);
        }

        .pk-facts li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--pk-navy);
        }

        .pk-prices {
          margin: 0 0 32px;
          padding: 20px 18px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          box-shadow: var(--shadow);
        }

        .pk-prices h2,
        .pk-availability h2,
        .pk-form-section h2 {
          margin: 0 0 8px;
          font-size: 1.2rem;
          font-weight: 750;
          color: var(--pk-navy);
          letter-spacing: -0.01em;
        }

        .pk-prices-support {
          margin: 0 0 16px;
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.45;
        }

        .pk-prices-table {
          display: none;
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 14px;
          font-size: 0.9rem;
          line-height: 1.35;
        }

        .pk-prices-table thead th {
          padding: 0 6px 10px;
          text-align: right;
          font-size: 0.7rem;
          font-weight: 650;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
        }

        .pk-prices-table thead th:first-child {
          text-align: left;
          padding-left: 0;
        }

        .pk-prices-table tbody th,
        .pk-prices-table tbody td {
          padding: 10px 6px;
          border-top: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          vertical-align: baseline;
        }

        .pk-prices-table tbody th {
          text-align: left;
          padding-left: 0;
          font-weight: 550;
          color: var(--muted);
        }

        .pk-prices-table tbody td {
          text-align: right;
          white-space: nowrap;
          color: var(--pk-navy);
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }

        .pk-prices-cards {
          display: grid;
          gap: 12px;
          margin: 0 0 14px;
        }

        .pk-price-card {
          padding: 12px 14px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--bg);
        }

        .pk-price-card h3 {
          margin: 0 0 10px;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--pk-navy);
        }

        .pk-price-card dl {
          margin: 0;
          display: grid;
          gap: 6px;
        }

        .pk-price-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: baseline;
        }

        .pk-price-row dt {
          margin: 0;
          color: var(--muted);
          font-size: 0.85rem;
        }

        .pk-price-row dd {
          margin: 0;
          color: var(--pk-navy);
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }

        :global(.pk-price-empty) {
          color: color-mix(in srgb, var(--muted) 75%, transparent);
          font-weight: 450;
        }

        .pk-prices-disclaimer {
          margin: 0;
          font-size: 0.82rem;
          color: var(--muted);
          line-height: 1.45;
        }

        @media (min-width: 640px) {
          .pk-prices-table {
            display: table;
          }
          .pk-prices-cards {
            display: none;
          }
        }

        .pk-banner {
          margin: 0 0 20px;
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

        .pk-availability {
          margin: 0 0 32px;
        }

        .pk-availability-hint {
          margin: 0 0 14px;
          color: var(--muted);
          font-size: 0.95rem;
          line-height: 1.45;
        }

        .pk-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 14px;
          margin: 0 0 14px;
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
          box-shadow: var(--shadow);
        }

        .pk-cal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 14px;
        }

        .pk-cal-range {
          margin: 0;
          flex: 1;
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          line-height: 1.3;
          text-transform: capitalize;
        }

        .pk-nav-btn {
          min-width: 44px;
          min-height: 44px;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--bg);
          font-size: 1.4rem;
          line-height: 1;
          cursor: pointer;
          color: var(--ink);
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .pk-nav-btn:hover:not(:disabled) {
          background: #f0f0ee;
          border-color: #ccc;
        }

        .pk-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pk-nav-btn:focus-visible,
        .pk-cell.day:focus-visible,
        .pk-clear:focus-visible,
        .pk-change:focus-visible,
        .pk-wa:focus-visible,
        .pk-form input:focus-visible,
        .pk-form textarea:focus-visible {
          outline: 2px solid var(--pk-navy);
          outline-offset: 2px;
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
          transition: background 0.12s ease, box-shadow 0.12s ease;
        }

        .pk-cell.available {
          background: var(--available);
          color: var(--available-ink);
        }
        .pk-cell.unavailable {
          background: var(--unavailable);
          color: var(--unavailable-ink);
          cursor: not-allowed;
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
          transition: background 0.15s ease;
        }

        .pk-clear:hover {
          background: #f0f0ee;
        }

        .pk-selected {
          margin-top: 16px;
          padding: 16px 18px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          box-shadow: var(--shadow);
        }

        .pk-selected:focus {
          outline: none;
        }

        .pk-selected:focus-visible {
          outline: 2px solid var(--pk-navy);
          outline-offset: 2px;
        }

        .pk-selected-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .pk-selected-head h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--pk-navy);
        }

        .pk-change {
          min-height: 36px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: var(--bg);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--ink);
          white-space: nowrap;
        }

        .pk-selected-list {
          margin: 0;
          display: grid;
          gap: 10px;
        }

        .pk-selected-list > div {
          display: grid;
          grid-template-columns: minmax(5.5rem, auto) 1fr;
          gap: 8px 12px;
          align-items: baseline;
        }

        .pk-selected-list dt {
          margin: 0;
          font-size: 0.82rem;
          font-weight: 650;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pk-selected-list dd {
          margin: 0;
          font-size: 0.98rem;
          font-weight: 600;
        }

        .pk-field-error {
          display: block;
          margin: 8px 0 0;
          color: #7a2e2e;
          font-size: 0.88rem;
          font-weight: 550;
        }

        .pk-field-error-alone {
          margin-top: 12px;
          padding: 10px 12px;
          background: #fde8e8;
          border-radius: 8px;
        }

        .pk-form-section {
          margin: 0;
        }

        .pk-form {
          display: grid;
          gap: 14px;
          margin-top: 14px;
          padding: 18px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          box-shadow: var(--shadow);
        }

        .pk-form label {
          display: grid;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .pk-lab {
          display: inline;
          line-height: 1.2;
        }

        .pk-form input,
        .pk-form textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 44px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font: inherit;
          font-weight: 400;
          background: #fff;
          transition: border-color 0.15s ease;
        }

        .pk-form textarea {
          min-height: 88px;
          resize: vertical;
        }

        .pk-form label.has-error input {
          border-color: #c44;
        }

        .req {
          color: #b42318;
          font-weight: 700;
        }

        .pk-before-book {
          display: grid;
          gap: 8px;
          margin: 4px 0 0;
        }

        .pk-before-book p {
          margin: 0;
          font-size: 0.84rem;
          color: var(--muted);
          line-height: 1.45;
        }

        .pk-access-important {
          color: var(--ink) !important;
          font-weight: 600;
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
          transition: background 0.15s ease, transform 0.12s ease;
        }

        .pk-wa:hover:not(:disabled) {
          background: var(--wa-hover);
        }

        .pk-wa:active:not(:disabled) {
          transform: translateY(1px);
        }

        .pk-wa:disabled {
          opacity: 0.85;
          cursor: wait;
        }

        .pk-form-error {
          margin: 0;
          color: #7a2e2e;
          font-size: 0.92rem;
          font-weight: 550;
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

        @media (prefers-reduced-motion: reduce) {
          .pk-nav-btn,
          .pk-cell.day,
          .pk-clear,
          .pk-form input,
          .pk-form textarea,
          .pk-wa {
            transition: none;
          }
          .pk-wa:active:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
