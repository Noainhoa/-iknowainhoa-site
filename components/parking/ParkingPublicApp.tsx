"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
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

  const navRangeLabel = useMemo(() => {
    const start = months[0];
    const end = months[months.length - 1];
    if (months.length === 1) return formatMonthWithYear(start, locale);
    return formatMonthRangeLabel(start, end, locale);
  }, [months, locale]);

  // #region agent log
  useEffect(() => {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const measure = () => {
      const navLabel = document.querySelector(".pk-cal-range")?.textContent?.trim() ?? "";
      const columnHeaders = [...document.querySelectorAll(".pk-month h3")].map(
        (el) => el.textContent?.trim() ?? ""
      );
      const payload = {
        sessionId: "267dce",
        runId: "post-fix",
        hypothesisId: "A",
        location: "ParkingPublicApp.tsx:month-headers",
        message: "month_header_counts",
        data: {
          visibleMonthCount,
          navLabel,
          columnHeaders,
          columnHeaderCount: columnHeaders.length,
          doubleLine: columnHeaders.length > 0,
          host,
        },
        timestamp: Date.now(),
      };
      if (isLocal) {
        fetch("http://127.0.0.1:7736/ingest/ed8edfac-b1ea-41ca-bead-699b28d53a6c", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "267dce",
          },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    };
    const t = window.setTimeout(measure, 50);
    return () => window.clearTimeout(t);
  }, [visibleMonthCount, navRangeLabel]);
  // #endregion

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
            fetchPriority="high"
          />
          <div className="pk-brand-text">
            <p className="pk-brand-name">{t.brand}</p>
            <h1 className="pk-title-row">
              <span className="pk-title-text">{t.title}</span>
              <a
                className="pk-directions"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${t.locationLine1}, ${t.locationLine2}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.directionsLabel}
                title={t.directionsLabel}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="currentColor"
                >
                  <path d="M21.71 11.29l-9-9a.996.996 0 0 0-1.41 0l-9 9a.996.996 0 0 0 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 0 0 0-1.41ZM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5L17.5 11 14 14.5Z" />
                </svg>
              </a>
            </h1>
            <p className="pk-location">
              <a
                className="pk-location-link"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${t.locationLine1}, ${t.locationLine2}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.locationLine1}, {t.locationLine2}
              </a>
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
                width={i === 1 ? 659 : 900}
                height={i === 1 ? 900 : i === 0 ? 509 : 673}
                loading={i === 0 ? "eager" : "lazy"}
                decoding={i === 0 ? "sync" : "async"}
                fetchPriority={i === 0 ? "high" : "low"}
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
        {arrival && !departure ? (
          <p className="pk-availability-hint">{t.availabilityHintDeparture}</p>
        ) : null}

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
              {navRangeLabel}
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
                aria-label={t.clearDates}
                title={t.clearDates}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
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
    </div>
  );
}
