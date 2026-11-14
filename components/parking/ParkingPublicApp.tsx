"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import ParkingGoogleReviews from "@/components/parking/ParkingGoogleReviews";
import SiteCopyright from "@/components/SiteCopyright";
import type { Locale } from "@/lib/i18n/shared";
import { externalAnchorProps } from "@/lib/links";
import { trackParkingEvent } from "@/lib/parking/analytics";
import { PARKING_TERMS_VERSION } from "@/lib/parking/conditionsContent";
import { PARKING_BADGE_SRC } from "@/lib/parking/constants";
import {
  formatMonthRangeLabel,
  formatMonthWithYear,
  formatParkingDate,
  formatShortParkingDate,
  getParkingCopy,
  PRICE_DASH,
} from "@/lib/parking/i18n";
import {
  DEFAULT_PARKING_RATES,
  estimateParkingPrice,
  formatEuroEstimate,
  periodLabelsFromRows,
  ratesMapFromRows,
  seasonForMonth,
  type ParkingRateRow,
  type ParkingSeason,
} from "@/lib/parking/pricing";
import { PARKING_GOOGLE_MAPS_URL } from "@/lib/parking/googleReviews";
import {
  parkingCanonicalUrl,
  parkingConditionsHref,
  parkingPrivacyHref,
} from "@/lib/parking/seo";
import { getParkingSupabase, parkingSupabaseConfigured } from "@/lib/parking/supabase";
import {
  buildWhatsAppMessage,
  countInclusiveDays,
  enquiryPeriodsOverlap,
  isDateUnavailable,
  MAX_ENQUIRY_PERIODS,
  nextAvailableDate,
  PARKING_WHATSAPP_NUMBER,
  parseISODate,
  rangeContainsUnavailable,
  toISODate,
  whatsAppHref,
  type EnquiryPeriod,
  type ParkingUnavailableRange,
} from "@/lib/parking/types";
import { formatNationalPhone, telHref } from "@/lib/tech/phone";

const WA_ICON_PATH =
  "M12.04 2a9.9 9.9 0 0 0-9.9 9.9c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01a9.9 9.9 0 0 0 9.9-9.9 9.86 9.86 0 0 0-9.91-9.92Zm5.76 14.07c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.29.59-.37.79-.37h.57c.18 0 .42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.3.39-.43.52-.14.14-.29.3-.12.58.16.29.73 1.2 1.56 1.94 1.08.96 1.98 1.26 2.27 1.4.28.14.45.12.61-.07.17-.2.7-.82.89-1.1.19-.29.38-.24.64-.14.26.1 1.66.78 1.95.92.28.15.47.21.54.33.07.12.07.68-.17 1.36Z";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="currentColor" d={WA_ICON_PATH} />
    </svg>
  );
}

