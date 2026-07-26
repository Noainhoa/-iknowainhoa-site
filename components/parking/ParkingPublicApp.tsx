"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import type { Locale } from "@/lib/i18n/shared";
import {
  formatMonthRangeLabel,
  formatMonthWithYear,
  formatShortParkingDate,
  getParkingCopy,
  PRICE_DASH,
} from "@/lib/parking/i18n";
import { PARKING_PRIVACY_PATH } from "@/lib/parking/privacyContent";
import { getParkingSupabase, parkingSupabaseConfigured } from "@/lib/parking/supabase";
import {
  buildWhatsAppMessage,
  countInclusiveDays,
  enquiryPeriodsOverlap,
  isDateUnavailable,
  MAX_ENQUIRY_PERIODS,
  parseISODate,
  rangeContainsUnavailable,
  toISODate,
  whatsAppHref,
  type EnquiryPeriod,
  type ParkingUnavailableRange,
} from "@/lib/parking/types";
import {
  estimateParkingPrice,
  formatEuroEstimate,
} from "@/lib/parking/pricing";

const STORAGE_KEY = "parking-enquiry";
const WA_STATUS_KEY = "parking-wa-status";

type PersistedEnquiry = {
  arrival: string | null;
  departure: string | null;
  periods: EnquiryPeriod[];
  multiMode: "or" | "and";
  name: string;
  registration: string;
  vehicle: string;
  comments: string;
};

type WaStatus = "idle" | "opened" | "sent";

function readWaStatus(): { status: WaStatus; href: string | null } {
  try {
    const raw = sessionStorage.getItem(WA_STATUS_KEY);
    if (!raw) return { status: "idle", href: null };
    const parsed = JSON.parse(raw) as { status?: string; href?: string | null };
    if (parsed.status === "opened" || parsed.status === "sent") {
      return { status: parsed.status, href: parsed.href ?? null };
    }
  } catch {
    /* ignore */
  }
  return { status: "idle", href: null };
}