/** Stable web URL for anchors (avoids Android intent hydration mismatch). */
function whatsAppWebHref(message: string): string {
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send/?phone=${PARKING_WHATSAPP_NUMBER}&text=${text}&type=phone_number&app_absent=0`;
}

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
  acceptHeight: boolean;
  acceptBooking: boolean;
  acceptPrivacy: boolean;
  acceptPolicy: boolean;
  termsVersion: string;
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
    const termsOk = parsed.termsVersion === PARKING_TERMS_VERSION;
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
      acceptHeight: termsOk && parsed.acceptHeight === true,
      acceptBooking: termsOk && parsed.acceptBooking === true,
      acceptPrivacy: termsOk && parsed.acceptPrivacy === true,
      acceptPolicy: termsOk && parsed.acceptPolicy === true,
      termsVersion: PARKING_TERMS_VERSION,
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

export default function ParkingPublicApp({
  locale,
  gallery,
  faq,
}: {
  locale: Locale;
  gallery?: ReactNode;
  faq?: ReactNode;
}) {
  const [rates, setRates] = useState(() => DEFAULT_PARKING_RATES);
  const [periodLabels, setPeriodLabels] = useState<
    [string, string, string] | null
  >(null);
  const t = useMemo(
    () => getParkingCopy(locale, rates, periodLabels ?? undefined),
    [locale, rates, periodLabels]
  );
  const [today, setToday] = useState(() => startOfToday());
  const currentMonth = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );
  const visibleMonthCount = useVisibleMonthCount();

  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [ranges, setRanges] = useState<ParkingUnavailableRange[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [configured] = useState(() => parkingSupabaseConfigured());
  const [loadingAvailability, setLoadingAvailability] = useState(
    () => parkingSupabaseConfigured()
  );

  // Empty SSR defaults — hydrate from sessionStorage after mount (avoid mismatch).
  const [draftReady, setDraftReady] = useState(false);
  const [arrival, setArrival] = useState<string | null>(null);
  const [departure, setDeparture] = useState<string | null>(null);
  const [periods, setPeriods] = useState<EnquiryPeriod[]>([]);
  const [multiMode, setMultiMode] = useState<"or" | "and">("or");
  const [hover, setHover] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [comments, setComments] = useState("");

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
  const [fabHidden, setFabHidden] = useState(false);
  const [waStatus, setWaStatus] = useState<WaStatus>("idle");
  const [waHref, setWaHref] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const acceptHeightRef = useRef<HTMLInputElement>(null);
  const arrivalSummaryRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const waStatusRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    setLiveMessage("");
    requestAnimationFrame(() => setLiveMessage(message));
  }, []);

  useEffect(() => {
    trackParkingEvent({ name: "parking_view", language: locale });
  }, [locale]);

  useEffect(() => {
    const draft = readPersisted();
    if (draft) {
      setArrival(draft.arrival);
      setDeparture(draft.departure);
      setPeriods(draft.periods);
      setMultiMode(draft.multiMode);
      setName(draft.name);
      setRegistration(draft.registration);
      setVehicle(draft.vehicle);
      setComments(draft.comments);
      setAcceptHeight(draft.acceptHeight);
      setAcceptBooking(draft.acceptBooking);
      setAcceptPrivacy(draft.acceptPrivacy);
      setAcceptPolicy(draft.acceptPolicy);
    }
    const wa = readWaStatus();
    setWaStatus(wa.status);
    setWaHref(wa.href);
    setDraftReady(true);
  }, []);

  useEffect(() => {
    function refreshToday() {
      const next = startOfToday();
      setToday((prev) => (prev.getTime() === next.getTime() ? prev : next));
      setPreparing(false);
    }
    function onPageShow() {
      refreshToday();
    }
    function onVisibility() {
      if (document.visibilityState === "visible") refreshToday();
    }
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!arrival || !departure || departure < arrival) return;
    const stayDays = countInclusiveDays(arrival, departure);
    const startSeason = seasonForMonth(parseISODate(arrival).getMonth());
    const endSeason = seasonForMonth(parseISODate(departure).getMonth());
    const season: ParkingSeason | "mixed" =
      startSeason === endSeason ? startSeason : "mixed";
    trackParkingEvent({
      name: "parking_dates_selected",
      language: locale,
      stayDays,
      season,
      hasQuote: estimateParkingPrice(arrival, departure, rates) > 0,
    });
  }, [arrival, departure, locale, rates]);

  function updateWaStatus(status: WaStatus, nextHref?: string | null) {
    if (status === "idle") {
      setWaStatus("idle");
      setWaHref(null);
      setPreparing(false);
      writeWaStatus("idle", null);
      return;
    }
    const href = nextHref ?? waHref;
    setWaStatus(status);
    if (href) setWaHref(href);
    writeWaStatus(status, href);
  }

  useEffect(() => {
    if (!draftReady) return;
    const payload: PersistedEnquiry = {
      arrival,
      departure,
      periods,
      multiMode,
      name,
      registration,
      vehicle,
      comments,
      acceptHeight,
      acceptBooking,
      acceptPrivacy,
      acceptPolicy,
      termsVersion: PARKING_TERMS_VERSION,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota / private mode */
    }
  }, [
    draftReady,
    arrival,
    departure,
    periods,
    multiMode,
    name,
    registration,
    vehicle,
    comments,
    acceptHeight,
    acceptBooking,
    acceptPrivacy,
    acceptPolicy,
  ]);

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
      setPreparing(false);
      if (event.persisted || document.visibilityState === "visible") {
        focusStatus();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [waStatus]);

  const loadErrorRef = useRef(t.loadError);
  loadErrorRef.current = t.loadError;

  const load = useCallback(async () => {
    if (!configured) {
      setRanges([]);
      setLoadError(null);
      setRates(DEFAULT_PARKING_RATES);
      setLoadingAvailability(false);
      return;
    }
    const supabase = getParkingSupabase();
    if (!supabase) {
      setLoadingAvailability(false);
      return;
    }
    setLoadingAvailability(true);
    try {
      const [rangesResult, ratesResult] = await Promise.all([
        supabase.rpc("parking_unavailable_ranges"),
        supabase.rpc("parking_public_rates"),
      ]);
      if (rangesResult.error) {
        setLoadError(loadErrorRef.current);
        setRanges([]);
      } else {
        setLoadError(null);
        setRanges((rangesResult.data || []) as ParkingUnavailableRange[]);
      }
      if (!ratesResult.error && ratesResult.data) {
        const rows = ratesResult.data as ParkingRateRow[];
        const fallback = getParkingCopy(locale).priceRows.map((r) => r.period) as [
          string,
          string,
          string,
        ];
        setRates(ratesMapFromRows(rows));
        setPeriodLabels(periodLabelsFromRows(rows, locale, fallback));
      } else {
        setRates(DEFAULT_PARKING_RATES);
        setPeriodLabels(null);
      }
    } finally {
      setLoadingAvailability(false);
    }
  }, [configured, locale]);

  useEffect(() => {
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

  const todayIso = useMemo(() => toISODate(today), [today]);
  const nextAvailableIso = useMemo(() => {
    if (loadingAvailability) return null;
    const next = nextAvailableDate(todayIso, ranges);
    if (!next || next === todayIso) return null;
    return next;
  }, [loadingAvailability, todayIso, ranges]);

  const canGoPrev =
    view.getFullYear() > currentMonth.getFullYear() ||
    (view.getFullYear() === currentMonth.getFullYear() &&
      view.getMonth() > currentMonth.getMonth());

  const previewEnd = departure || (arrival && hover ? hover : null);
  const bothDatesSelected = Boolean(arrival && departure);
  const durationDays =
    arrival && departure ? countInclusiveDays(arrival, departure) : 0;
  const draftEstimate =
    arrival && departure ? estimateParkingPrice(arrival, departure, rates) : 0;

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

  function selectArrivalOnly(iso: string) {
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
  }

  function onSelectNextAvailable() {
    if (!nextAvailableIso || loadingAvailability) return;
    const d = parseISODate(nextAvailableIso);
    if (d < today || isDateUnavailable(nextAvailableIso, ranges)) return;
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
    selectArrivalOnly(nextAvailableIso);
    document
      .getElementById("pk-availability")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSelectDay(iso: string) {
    if (loadingAvailability) return;
    const state = dayState(iso);
    if (state === "past" || state === "unavailable") return;

    if (!arrival || (arrival && departure)) {
      selectArrivalOnly(iso);
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

    const periodsOut = effectivePeriods();

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

  function focusFirstInvalid(
    errors: {
      arrival?: string;
      departure?: string;
      periods?: string;
      name?: string;
      acceptances?: string;
    },
    summary: string | null
  ) {
    if (summary && Object.keys(errors).length > 1) {
      requestAnimationFrame(() => {
        formErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        formErrorRef.current?.focus();
      });
      return;
    }
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

  function onFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const tag = target.tagName;
    if (tag === "TEXTAREA" || tag === "BUTTON" || target.getAttribute("type") === "submit") {
      return;
    }
    event.preventDefault();
  }

  function openWhatsApp() {
    if (preparing) return;

    const result = validate();
    setFieldErrors(result.errors);
    setFormError(result.summary);

    if (!result.ok) {
      trackParkingEvent({
        name: "parking_form_error",
        language: locale,
        errorKeys: Object.keys(result.errors),
      });
      focusFirstInvalid(result.errors, result.summary);
      return;
    }

    const periodsOut = result.periodsOut;
    if (periodsOut.length === 0) return;

    const primary = periodsOut[0];
    const stayDays = periodsOut.reduce(
      (sum, p) => sum + countInclusiveDays(p.arrival, p.departure),
      0
    );
    const startSeason = seasonForMonth(parseISODate(primary.arrival).getMonth());
    const endSeason = seasonForMonth(
      parseISODate(periodsOut[periodsOut.length - 1].departure).getMonth()
    );
    const season: ParkingSeason | "mixed" =
      periodsOut.length === 1 && startSeason === endSeason
        ? startSeason
        : "mixed";

    trackParkingEvent({
      name: "parking_whatsapp_click",
      language: locale,
      stayDays,
      season,
      hasQuote: periodsOut.some(
        (p) => estimateParkingPrice(p.arrival, p.departure, rates) > 0
      ),
    });

    const message = buildWhatsAppMessage({
      locale,
      periods: periodsOut,
      mode: periodsOut.length <= 1 ? "single" : multiMode,
      name: name.trim(),
      registration,
      vehicle,
      comments,
      pageUrl: parkingCanonicalUrl(locale),
      rates,
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

  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${t.locationLine1}, ${t.locationLine2}`
  )}`;
  const listingHref = PARKING_GOOGLE_MAPS_URL;
  const phoneDisplay = formatNationalPhone(PARKING_WHATSAPP_NUMBER);
  const phoneHref = telHref(PARKING_WHATSAPP_NUMBER);
  const contactWaHref = whatsAppWebHref(t.contactWhatsAppMessage);
  const tonightWaHref = whatsAppWebHref(t.whatsappTonightMessage);

  function onMapClick() {
    trackParkingEvent({ name: "parking_map_click", language: locale });
  }

  function onGoogleListingClick() {
    trackParkingEvent({
      name: "parking_google_listing_click",
      language: locale,
    });
  }

  function scrollToDates(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document
      .getElementById("pk-availability")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
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
            src={PARKING_BADGE_SRC}
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
                href={mapsHref}
                {...externalAnchorProps(mapsHref)}
                aria-label={t.directionsLabel}
                title={t.directionsLabel}
                onClick={onMapClick}
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
                href={listingHref}
                {...externalAnchorProps(listingHref)}
                onClick={onGoogleListingClick}
              >
                {t.locationLine1}, {t.locationLine2}
              </a>
            </p>
          </div>
        </div>
      </header>

      <ParkingGoogleReviews
        locale={locale}
        ratingLabel={t.googleRatingLabel}
        ratingAria={t.googleRatingAria}
        sourceLabel={t.googleOnMapsLabel}
      />

      {gallery}

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
        <p className="pk-prices-note">{t.pricesDisclaimer}</p>
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
        aria-busy={loadingAvailability || undefined}
      >
        {nextAvailableIso ? (
          <button
            type="button"
            className="pk-next-available"
            onClick={onSelectNextAvailable}
            aria-label={t.nextAvailableNoticeAria(
              formatParkingDate(nextAvailableIso, locale)
            )}
          >
            <span className="pk-next-available-tag">{t.nextAvailableTag}</span>
            <span className="pk-next-available-text">
              {t.nextAvailableNotice(formatParkingDate(nextAvailableIso, locale))}
            </span>
          </button>
        ) : null}
        <h2 id="pk-availability-heading">{t.availabilityTitle}</h2>
        {arrival && !departure ? (
          <p className="pk-availability-hint">{t.availabilityHintDeparture}</p>
        ) : null}

        <div className={`pk-cal${loadingAvailability ? " is-loading" : ""}`}>
          <h3 className="sr-only">{navRangeLabel}</h3>
          {loadingAvailability ? (
            <p className="pk-cal-loading" role="status" aria-live="polite">
              {t.loadingAvailability}
            </p>
          ) : (
            <div className="pk-cal-chrome">
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
              <div
                className="pk-months"
                style={{
                  gridTemplateColumns: `repeat(${visibleMonthCount}, minmax(0, 1fr))`,
                }}
              >
                {months.map((monthDate) => {
                  const cells = buildMonthCells(monthDate);
                  const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
                  return (
                    <div key={monthKey} className="pk-month">
                      <h4 className="pk-month-label">
                        {formatMonthWithYear(monthDate, locale)}
                      </h4>
                      <div className="pk-weekdays" aria-hidden="true">
                        {t.weekdays.map((d, weekdayIndex) => (
                          <div key={`${monthKey}-wd-${weekdayIndex}`}>{d}</div>
                        ))}
                      </div>
                      <div className="pk-grid">
                        {cells.map((cell, i) => {
                          if (!cell) {
                            return (
                              <div
                                key={`e-${monthKey}-${i}`}
                                className="pk-cell empty"
                              />
                            );
                          }
                          const iso = toISODate(cell);
                          const state = dayState(iso);
                          const disabled =
                            state === "past" || state === "unavailable";
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
                              aria-pressed={
                                state === "selected" || state === "inrange"
                              }
                              onPointerEnter={() => {
                                if (arrival && !departure && !disabled) {
                                  setHover(iso);
                                }
                              }}
                              onPointerLeave={() => setHover(null)}
                              onFocus={() => {
                                if (arrival && !departure && !disabled) {
                                  setHover(iso);
                                }
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
          )}
        </div>

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
                const estimate = estimateParkingPrice(p.arrival, p.departure, rates);
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
                          sum + estimateParkingPrice(p.arrival, p.departure, rates),
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
                          p.departure,
                          rates
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

      <section
        className="pk-form-section"
        aria-labelledby="pk-form-heading"
        onFocusCapture={() => setFabHidden(true)}
        onBlurCapture={(event) => {
          const next = event.relatedTarget as Node | null;
          if (!next || !event.currentTarget.contains(next)) {
            setFabHidden(false);
          }
        }}
      >
        <h2 id="pk-form-heading">{t.formTitle}</h2>

        <form
          className="pk-form"
          noValidate
          onKeyDown={onFormKeyDown}
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
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
              id="pk-name"
              required
              name="name"
              autoComplete="name"
              enterKeyHint="next"
              autoCapitalize="words"
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
                id="pk-registration"
                name="registration"
                autoComplete="off"
                enterKeyHint="next"
                autoCapitalize="characters"
                spellCheck={false}
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder={t.registrationPlaceholder}
              />
            </label>

            <label>
              <span className="pk-lab">{t.vehicle}</span>
              <input
                id="pk-vehicle"
                name="vehicle"
                autoComplete="off"
                enterKeyHint="next"
                autoCapitalize="sentences"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder={t.vehiclePlaceholder}
              />
            </label>
          </div>

          <label>
            <span className="pk-lab">{t.comments}</span>
            <textarea
              id="pk-comments"
              name="comments"
              rows={3}
              enterKeyHint="enter"
              autoComplete="off"
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
                  href={parkingPrivacyHref(locale)}
                  className="pk-inline-link"
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

          <aside className="pk-conditions-note" aria-label={t.conditionsLinkLabel}>
            <p>{t.conditionsNoticeHold}</p>
            <p>{t.conditionsNoticeVehicle}</p>
            <p>
              <Link
                href={parkingConditionsHref(locale)}
                className="pk-inline-link"
              >
                {t.conditionsLinkLabel}
              </Link>
            </p>
          </aside>

          <button type="submit" className="pk-wa" disabled={preparing} aria-busy={preparing}>
            <span className="pk-wa-inner">
              <WhatsAppIcon className="pk-wa-icon" />
              {preparing ? t.whatsappPreparing : t.whatsappCta}
            </span>
          </button>

          {formError ? (
            <p
              className="pk-form-error"
              role="alert"
              tabIndex={-1}
              ref={formErrorRef}
            >
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

      {faq}
    </div>

    <footer className="pk-contact" lang={locale}>
      <div className="pk-contact-inner">
        <div className="pk-contact-lead">
          <h2 className="pk-contact-title">{t.contactTitle}</h2>
          <a className="pk-contact-phone" href={phoneHref}>
            {phoneDisplay}
          </a>
          <p className="pk-contact-sub">{t.contactSub}</p>
        </div>
        <div className="pk-contact-ctas">
          <a
            className="pk-contact-btn pk-contact-btn-wa"
            href={contactWaHref}
            {...externalAnchorProps(contactWaHref)}
            onClick={(e) => {
              trackParkingEvent({
                name: "parking_whatsapp_contact_click",
                language: locale,
              });
              const href = whatsAppHref(t.contactWhatsAppMessage);
              if (href.startsWith("intent:")) {
                e.preventDefault();
                window.location.assign(href);
              }
            }}
          >
            <WhatsAppIcon className="pk-contact-wa-icon" />
            {t.contactWhatsApp}
          </a>
          <a
            className="pk-contact-btn pk-contact-btn-ghost"
            href="#pk-availability"
            onClick={scrollToDates}
          >
            {t.contactDatesCta}
          </a>
        </div>
        <div className="pk-contact-meta">
          <span className="pk-contact-place">{t.contactPlace}</span>
          <span className="pk-contact-sep" aria-hidden="true">
            ·
          </span>
          <Link
            href={parkingPrivacyHref(locale)}
            className="pk-contact-privacy"
          >
            {t.footerPrivacyLabel}
          </Link>
          <span className="pk-contact-sep" aria-hidden="true">
            ·
          </span>
          <SiteCopyright className="pk-contact-copy" />
        </div>
      </div>
    </footer>

    <a
      className={`pk-wa-fab${fabHidden ? " is-hidden" : ""}`}
      href={tonightWaHref}
      {...externalAnchorProps(tonightWaHref)}
      aria-label={t.whatsappTonightAria}
      aria-hidden={fabHidden || undefined}
      tabIndex={fabHidden ? -1 : undefined}
      onClick={(e) => {
        trackParkingEvent({
          name: "parking_whatsapp_tonight_click",
          language: locale,
        });
        const href = whatsAppHref(t.whatsappTonightMessage);
        if (href.startsWith("intent:")) {
          e.preventDefault();
          window.location.assign(href);
        }
      }}
    >
      <WhatsAppIcon className="pk-wa-fab-icon" />
      <span className="pk-wa-fab-label">{t.whatsappTonightLabel}</span>
    </a>
    </>
  );
}