function writeWaStatus(status: WaStatus, href: string | null) {
  try {
    if (status === "idle") {
      sessionStorage.removeItem(WA_STATUS_KEY);
      return;
    }
    sessionStorage.setItem(WA_STATUS_KEY, JSON.stringify({ status, href }));
  } catch {
    /* ignore */
  }
}

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
    const periods = Array.isArray(parsed.periods)
      ? parsed.periods.filter(
          (p): p is EnquiryPeriod =>
            !!p &&
            typeof p.arrival === "string" &&
            typeof p.departure === "string" &&
            p.departure >= p.arrival
        )
      : [];
    return {
      arrival: typeof parsed.arrival === "string" ? parsed.arrival : null,
      departure: typeof parsed.departure === "string" ? parsed.departure : null,
      periods,
      multiMode: parsed.multiMode === "and" ? "and" : "or",
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

/** Renders `**bold**` markers from i18n strings as <strong>. */
function withBold(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part ? <span key={i}>{part}</span> : null;
  });
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
  const [periods, setPeriods] = useState<EnquiryPeriod[]>(
    () => readPersisted()?.periods ?? []
  );
  const [multiMode, setMultiMode] = useState<"or" | "and">(
    () => readPersisted()?.multiMode ?? "or"
  );
  const [hover, setHover] = useState<string | null>(null);

  const [name, setName] = useState(() => readPersisted()?.name ?? "");
  const [registration, setRegistration] = useState(
    () => readPersisted()?.registration ?? ""
  );
  const [vehicle, setVehicle] = useState(() => readPersisted()?.vehicle ?? "");
  const [comments, setComments] = useState(() => readPersisted()?.comments ?? "");

  const [acceptHeight, setAcceptHeight] = useState(false);
  const [acceptBooking, setAcceptBooking] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    arrival?: string;
    departure?: string;
    periods?: string;
    name?: string;
    acceptances?: string;
  }>({});
  const [liveMessage, setLiveMessage] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [waStatus, setWaStatus] = useState<WaStatus>(() =>
    typeof window === "undefined" ? "idle" : readWaStatus().status
  );
  const [waHref, setWaHref] = useState<string | null>(() =>
    typeof window === "undefined" ? null : readWaStatus().href
  );

  const nameRef = useRef<HTMLInputElement>(null);
  const acceptHeightRef = useRef<HTMLInputElement>(null);
  const arrivalSummaryRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const waStatusRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    setLiveMessage("");
    requestAnimationFrame(() => setLiveMessage(message));
  }, []);

  function updateWaStatus(status: WaStatus, nextHref?: string | null) {
    if (status === "idle") {
      setWaStatus("idle");
      setWaHref(null);
      writeWaStatus("idle", null);
      return;
    }
    const href = nextHref ?? waHref;
    setWaStatus(status);
    if (href) setWaHref(href);
    writeWaStatus(status, href);
  }

  useEffect(() => {
    const payload: PersistedEnquiry = {
      arrival,
      departure,
      periods,
      multiMode,
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
  }, [arrival, departure, periods, multiMode, name, registration, vehicle, comments]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (waStatus === "idle") return;

    function focusStatus() {
      requestAnimationFrame(() => {
        waStatusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        waStatusRef.current?.focus();
      });
    }

    focusStatus();

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted || document.visibilityState === "visible") {
        focusStatus();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [waStatus]);

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
  const draftEstimate =
    arrival && departure ? estimateParkingPrice(arrival, departure) : 0;

  function effectivePeriods(): EnquiryPeriod[] {
    if (periods.length > 0) return periods;
    if (arrival && departure && departure >= arrival) {
      return [{ arrival, departure }];
    }
    return [];
  }

  function dayState(
    iso: string
  ): "past" | "unavailable" | "available" | "selected" | "inrange" {
    const d = parseISODate(iso);
    if (d < today) return "past";
    if (isDateUnavailable(iso, ranges)) return "unavailable";

    for (const p of periods) {
      if (iso >= p.arrival && iso <= p.departure) {
        return iso === p.arrival || iso === p.departure ? "selected" : "inrange";
      }
    }

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
      setFieldErrors((prev) => ({
        ...prev,
        arrival: undefined,
        departure: undefined,
        periods: undefined,
      }));
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
    setFieldErrors((prev) => ({
      ...prev,
      arrival: undefined,
      departure: undefined,
      periods: undefined,
    }));
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
    setFieldErrors((prev) => ({
      ...prev,
      arrival: undefined,
      departure: undefined,
      periods: undefined,
    }));
    announce(t.announceCleared);
  }

  function clearAllPeriods() {
    setPeriods([]);
    clearDates();
  }

  function changeDates() {
    clearDates();
    const cal = document.getElementById("pk-availability");
    cal?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const firstAvailable = cal?.querySelector<HTMLButtonElement>(
        "button.pk-cell.day:not([disabled])"
      );
      firstAvailable?.focus();
    }, 50);
  }

  function addCurrentPeriod() {
    if (!arrival || !departure) return;
    if (periods.length >= MAX_ENQUIRY_PERIODS) {
      setFieldErrors((prev) => ({ ...prev, periods: t.errMaxPeriods }));
      setFormError(t.errMaxPeriods);
      return;
    }
    const next: EnquiryPeriod = { arrival, departure };
    if (rangeContainsUnavailable(next.arrival, next.departure, ranges)) {
      setFieldErrors({ arrival: t.errRangeUnavailable });
      setFormError(t.errRangeUnavailable);
      return;
    }
    for (const p of periods) {
      if (enquiryPeriodsOverlap(p, next)) {
        setFieldErrors((prev) => ({ ...prev, periods: t.errPeriodsOverlap }));
        setFormError(t.errPeriodsOverlap);
        return;
      }
    }
    setPeriods((prev) => [...prev, next]);
    setArrival(null);
    setDeparture(null);
    setHover(null);
    setFormError(null);
    setFieldErrors((prev) => ({
      ...prev,
      arrival: undefined,
      departure: undefined,
      periods: undefined,
    }));
    announce(t.addPeriod);
  }

  function removePeriodAt(index: number) {
    setPeriods((prev) => prev.filter((_, i) => i !== index));
    setFieldErrors((prev) => ({ ...prev, periods: undefined }));
  }

  function validate(): {
    ok: boolean;
    errors: {
      arrival?: string;
      departure?: string;
      periods?: string;
      name?: string;
      acceptances?: string;
    };
    summary: string | null;
    periodsOut: EnquiryPeriod[];
  } {
    const errors: {
      arrival?: string;
      departure?: string;
      periods?: string;
      name?: string;
      acceptances?: string;
    } = {};

    let periodsOut = effectivePeriods();

    if (periodsOut.length === 0) {
      if (!arrival) errors.arrival = t.errNeedArrival;
      if (!departure) errors.departure = t.errNeedDeparture;
      if (!errors.arrival && !errors.departure) {
        errors.periods = t.errNeedPeriod;
      }
    } else {
      if (periodsOut.length > MAX_ENQUIRY_PERIODS) {
        errors.periods = t.errMaxPeriods;
      }
      for (const p of periodsOut) {
        if (rangeContainsUnavailable(p.arrival, p.departure, ranges)) {
          errors.periods = t.errRangeUnavailable;
          break;
        }
      }
      for (let i = 0; i < periodsOut.length; i++) {
        for (let j = i + 1; j < periodsOut.length; j++) {
          if (enquiryPeriodsOverlap(periodsOut[i], periodsOut[j])) {
            errors.periods = t.errPeriodsOverlap;
          }
        }
      }
    }

    if (!name.trim()) {
      errors.name = t.errNeedName;
    }
    if (
      !acceptHeight ||
      !acceptBooking ||
      !acceptPrivacy ||
      !acceptPolicy
    ) {
      errors.acceptances = t.errNeedAcceptances;
    }

    const keys = Object.keys(errors);
    if (keys.length === 0) {
      return { ok: true, errors: {}, summary: null, periodsOut };
    }

    const summary =
      keys.length > 1
        ? t.errReviewFields
        : (errors.arrival ||
            errors.departure ||
            errors.periods ||
            errors.name ||
            errors.acceptances ||
            t.errReviewFields);

    return { ok: false, errors, summary, periodsOut };
  }

  function focusFirstInvalid(errors: {
    arrival?: string;
    departure?: string;
    periods?: string;
    name?: string;
    acceptances?: string;
  }) {
    if (errors.arrival || errors.departure || errors.periods) {
      arrivalSummaryRef.current?.focus();
      const cal = document.getElementById("pk-availability");
      cal?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (errors.name) {
      nameRef.current?.focus();
      return;
    }
    if (errors.acceptances) {
      acceptHeightRef.current?.focus();
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

    const periodsOut = result.periodsOut;
    if (periodsOut.length === 0) return;

    const message = buildWhatsAppMessage({
      locale,
      periods: periodsOut,
      mode: periodsOut.length <= 1 ? "single" : multiMode,
      name: name.trim(),
      registration,
      vehicle,
      comments,
    });
    const href = whatsAppHref(message);

    setPreparing(true);
    updateWaStatus("opened", href);
    window.location.assign(href);
  }

  function reopenWhatsApp() {
    if (!waHref) return;
    updateWaStatus("opened", waHref);
    window.location.assign(waHref);
  }

  const priceCols = [
    { key: "day" as const, label: t.priceColDay },
    { key: "week" as const, label: t.priceColWeek },
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
            width={56}
            height={56}
            decoding="async"
          />
          <div className="pk-brand-text">
            <p className="pk-brand-name">{t.brand}</p>
            <h1>{t.title}</h1>
            <p className="pk-location">
              {t.locationLine1}, {t.locationLine2}
            </p>
          </div>
        </div>
      </header>

      <section className="pk-space" aria-label={t.galleryLabel}>
        <div className="pk-gallery" role="group" aria-label={t.galleryLabel}>
          {(
            [
              "/images/parking/plaza-1.jpg",
              "/images/parking/plaza-2.jpg",
              "/images/parking/plaza-3.jpg",
            ] as const
          ).map((src, i) => (
            <figure key={src} className="pk-gallery-item">
              <img
                src={src}
                alt={t.photoAlts[i]}
                width={i === 1 ? 1025 : 1400}
                height={i === 1 ? 1400 : i === 0 ? 793 : 1047}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </figure>
          ))}
        </div>

        <p className="pk-space-facts">{t.spaceFact}</p>
      </section>

      <section className="pk-prices" aria-label={t.priceColSeason}>
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

          {(arrival || departure || periods.length > 0) && (
            <button type="button" className="pk-clear" onClick={clearAllPeriods}>
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
              <button
                type="button"
                className="pk-reset-dates"
                onClick={changeDates}
                aria-label={t.changeDates}
                title={t.changeDates}
              >
                <RotateCcw size={18} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>
            <dl className="pk-selected-list">
              <div>
                <dt>{t.labelArrival}</dt>
                <dd>{formatShortParkingDate(arrival, locale)}</dd>
              </div>
              <div>
                <dt>{t.labelDeparture}</dt>
                <dd>{formatShortParkingDate(departure, locale)}</dd>
              </div>
              <div>
                <dt>{t.labelDuration}</dt>
                <dd>{t.duration(durationDays)}</dd>
              </div>
              <div>
                <dt>{t.labelEstimate}</dt>
                <dd>{formatEuroEstimate(draftEstimate)}</dd>
              </div>
            </dl>
            {periods.length < MAX_ENQUIRY_PERIODS ? (
              <button
                type="button"
                className="pk-add-period"
                onClick={addCurrentPeriod}
              >
                {t.addPeriod}
              </button>
            ) : null}
            {(fieldErrors.arrival || fieldErrors.departure || fieldErrors.periods) && (
              <p className="pk-field-error" id="pk-dates-error" role="alert">
                {fieldErrors.arrival || fieldErrors.departure || fieldErrors.periods}
              </p>
            )}
          </div>
        ) : (fieldErrors.arrival || fieldErrors.departure || fieldErrors.periods) ? (
          <p className="pk-field-error pk-field-error-alone" id="pk-dates-error" role="alert">
            {fieldErrors.arrival || fieldErrors.departure || fieldErrors.periods}
          </p>
        ) : null}

        {periods.length > 0 ? (
          <div className="pk-periods" aria-labelledby="pk-periods-heading">
            <h3 id="pk-periods-heading">{t.periodsTitle}</h3>
            <ul className="pk-periods-list">
              {periods.map((p, index) => {
                const days = countInclusiveDays(p.arrival, p.departure);
                const estimate = estimateParkingPrice(p.arrival, p.departure);
                return (
                  <li key={`${p.arrival}-${p.departure}-${index}`}>
                    <div className="pk-period-main">
                      <span className="pk-period-index">{index + 1}.</span>
                      <span>
                        {formatShortParkingDate(p.arrival, locale)}
                        {" → "}
                        {formatShortParkingDate(p.departure, locale)}
                      </span>
                      <button
                        type="button"
                        className="pk-period-remove"
                        onClick={() => removePeriodAt(index)}
                        aria-label={t.removePeriod}
                      >
                        ×
                      </button>
                    </div>
                    <div className="pk-period-meta">
                      {t.duration(days)} · {t.labelEstimate}:{" "}
                      {formatEuroEstimate(estimate)}
                    </div>
                  </li>
                );
              })}
            </ul>

            {periods.length >= 2 ? (
              <fieldset className="pk-multi-mode">
                <legend>{t.multiModeLegend}</legend>
                <label className="pk-mode-option">
                  <input
                    type="radio"
                    name="multiMode"
                    checked={multiMode === "or"}
                    onChange={() => setMultiMode("or")}
                  />
                  <span>{t.multiModeOr}</span>
                </label>
                <label className="pk-mode-option">
                  <input
                    type="radio"
                    name="multiMode"
                    checked={multiMode === "and"}
                    onChange={() => setMultiMode("and")}
                  />
                  <span>{t.multiModeAnd}</span>
                </label>
                {multiMode === "and" ? (
                  <p className="pk-multi-summary">
                    {t.labelTotalDuration}:{" "}
                    {t.duration(
                      periods.reduce(
                        (sum, p) =>
                          sum + countInclusiveDays(p.arrival, p.departure),
                        0
                      )
                    )}
                    {" · "}
                    {t.labelTotalEstimate}:{" "}
                    {formatEuroEstimate(
                      periods.reduce(
                        (sum, p) =>
                          sum + estimateParkingPrice(p.arrival, p.departure),
                        0
                      )
                    )}
                  </p>
                ) : (
                  <p className="pk-multi-summary">
                    {periods
                      .map((p, i) => {
                        const days = countInclusiveDays(p.arrival, p.departure);
                        const estimate = estimateParkingPrice(
                          p.arrival,
                          p.departure
                        );
                        return `${i + 1}: ${t.duration(days)} / ${formatEuroEstimate(estimate)}`;
                      })
                      .join(" · ")}
                  </p>
                )}
              </fieldset>
            ) : null}
          </div>
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

          <div className="pk-form-row">
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
          </div>

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

          <fieldset
            className={`pk-acceptances${fieldErrors.acceptances ? " has-error" : ""}`}
            aria-describedby={
              fieldErrors.acceptances ? "pk-acceptances-error" : undefined
            }
          >
            <legend className="sr-only">
              {locale === "es" ? "Confirmaciones obligatorias" : "Required confirmations"}
            </legend>

            <label className="pk-check-label">
              <input
                ref={acceptHeightRef}
                type="checkbox"
                checked={acceptHeight}
                required
                onChange={(e) => {
                  setAcceptHeight(e.target.checked);
                  if (fieldErrors.acceptances) {
                    setFieldErrors((prev) => ({ ...prev, acceptances: undefined }));
                  }
                }}
              />
              <span>{withBold(t.accessImportant)}</span>
            </label>

            <label className="pk-check-label">
              <input
                type="checkbox"
                checked={acceptBooking}
                required
                onChange={(e) => {
                  setAcceptBooking(e.target.checked);
                  if (fieldErrors.acceptances) {
                    setFieldErrors((prev) => ({ ...prev, acceptances: undefined }));
                  }
                }}
              />
              <span>{t.bookingDisclaimer}</span>
            </label>

            <label className="pk-check-label">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                required
                onChange={(e) => {
                  setAcceptPrivacy(e.target.checked);
                  if (fieldErrors.acceptances) {
                    setFieldErrors((prev) => ({ ...prev, acceptances: undefined }));
                  }
                }}
              />
              <span>{t.privacyNote}</span>
            </label>

            <label className="pk-check-label">
              <input
                type="checkbox"
                checked={acceptPolicy}
                required
                onChange={(e) => {
                  setAcceptPolicy(e.target.checked);
                  if (fieldErrors.acceptances) {
                    setFieldErrors((prev) => ({ ...prev, acceptances: undefined }));
                  }
                }}
              />
              <span>
                {t.privacyPolicyAcceptBefore}
                <Link
                  href={`${PARKING_PRIVACY_PATH}?lang=${locale}`}
                  className="pk-inline-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t.privacyPolicyLinkLabel}
                </Link>
                {t.privacyPolicyAcceptAfter}
              </span>
            </label>

            {fieldErrors.acceptances ? (
              <p className="pk-field-error" id="pk-acceptances-error" role="alert">
                {fieldErrors.acceptances}
              </p>
            ) : null}
          </fieldset>

          <button type="submit" className="pk-wa" disabled={preparing} aria-busy={preparing}>
            <span className="pk-wa-inner">
              <svg
                className="pk-wa-icon"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M12.04 2a9.9 9.9 0 0 0-9.9 9.9c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01a9.9 9.9 0 0 0 9.9-9.9 9.86 9.86 0 0 0-9.91-9.92Zm5.76 14.07c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.29.59-.37.79-.37h.57c.18 0 .42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.3.39-.43.52-.14.14-.29.3-.12.58.16.29.73 1.2 1.56 1.94 1.08.96 1.98 1.26 2.27 1.4.28.14.45.12.61-.07.17-.2.7-.82.89-1.1.19-.29.38-.24.64-.14.26.1 1.66.78 1.95.92.28.15.47.21.54.33.07.12.07.68-.17 1.36Z"
                />
              </svg>
              {preparing ? t.whatsappPreparing : t.whatsappCta}
            </span>
          </button>

          {formError ? (
            <p className="pk-form-error" role="alert" ref={formErrorRef}>
              {formError}
            </p>
          ) : null}
        </form>

        {waStatus !== "idle" ? (
          <div
            ref={waStatusRef}
            className={`pk-wa-status${waStatus === "sent" ? " is-sent" : ""}`}
            tabIndex={-1}
            role="status"
            aria-live="polite"
          >
            {waStatus === "sent" ? (
              <>
                <p className="pk-wa-status-title">
                  <span className="pk-wa-status-check" aria-hidden="true">
                    ✓
                  </span>
                  {t.whatsappSentTitle}
                </p>
                <p className="pk-wa-status-body">{t.whatsappSentBody}</p>
                <button
                  type="button"
                  className="pk-wa-status-secondary"
                  onClick={() => updateWaStatus("idle")}
                >
                  {t.whatsappEditEnquiry}
                </button>
              </>
            ) : (
              <>
                <p className="pk-wa-status-title">{t.whatsappOpenedTitle}</p>
                <p className="pk-wa-status-body">{t.whatsappOpenedBody}</p>
                <div className="pk-wa-status-actions">
                  <button
                    type="button"
                    className="pk-wa-status-primary"
                    onClick={() => {
                      updateWaStatus("sent", waHref);
                      announce(t.whatsappSentTitle);
                    }}
                  >
                    {t.whatsappConfirmSent}
                  </button>
                  <button
                    type="button"
                    className="pk-wa-status-secondary"
                    onClick={reopenWhatsApp}
                  >
                    {t.whatsappOpenAgain}
                  </button>
                  <button
                    type="button"
                    className="pk-wa-status-secondary"
                    onClick={() => updateWaStatus("idle")}
                  >
                    {t.whatsappEditEnquiry}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>

      <footer className="pk-footer">
        <Link
          href={`${PARKING_PRIVACY_PATH}?lang=${locale}`}
          className="pk-footer-link"
        >
          {t.footerPrivacyLabel}
        </Link>
      </footer>

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
          --shadow: none;
          --radius: 12px;
          --space-tight: 8px;
          --space-group: 20px;
          --space-section: 36px;
          max-width: 820px;
          margin: 0 auto;
          padding: 14px 16px 48px;
          color: var(--ink);
          background: var(--bg);
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }

        .pk-top {
          display: flex;
          justify-content: flex-end;
          margin-bottom: var(--space-tight);
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
          margin-bottom: 12px;
        }

        .pk-brand {
          display: flex;
          flex-direction: row;
          align-items: center;
          text-align: left;
          gap: 10px;
          width: 100%;
          max-width: none;
          margin: 0;
        }

        .pk-logo {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          border-radius: 50%;
          display: block;
          object-fit: contain;
        }

        .pk-brand-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          gap: 1px;
        }

        .pk-brand-name {
          margin: 0;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--pk-navy);
          line-height: 1.15;
        }

        .pk-header h1 {
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.15;
          font-weight: 750;
          letter-spacing: -0.02em;
          color: var(--ink);
          max-width: none;
        }

        .pk-location {
          margin: 0;
          color: var(--muted);
          font-size: 0.72rem;
          line-height: 1.25;
          max-width: none;
        }

        @media (min-width: 560px) {
          .pk-header {
            margin-bottom: var(--space-group);
          }
          .pk-brand {
            gap: 16px;
            max-width: 42rem;
          }
          .pk-logo {
            width: 72px;
            height: 72px;
          }
          .pk-brand-text {
            gap: 3px;
          }
          .pk-brand-name {
            font-size: 0.72rem;
            letter-spacing: 0.1em;
          }
          .pk-header h1 {
            font-size: clamp(1.4rem, 2.2vw, 1.65rem);
            line-height: 1.15;
          }
          .pk-location {
            font-size: 0.88rem;
          }
        }

        .pk-card {
          background: var(--card);
          border: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        .pk-space {
          margin: 0 0 var(--space-section);
        }

        .pk-gallery {
          display: grid;
          grid-template-columns: 1.35fr 0.9fr;
          grid-template-rows: minmax(140px, 28vw) minmax(140px, 28vw);
          gap: 6px;
          margin: 0 0 12px;
          border-radius: var(--radius);
          overflow: hidden;
        }

        .pk-gallery-item {
          margin: 0;
          min-width: 0;
          min-height: 0;
          background: #d8dee4;
        }

        .pk-gallery-item:first-child {
          grid-row: 1 / span 2;
        }

        .pk-gallery-item img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pk-space-facts {
          margin: 0;
          padding: 0;
          color: var(--ink);
          font-size: 0.88rem;
          line-height: 1.35;
          font-weight: 500;
        }

        @media (min-width: 560px) {
          .pk-gallery {
            grid-template-rows: 200px 200px;
            gap: 8px;
          }
          .pk-space-facts {
            font-size: 0.95rem;
          }
        }

        .pk-prices {
          margin: 0 0 var(--space-section);
          padding: 12px 14px 12px;
          background: var(--card);
          border: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          border-radius: var(--radius);
        }

        .pk-availability h2,
        .pk-form-section h2 {
          margin: 0 0 4px;
          font-size: 1.15rem;
          font-weight: 750;
          color: var(--pk-navy);
          letter-spacing: -0.01em;
        }

        .pk-prices-table {
          display: table;
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 8px;
          font-size: 0.84rem;
          line-height: 1.2;
          table-layout: fixed;
        }

        .pk-prices-table thead th {
          padding: 0 4px 6px;
          text-align: right;
          font-size: 0.64rem;
          font-weight: 650;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
        }

        .pk-prices-table thead th:first-child {
          text-align: left;
          padding-left: 0;
          width: 38%;
          text-transform: none;
          font-size: 1.05rem;
          font-weight: 750;
          letter-spacing: -0.01em;
          color: var(--pk-navy);
          white-space: normal;
          line-height: 1.2;
        }

        .pk-prices-table tbody th,
        .pk-prices-table tbody td {
          padding: 6px 4px;
          border-top: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          vertical-align: baseline;
        }

        .pk-prices-table tbody th {
          text-align: left;
          padding-left: 0;
          font-weight: 550;
          color: var(--muted);
          font-size: 0.8rem;
        }

        .pk-prices-table tbody td {
          text-align: right;
          white-space: nowrap;
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
          font-size: 0.78rem;
          color: var(--muted);
          line-height: 1.35;
        }

        @media (min-width: 560px) {
          .pk-prices-table {
            font-size: 0.9rem;
          }
          .pk-prices-table thead th {
            font-size: 0.68rem;
            padding: 0 6px 8px;
          }
          .pk-prices-table tbody th,
          .pk-prices-table tbody td {
            padding: 8px 6px;
          }
          .pk-prices-table tbody th {
            font-size: 0.9rem;
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
          margin: 0 0 var(--space-section);
        }

        .pk-availability-hint {
          margin: 0 0 10px;
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.4;
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
        .pk-reset-dates:focus-visible,
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
          margin-top: 14px;
          padding: 12px 14px;
          background: var(--card);
          border: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          border-radius: var(--radius);
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
          gap: 8px;
          margin-bottom: 10px;
        }

        .pk-selected-head h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--pk-navy);
        }

        .pk-reset-dates {
          width: 44px;
          height: 44px;
          margin: -6px -8px -6px 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: var(--pk-navy);
          cursor: pointer;
        }

        .pk-reset-dates:hover {
          background: color-mix(in srgb, var(--pk-navy) 8%, transparent);
        }

        .pk-reset-dates:focus-visible {
          outline: 2px solid var(--pk-navy);
          outline-offset: 2px;
        }

        .pk-selected-list {
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px 12px;
        }

        @media (min-width: 480px) {
          .pk-selected-list {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        .pk-selected-list > div {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .pk-selected-list dt {
          margin: 0;
          font-size: 0.72rem;
          font-weight: 650;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pk-selected-list dd {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 650;
          line-height: 1.25;
        }

        .pk-add-period {
          margin-top: 12px;
          width: 100%;
          min-height: 44px;
          border: 1px solid color-mix(in srgb, var(--pk-navy) 22%, transparent);
          border-radius: 10px;
          background: color-mix(in srgb, var(--pk-navy) 6%, #fff);
          color: var(--pk-navy);
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .pk-add-period:hover {
          background: color-mix(in srgb, var(--pk-navy) 12%, #fff);
        }

        .pk-periods {
          margin-top: 14px;
          padding: 12px 14px;
          background: var(--card);
          border: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          border-radius: var(--radius);
        }

        .pk-periods h3 {
          margin: 0 0 10px;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--pk-navy);
        }

        .pk-periods-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .pk-periods-list li {
          margin: 0;
          padding-bottom: 10px;
          border-bottom: 1px solid color-mix(in srgb, var(--pk-navy) 10%, transparent);
        }

        .pk-periods-list li:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .pk-period-main {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .pk-period-index {
          color: var(--pk-navy);
          font-variant-numeric: tabular-nums;
        }

        .pk-period-remove {
          margin-left: auto;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--muted);
          font-size: 1.35rem;
          line-height: 1;
          cursor: pointer;
        }

        .pk-period-remove:hover {
          background: #fde8e8;
          color: #7a2e2e;
        }

        .pk-period-meta {
          margin: 4px 0 0 1.35rem;
          font-size: 0.84rem;
          color: var(--muted);
        }

        .pk-multi-mode {
          margin: 12px 0 0;
          padding: 10px 0 0;
          border: 0;
          border-top: 1px solid color-mix(in srgb, var(--pk-navy) 10%, transparent);
          display: grid;
          gap: 8px;
        }

        .pk-multi-mode legend {
          padding: 0;
          margin: 0 0 4px;
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--pk-navy);
        }

        .pk-mode-option {
          display: grid !important;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 8px;
          align-items: start;
          font-size: 0.88rem !important;
          font-weight: 450 !important;
          color: var(--ink);
          cursor: pointer;
        }

        .pk-mode-option input {
          margin-top: 3px;
          accent-color: var(--pk-navy);
        }

        .pk-multi-summary {
          margin: 4px 0 0;
          font-size: 0.84rem;
          color: var(--muted);
          line-height: 1.4;
        }

        @media (max-width: 380px) {
          .pk-selected-list {
            grid-template-columns: 1fr 1fr;
          }
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
          gap: 12px;
          margin-top: 10px;
          padding: 14px 16px 16px;
          background: var(--card);
          border: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          border-radius: var(--radius);
        }

        .pk-form-row {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: 12px;
        }

        .pk-form-row > * {
          min-width: 0;
        }

        @media (max-width: 340px) {
          .pk-form-row {
            grid-template-columns: 1fr;
          }
        }

        .pk-form label {
          display: grid;
          gap: 4px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .pk-lab {
          display: inline;
          line-height: 1.2;
        }

        .pk-form input:not([type="checkbox"]),
        .pk-form textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 46px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid color-mix(in srgb, var(--pk-navy) 18%, transparent);
          font: inherit;
          font-weight: 400;
          background: #fff;
          transition: border-color 0.15s ease;
        }

        .pk-form textarea {
          min-height: 84px;
          resize: vertical;
        }

        .pk-form label.has-error input:not([type="checkbox"]) {
          border-color: #c44;
        }

        .req {
          color: #b42318;
          font-weight: 700;
        }

        .pk-acceptances {
          margin: 2px 0 0;
          padding: 0;
          border: 0;
          display: grid;
          gap: 12px;
          min-width: 0;
        }

        .pk-acceptances.has-error {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #f0bcbc;
          background: #fde8e8;
        }

        .pk-check-label {
          display: grid !important;
          grid-template-columns: 22px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          font-size: 0.86rem !important;
          font-weight: 450 !important;
          line-height: 1.45;
          color: var(--muted);
          cursor: pointer;
        }

        .pk-check-label input[type="checkbox"] {
          appearance: auto;
          -webkit-appearance: checkbox;
          width: 18px !important;
          height: 18px !important;
          min-width: 18px;
          min-height: 18px !important;
          max-width: 18px;
          margin: 2px 0 0;
          padding: 0 !important;
          border: 1px solid color-mix(in srgb, var(--pk-navy) 40%, transparent) !important;
          border-radius: 4px !important;
          background: #fff !important;
          accent-color: var(--pk-navy);
          cursor: pointer;
          flex-shrink: 0;
        }

        .pk-check-label span {
          min-width: 0;
        }

        .pk-check-label :global(strong) {
          font-weight: 700;
          color: var(--ink);
        }

        .pk-check-label :global(.pk-inline-link) {
          color: var(--pk-navy);
          font-weight: 650;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .pk-check-label:first-of-type span {
          color: var(--ink);
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

        .pk-wa-inner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .pk-wa-icon {
          flex-shrink: 0;
          display: block;
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

        .pk-wa-status {
          margin-top: 14px;
          padding: 14px 16px 16px;
          border-radius: var(--radius);
          border: 1px solid color-mix(in srgb, var(--pk-navy) 18%, transparent);
          background: color-mix(in srgb, var(--pk-navy) 6%, #fff);
          outline: none;
        }

        .pk-wa-status.is-sent {
          border-color: color-mix(in srgb, var(--wa) 35%, transparent);
          background: color-mix(in srgb, var(--wa) 10%, #fff);
        }

        .pk-wa-status-title {
          margin: 0 0 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.05rem;
          font-weight: 750;
          color: var(--pk-navy);
        }

        .pk-wa-status.is-sent .pk-wa-status-title {
          color: var(--wa);
        }

        .pk-wa-status-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: var(--wa);
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          line-height: 1;
        }

        .pk-wa-status-body {
          margin: 0 0 12px;
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.45;
        }

        .pk-wa-status-actions {
          display: grid;
          gap: 8px;
        }

        .pk-wa-status-primary,
        .pk-wa-status-secondary {
          min-height: 44px;
          border-radius: 10px;
          font: inherit;
          font-weight: 650;
          cursor: pointer;
        }

        .pk-wa-status-primary {
          border: 0;
          background: var(--wa);
          color: #fff;
        }

        .pk-wa-status-primary:hover {
          background: var(--wa-hover);
        }

        .pk-wa-status-secondary {
          border: 1px solid color-mix(in srgb, var(--pk-navy) 18%, transparent);
          background: #fff;
          color: var(--pk-navy);
        }

        .pk-form-error {
          margin: 0;
          color: #7a2e2e;
          font-size: 0.92rem;
          font-weight: 550;
        }

        .pk-footer {
          margin-top: 28px;
          padding-top: 14px;
          border-top: 1px solid color-mix(in srgb, var(--pk-navy) 12%, transparent);
          text-align: center;
        }

        .pk-footer :global(.pk-footer-link) {
          color: var(--muted);
          font-size: 0.86rem;
          font-weight: 550;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .pk-footer :global(.pk-footer-link:hover) {
          color: var(--pk-navy);
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
