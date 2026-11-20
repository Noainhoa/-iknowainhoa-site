"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  House,
  Laptop,
  MessagesSquare,
  PenLine,
  Phone,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { TechBrandLink } from "@/components/tech/TechBrandLink";
import TechContactLinks from "@/components/tech/TechContactLinks";
import { HeroBubbleIcon, IconCalendar, IconPhone } from "@/components/tech/TechIllustrations";
import WhatsAppMark from "@/components/tech/WhatsAppMark";
import SiteCopyright from "@/components/SiteCopyright";
import { externalAnchorProps } from "@/lib/links";
import { madridMinuteOfDay, minuteToHhMm, type SessionLanguage } from "@/lib/tech/calendar";
import {
  HOME_BLOCK_MINUTES,
  HOME_SHORT_BLOCK_MINUTES,
  homeArrivalsFromBlockStarts,
  homeBlockMinutes,
  homePriceCents,
  resolveCreateTiming,
  venueLabelForMode,
  type AssistanceMode,
} from "@/lib/tech/assistance";
import {
  GROUP_MINUTES,
  GROUP_PRICE_CENTS,
  INDIVIDUAL_MINUTES,
  INDIVIDUAL_SHORT_MINUTES,
  TECH_PATH,
  priceCentsForCreate,
} from "@/lib/tech/constants";
import { siteWhatsAppEnquiryHref } from "@/lib/site";
import { formatNationalPhone, telHref } from "@/lib/tech/phone";
import type { TechCopy } from "@/lib/tech/i18n";
import type { TechLocale } from "@/lib/tech/locale";
import { buildIcs } from "@/lib/tech/ics";
import { customerWhatsAppText } from "@/lib/tech/messages";
import { techConditionsHref, techPageHref } from "@/lib/tech/seo";
import { readSource } from "@/lib/tech/validate";
import { formatMadrid, madridDayKey, madridLocalToUtc } from "@/lib/tech/time";
import { newIdempotencyKey } from "@/lib/tech/idempotency";
import {
  buildGroupOffers,
  buildPrivateOffers,
  type OfferSession,
  type PublicOffer,
} from "@/lib/tech/public-offers";
import {
  filterStartsToPublicWindows,
  isShortNotice,
  isWithinPublicOfferWindow,
} from "@/lib/tech/public-windows";

const TIMES = Array.from({ length: 20 }, (_, index) => {
  const minutes = 9 * 60 + index * 30;
  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
});

const SLOT_GONE = new Set([
  "tech_full",
  "tech_not_bookable",
  "tech_overlap",
  "tech_week_full",
  "tech_blocked",
  "tech_session_started",
  "tech_calendar_off",
  "tech_outside_hours",
  "tech_language_mismatch",
  "tech_too_far",
]);

type View = "groups" | "private" | "request" | "details";
type BookingPath = "group" | "private" | "remote" | "home";

function assistanceForPath(path: BookingPath): AssistanceMode {
  if (path === "remote") return "phone";
  if (path === "home") return "home_visit";
  return "onsite";
}

function listViewForPath(path: BookingPath): "groups" | "private" {
  return path === "group" ? "groups" : "private";
}

/** Shared geometry for the teacher identity mark (viewBox 0 0 320 320). */
const TEACHER_MARK = 320;
const TEACHER_CX = 160;
const TEACHER_CY = 160;
/** Icon badge centres. */
const TEACHER_ICON_R = 130;
/** Outer face of the portrait ring. */
const TEACHER_HUB_R = 99;
/**
 * Badge radius in viewBox units (~34–36px badges on 248–280px mark).
 * Spokes end here so they meet the badge perimeter exactly.
 */
const TEACHER_BADGE_R = 21.5;
const TEACHER_SPOKE_END_R = TEACHER_ICON_R - TEACHER_BADGE_R;
/** Five skills, evenly spaced from top, clockwise. */
const TEACHER_NODES: {
  key: string;
  Icon: LucideIcon;
  deg: number;
}[] = [
  { key: "tech", Icon: Laptop, deg: -90 },
  { key: "teach", Icon: BookOpen, deg: -18 },
  { key: "talk", Icon: MessagesSquare, deg: 54 },
  { key: "code", Icon: Code2, deg: 126 },
  { key: "design", Icon: PenLine, deg: 198 },
];

function teacherPolar(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: TEACHER_CX + radius * Math.cos(rad),
    y: TEACHER_CY + radius * Math.sin(rad),
  };
}

type Success = {
  title: string;
  reference: string;
  when: string;
  price: string;
  where: string;
  path: string | null;
  kind: "group" | "individual" | "request";
  startsAt: string;
  durationMinutes: number;
  replayed: boolean;
};

function plainEuros(cents: number, locale: TechLocale): string {
  const tag = locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : "es-ES";
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

function sentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

function classLanguage(locale: TechLocale): SessionLanguage {
  return locale === "en" ? "en" : "es";
}

function localeTag(locale: TechLocale): string {
  return locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : "es-ES";
}

function dayBits(day: string, locale: TechLocale): { weekday: string; dayNum: string; month: string } {
  const instant = madridLocalToUtc(day, "12:00");
  const tag = localeTag(locale);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(tag, { timeZone: "Europe/Madrid", ...options }).format(instant);
  const tidy = (value: string) => {
    const cleaned = value.replace(".", "");
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };
  return {
    weekday: tidy(format({ weekday: "short" })),
    dayNum: format({ day: "numeric" }),
    month: tidy(format({ month: "short" })),
  };
}

function clock(iso: string, locale: TechLocale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function shiftDay(day: string, days: number): string {
  const instant = madridLocalToUtc(day, "12:00");
  instant.setUTCDate(instant.getUTCDate() + days);
  return madridDayKey(instant);
}

function weekMonday(day: string): string {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    weekday: "short",
  }).format(madridLocalToUtc(day, "12:00"));
  const index = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekday);
  return shiftDay(day, index < 0 ? 0 : -index);
}

function weekTitle(start: string, locale: TechLocale, weekCount = 1): string {
  const end = shiftDay(start, weekCount * 7 - 1);
  const tag = localeTag(locale);
  const format = (day: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(tag, { timeZone: "Europe/Madrid", ...options })
      .format(madridLocalToUtc(day, "12:00"))
      .replace(".", "");
  const startNum = format(start, { day: "numeric" });
  const endNum = format(end, { day: "numeric" });
  const startMonth = format(start, { month: "short" });
  const endMonth = format(end, { month: "short" });
  if (startMonth.toLowerCase() === endMonth.toLowerCase()) return `${startNum}–${endNum} ${endMonth}`;
  return `${startNum} ${startMonth} – ${endNum} ${endMonth}`;
}

function dayTitle(day: string, locale: TechLocale): string {
  return sentenceCase(
    new Intl.DateTimeFormat(localeTag(locale), {
      timeZone: "Europe/Madrid",
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(madridLocalToUtc(day, "12:00"))
  );
}

export default function TechPublicApp({
  locale,
  copy,
}: {
  locale: TechLocale;
  copy: TechCopy;
}) {
  const searchParams = useSearchParams();
  const phoneDisplay = formatNationalPhone();
  const spoken = classLanguage(locale);
  const [sessions, setSessions] = useState<OfferSession[]>([]);
  const [templateReady, setTemplateReady] = useState(false);
  const [bookableStarts, setBookableStarts] = useState<string[]>([]);
  const [bookableStartsShort, setBookableStartsShort] = useState<string[]>([]);
  const [bookableStartsHome, setBookableStartsHome] = useState<string[]>([]);
  const [bookableStartsHomeShort, setBookableStartsHomeShort] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error" | "off">("loading");
  const [view, setView] = useState<View>("groups");
  const [bookingPath, setBookingPath] = useState<BookingPath | null>(null);
  const [offer, setOffer] = useState<PublicOffer | null>(null);
  const [selection, setSelection] = useState<PublicOffer | null>(null);
  const [assistanceMode, setAssistanceMode] = useState<AssistanceMode>("onsite");
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => weekMonday(madridDayKey(new Date())));
  const [privateMinutes, setPrivateMinutes] = useState<30 | 60>(30);
  const [date, setDate] = useState(() => madridDayKey(new Date()));
  const [time, setTime] = useState("10:00");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [company, setCompany] = useState("");
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const idempotency = useRef(newIdempotencyKey());
  const reloadRef = useRef<() => void>(() => undefined);
  const successRef = useRef<HTMLHeadingElement>(null);
  const pickRef = useRef<HTMLElement>(null);
  const listView = useRef<"groups" | "private">("groups");

  function langHref(next: TechLocale) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    return `${TECH_PATH}?${params.toString()}`;
  }

  useEffect(() => {
    setSource(readSource(searchParams.get("src")));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function load(quiet: boolean) {
      if (!quiet && !cancelled) setLoadState("loading");
      try {
        const response = await fetch("/api/tech/availability");
        if (cancelled) return;
        if (response.status === 503) {
          setLoadState("off");
          return;
        }
        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          templateReady?: boolean;
          sessions?: OfferSession[];
          bookableStarts?: string[];
          bookableStartsShort?: string[];
          bookableStartsHome?: string[];
          bookableStartsHomeShort?: string[];
          error?: string;
        } | null;
        if (!response.ok || !payload?.ok) throw new Error(payload?.error || "tech_failed");
        if (cancelled) return;
        setTemplateReady(payload.templateReady === true);
        setSessions(
          (payload.sessions ?? []).map((session) => ({
            ...session,
            sessionLanguage: session.sessionLanguage === "en" ? "en" : "es",
            venueLabel: session.venueLabel || "",
          }))
        );
        setBookableStarts(payload.bookableStarts ?? []);
        setBookableStartsShort(payload.bookableStartsShort ?? []);
        setBookableStartsHome(payload.bookableStartsHome ?? []);
        setBookableStartsHomeShort(payload.bookableStartsHomeShort ?? []);
        setLoadState("ready");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    }
    reloadRef.current = () => {
      void load(true);
    };
    void load(false);
    return () => {
      cancelled = true;
    };
  }, []);

  const bookingIdentity =
    offer?.key ??
    (bookingPath === "home"
      ? `home:${date}:${time}:${privateMinutes}`
      : view === "request"
        ? `request:${date}:${time}`
        : "");

  useEffect(() => {
    idempotency.current = newIdempotencyKey();
  }, [bookingIdentity]);

  useEffect(() => {
    successRef.current?.focus();
  }, [success]);

  useEffect(() => {
    if (view === "details" || view === "request") {
      pickRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [view, offer?.key]);

  const privateDuration = privateMinutes === 30 ? INDIVIDUAL_SHORT_MINUTES : INDIVIDUAL_MINUTES;
  const calendarBookableStarts = useMemo(
    () => filterStartsToPublicWindows(bookableStarts, GROUP_MINUTES),
    [bookableStarts]
  );
  const calendarBookableStartsShort = useMemo(
    () => filterStartsToPublicWindows(bookableStartsShort, INDIVIDUAL_SHORT_MINUTES),
    [bookableStartsShort]
  );
  const calendarSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.kind !== "group" ||
          isWithinPublicOfferWindow(session.startsAt, session.durationMinutes)
      ),
    [sessions]
  );

  const groupOffers = useMemo(
    () =>
      buildGroupOffers({
        sessions: calendarSessions,
        bookableStarts: calendarBookableStarts,
        templateReady,
        createLanguage: spoken,
      }),
    [calendarSessions, calendarBookableStarts, templateReady, spoken]
  );

  const privateOffers = useMemo(
    () =>
      buildPrivateOffers({
        bookableStarts: privateMinutes === 30 ? calendarBookableStartsShort : calendarBookableStarts,
        durationMinutes: privateDuration,
        templateReady,
        createLanguage: spoken,
      }),
    [calendarBookableStarts, calendarBookableStartsShort, privateDuration, privateMinutes, templateReady, spoken]
  );
  const homeArrivalTimes = useMemo(() => {
    const blockMinutes = privateMinutes === 30 ? HOME_SHORT_BLOCK_MINUTES : HOME_BLOCK_MINUTES;
    const raw = privateMinutes === 30 ? bookableStartsHomeShort : bookableStartsHome;
    const blocks = filterStartsToPublicWindows(raw, blockMinutes);
    return new Set(homeArrivalsFromBlockStarts(blocks).map((iso) => new Date(iso).getTime()));
  }, [bookableStartsHome, bookableStartsHomeShort, privateMinutes]);

  // Request flow: any real admin free start (30 or 60 grid), not tied to private duration toggle.
  const requestAdminStarts = useMemo(() => {
    return new Set([...bookableStarts, ...bookableStartsShort]);
  }, [bookableStarts, bookableStartsShort]);

  const requestTimesForDate = useMemo(() => {
    const options = new Set<string>();
    for (const iso of requestAdminStarts) {
      if (madridDayKey(new Date(iso)) !== date) continue;
      if (new Date(iso).getTime() <= Date.now()) continue;
      options.add(minuteToHhMm(madridMinuteOfDay(new Date(iso))));
    }
    return [...options].sort();
  }, [date, requestAdminStarts]);

  useEffect(() => {
    if (view !== "request") return;
    if (requestTimesForDate.includes(time)) return;
    setTime(requestTimesForDate[0] ?? "10:00");
  }, [view, requestTimesForDate, time]);

  const homeTimesForDate = useMemo(() => {
    const options = new Set<string>();
    for (const ms of homeArrivalTimes) {
      const instant = new Date(ms);
      if (madridDayKey(instant) !== date) continue;
      if (instant.getTime() <= Date.now()) continue;
      options.add(minuteToHhMm(madridMinuteOfDay(instant)));
    }
    return [...options].sort();
  }, [date, homeArrivalTimes]);

  useEffect(() => {
    if (bookingPath !== "home") return;
    if (homeTimesForDate.includes(time)) return;
    setTime(homeTimesForDate[0] ?? "10:00");
  }, [bookingPath, homeTimesForDate, time]);

  const requestInstant = useMemo(() => madridLocalToUtc(date, time), [date, time]);
  const requestIsAdminFree = requestAdminStarts.has(requestInstant.toISOString());
  const requestNeedsCall = requestIsAdminFree && isShortNotice(requestInstant);
  const homeInstant = requestInstant;
  const homeSlotOk = homeArrivalTimes.has(homeInstant.getTime());
  const homeNeedsCall = homeSlotOk && isShortNotice(homeInstant);
  const activeOffers = useMemo(() => {
    if (!bookingPath) return [];
    if (bookingPath === "group") return groupOffers;
    if (bookingPath === "home") {
      return privateOffers.filter((item) =>
        homeArrivalTimes.has(new Date(item.startsAt).getTime())
      );
    }
    return privateOffers;
  }, [bookingPath, groupOffers, homeArrivalTimes, privateOffers]);
  const todayKey = madridDayKey(new Date());
  const weekCount = 4;
  const visibleDays = useMemo(
    () => Array.from({ length: weekCount * 7 }, (_, index) => shiftDay(weekStart, index)),
    [weekStart, weekCount]
  );
  const visibleWeeks = useMemo(
    () => Array.from({ length: weekCount }, (_, index) => shiftDay(weekStart, index * 7)),
    [weekStart, weekCount]
  );
  const offerMap = useMemo(() => {
    const map = new Map<string, PublicOffer[]>();
    for (const item of activeOffers) {
      const key = madridDayKey(new Date(item.startsAt));
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [activeOffers]);
  const selectedDay =
    dayKey && visibleDays.includes(dayKey) && (offerMap.get(dayKey)?.length ?? 0) > 0
      ? dayKey
      : (visibleDays.find((day) => (offerMap.get(day)?.length ?? 0) > 0) ?? null);
  const dayOffers = selectedDay ? (offerMap.get(selectedDay) ?? []) : [];
  const lastOfferDay = activeOffers.length
    ? madridDayKey(new Date(activeOffers[activeOffers.length - 1].startsAt))
    : todayKey;
  const canPrev = weekStart > weekMonday(todayKey);
  const canNext = shiftDay(weekStart, weekCount * 7) <= weekMonday(lastOfferDay);

  const priceLabel = plainEuros(GROUP_PRICE_CENTS, locale);

  function languageNote(language: SessionLanguage): string | null {
    if (language === locale) return null;
    return language === "en" ? copy.inEnglish : copy.inSpanish;
  }

  function minutes(value: number): string {
    return copy.minutesLong.replace("{n}", String(value));
  }

  function seats(item: PublicOffer): string | null {
    if (item.kind === "individual") return copy.alone;
    if (item.seatsLeft == null) return copy.openSeat;
    if (item.seatsLeft === 1) return copy.seatsOne;
    return copy.seatsMany.replace("{n}", String(item.seatsLeft));
  }

  function openOffer(next: PublicOffer, from: "groups" | "private") {
    listView.current = from;
    setError(null);
    setSelection(next);
    setOffer(next);
    setView("details");
  }

  function backToList() {
    setOffer(null);
    setView(listView.current);
    setError(null);
  }

  function choosePath(path: BookingPath) {
    setBookingPath(path);
    setAssistanceMode(assistanceForPath(path));
    listView.current = listViewForPath(path);
    setView(listViewForPath(path));
    if (path === "home") setPrivateMinutes(60);
    setOffer(null);
    setSelection(null);
    setDayKey(null);
    setError(null);
  }

  const offerHomeOk =
    !!offer &&
    offer.kind === "individual" &&
    offer.mode === "create" &&
    homeArrivalTimes.has(new Date(offer.startsAt).getTime());

  const detailsTiming =
    offer?.kind === "individual" && offer.mode === "create"
      ? resolveCreateTiming({
          mode: assistanceMode,
          arrivalAt: offer.startsAt,
          helpMinutes: offer.durationMinutes,
        })
      : null;

  const detailsPriceCents =
    detailsTiming?.priceCents ??
    offer?.priceCents ??
    (offer ? priceCentsForCreate(offer.kind, offer.durationMinutes) : 0);

  const detailsVenue =
    offer?.kind === "group"
      ? offer.venueLabel || copy.placeBody
      : venueLabelForMode(assistanceMode, offer?.venueLabel || copy.placeBody);

  const detailsHelpMinutes = detailsTiming?.helpMinutes ?? offer?.durationMinutes ?? GROUP_MINUTES;

  function chooseDay(key: string) {
    setDayKey(key);
    setSelection((current) =>
      current && madridDayKey(new Date(current.startsAt)) === key ? current : null
    );
  }

  function shiftWeek(direction: number) {
    setWeekStart((current) => shiftDay(current, direction * weekCount * 7));
    setDayKey(null);
    setSelection(null);
    setError(null);
  }

  function dropOffer(item: PublicOffer) {
    if (item.mode === "join" && item.sessionId) {
      setSessions((current) => current.filter((session) => session.id !== item.sessionId));
      return;
    }
    if (item.durationMinutes === INDIVIDUAL_SHORT_MINUTES) {
      setBookableStartsShort((current) => current.filter((start) => start !== item.startsAt));
      return;
    }
    setBookableStarts((current) => current.filter((start) => start !== item.startsAt));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    const requesting = view === "request";
    const homeBooking =
      bookingPath === "home" && (view === "groups" || view === "private");
    if (requesting) {
      if (!requestIsAdminFree || requestTimesForDate.length === 0) {
        setError("tech_not_bookable");
        return;
      }
      if (requestNeedsCall) return;
    }
    if (homeBooking) {
      if (!homeSlotOk || homeTimesForDate.length === 0) {
        setError("tech_home_unavailable");
        return;
      }
      if (homeNeedsCall) return;
    }
    setSaving(true);
    const endpoint = requesting ? "/api/tech/request" : "/api/tech/book";
    let requestedStart: string | undefined;
    let homeStartsAt: string | undefined;
    if (requesting || homeBooking) {
      try {
        const start = madridLocalToUtc(date, time).toISOString();
        if (requesting) requestedStart = start;
        if (homeBooking) homeStartsAt = start;
      } catch {
        setSaving(false);
        setError("tech_failed");
        return;
      }
    }
    const bookPayload = requesting
      ? { requestedStart }
      : homeBooking
        ? {
            startsAt: homeStartsAt,
            kind: "individual" as const,
            durationMinutes: INDIVIDUAL_MINUTES,
            assistanceMode: "home_visit" as const,
          }
      : offer?.mode === "join" && offer.sessionId
        ? { sessionId: offer.sessionId }
        : offer?.mode === "create"
          ? {
              startsAt: offer.startsAt,
              kind: offer.kind,
              durationMinutes: offer.durationMinutes,
              assistanceMode: offer.kind === "group" ? "onsite" : assistanceMode,
            }
          : null;
    if (!bookPayload) {
      setSaving(false);
      setError("tech_failed");
      return;
    }
    if (
      !requesting &&
      !homeBooking &&
      offer?.kind === "individual" &&
      assistanceMode === "home_visit" &&
      !offerHomeOk
    ) {
      setSaving(false);
      setError("tech_home_unavailable");
      return;
    }
    const sessionLanguage = offer?.sessionLanguage ?? spoken;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookPayload,
          idempotencyKey: idempotency.current,
          contactName,
          attendeeName: "",
          bookingForOther: false,
          phone,
          email: "",
          question: "",
          acceptTerms,
          company,
          source,
          locale,
          sessionLanguage,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (payload?.ignored) {
        setSaving(false);
        return;
      }
      if (!response.ok || !payload?.ok) {
        const code = typeof payload?.error === "string" ? payload.error : "tech_failed";
        setError(code);
        if (!requesting && offer && SLOT_GONE.has(code)) {
          dropOffer(offer);
          setOffer(null);
          setSelection(null);
          setView(listView.current);
          reloadRef.current();
        }
        setSaving(false);
        return;
      }
      const startsAt = payload.startsAt as string;
      const kind = payload.kind as Success["kind"];
      setSuccess({
        title: kind === "request" ? copy.requestedTitle : copy.confirmedTitle,
        reference: payload.reference,
        when: formatMadrid(new Date(startsAt), locale),
        price: plainEuros(payload.priceCents, locale),
        where: payload.venueLabel || copy.pendingPlace,
        path: payload.confirmationPath,
        kind,
        startsAt,
        durationMinutes: payload.durationMinutes,
        replayed: payload.replayed === true,
      });
    } catch {
      setError("network");
    } finally {
      setSaving(false);
    }
  }

  function downloadCalendar(item: Success) {
    if (item.kind === "request") return;
    const startsAt = new Date(item.startsAt);
    const endsAt = new Date(startsAt.getTime() + item.durationMinutes * 60 * 1000);
    const ics = buildIcs({
      reference: item.reference,
      title: copy.brandName,
      startsAt,
      endsAt,
      location: item.where,
      description: `${copy.reference} ${item.reference}`,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guardamar-click-${item.reference}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const enquiryMessage = success
    ? customerWhatsAppText({
        locale,
        reference: success.reference,
        when: success.when,
        kind: success.kind,
      })
    : locale === "en"
      ? "Hello Ainhoa, I would like technology help in Guardamar."
      : locale === "nl"
        ? "Hallo Ainhoa, ik zou graag technische hulp in Guardamar willen."
        : "Hola Ainhoa, me gustaría una sesión de ayuda tecnológica en Guardamar.";
  const fabWhatsAppHref = siteWhatsAppEnquiryHref(copy.fabWhatsAppMessage);

  function chipLabel(item: PublicOffer): string {
    const place = seats(item);
    const note = languageNote(item.sessionLanguage);
    return [place, note].filter(Boolean).join(" · ");
  }

  function personFields(submitLabel: string) {
    return (
      <>
        <div className="tme-request-when">
          <div className="tme-request-field">
            <label htmlFor="tme-name">{copy.contactName}</label>
            <input
              id="tme-name"
              type="text"
              name="name"
              autoComplete="name"
              autoCapitalize="words"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              required
            />
          </div>
          <div className="tme-request-field">
            <label htmlFor="tme-phone">{copy.phone}</label>
            <input
              id="tme-phone"
              type="tel"
              name="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>
        </div>
        <label className="tme-check">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
          />
          <span>
            {copy.termsAcceptBefore}
            <Link className="tme-inline-link" href={techConditionsHref(locale)}>
              {copy.termsLinkLabel}
            </Link>
            {copy.termsAcceptAfter}
          </span>
        </label>
        <div className="tme-hp" aria-hidden="true">
          <label htmlFor="tme-company">Company</label>
          <input
            id="tme-company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>
        {error ? (
          <p className="tme-alert" role="alert">
            {copy.errors[error] || copy.errors.tech_failed}
          </p>
        ) : null}
        <button className="tme-book" type="submit" disabled={saving}>
          {saving ? copy.saving : submitLabel}
        </button>
      </>
    );
  }

  const bar = (
    <header className="tme-bar">
      <div className="tme-lockup">
        <TechBrandLink href={techPageHref(locale)} name={copy.brandName} />
        <span className="tme-wordmark">{copy.brandName}</span>
      </div>
      <div className="tme-bar-tools">
        <a className="tme-call" href={telHref()} aria-label={`${copy.callNow} ${phoneDisplay}`}>
          <IconPhone />
          <span className="tme-call-word">{copy.callNow}</span>
          <span className="tme-call-num">{phoneDisplay}</span>
        </a>
        <nav className="tme-lang" aria-label={copy.langLabel}>
          <Link href={langHref("es")} hrefLang="es" lang="es" aria-current={locale === "es" ? "page" : undefined} prefetch={false}>
            ES
          </Link>
          <span className="tme-lang-sep" aria-hidden="true">/</span>
          <Link href={langHref("en")} hrefLang="en" lang="en" aria-current={locale === "en" ? "page" : undefined} prefetch={false}>
            EN
          </Link>
          <span className="tme-lang-sep" aria-hidden="true">/</span>
          <Link href={langHref("nl")} hrefLang="nl" lang="nl" aria-current={locale === "nl" ? "page" : undefined} prefetch={false}>
            NL
          </Link>
        </nav>
      </div>
    </header>
  );

  if (success) {
    const reserved = success.kind !== "request";
    return (
      <div className="tme tme-home">
        <div className="tme-home-wrap">
          {bar}
          <section className="tme-confirm">
            <h1 ref={successRef} tabIndex={-1}>
              {success.title}
            </h1>
            {reserved ? null : <p className="tme-lede">{copy.requestPending}</p>}
            <dl className="tme-confirm-facts">
              <div>
                <dt>{copy.when}</dt>
                <dd>{sentenceCase(success.when)}</dd>
              </div>
              {reserved ? (
                <div>
                  <dt>{copy.price}</dt>
                  <dd>{success.price}</dd>
                </div>
              ) : null}
              <div>
                <dt>{copy.where}</dt>
                <dd>{success.where}</dd>
              </div>
              <div>
                <dt>{copy.reference}</dt>
                <dd>{success.reference}</dd>
              </div>
            </dl>
            {success.path ? <p><a href={success.path}>{copy.manageLink}</a></p> : <p>{copy.replayed}</p>}
            {reserved ? <p className="tme-note">{copy.paySafe}</p> : null}
            {reserved ? <p>{copy.keepScreen}</p> : null}
            {reserved ? <p>{copy.cancelHelp}</p> : null}
            <TechContactLinks
              copy={copy}
              message={enquiryMessage}
              preferCallLabel={`${copy.callNow} ${phoneDisplay}`}
              className="tme-home-actions"
            />
            {reserved ? (
              <button type="button" className="tme-linkish" onClick={() => downloadCalendar(success)}>
                {copy.calendar}
              </button>
            ) : null}
            <button
              type="button"
              className="tme-linkish"
              onClick={() => {
                idempotency.current = newIdempotencyKey();
                setSuccess(null);
                setOffer(null);
                setSelection(null);
                setBookingPath(null);
                setAssistanceMode("onsite");
                setView("groups");
                setAcceptTerms(false);
                reloadRef.current();
              }}
            >
              {copy.back}
            </button>
          </section>
          <footer className="tme-foot">
            <SiteCopyright style={{ color: "inherit", fontSize: "0.85rem", textAlign: "center" }} />
          </footer>
        </div>
      </div>
    );
  }

  const listMode: "groups" | "private" = view === "private" ? "private" : "groups";
  const pathLabel =
    bookingPath === "group"
      ? copy.forkGroupTitle
      : bookingPath === "private"
        ? copy.forkPrivateTitle
        : bookingPath === "remote"
          ? copy.forkRemoteTitle
          : bookingPath === "home"
            ? copy.forkHomeTitle
            : null;
  const forkOptions: {
    path: BookingPath;
    title: string;
    body: string;
    Icon: typeof UsersRound;
  }[] = [
    { path: "group", title: copy.forkGroupTitle, body: copy.forkGroupBody, Icon: UsersRound },
    { path: "private", title: copy.forkPrivateTitle, body: copy.forkPrivateBody, Icon: UserRound },
    { path: "remote", title: copy.forkRemoteTitle, body: copy.forkRemoteBody, Icon: Phone },
    { path: "home", title: copy.forkHomeTitle, body: copy.forkHomeBody, Icon: House },
  ];

  return (
    <div className="tme tme-home">
      <div className="tme-home-wrap">
        {bar}
        <header className="tme-intro">
          <div className="tme-intro-copy">
            <h1>{copy.heroTitle}</h1>
            <p className="tme-lede">{copy.heroLede}</p>
            <p className="tme-reassure">{copy.heroReassure}</p>
            <p className="tme-price">
              <span>{copy.priceFrom.split("{price}")[0]?.trim()}</span>
              <strong>{priceLabel}</strong>
            </p>
          </div>
          <ul className="tme-bubbles" aria-label={copy.heroBubblesLabel}>
            {copy.heroBubbles.map((line, index) => (
              <li key={line}>
                <span className="tme-bubble-icon" aria-hidden="true">
                  <HeroBubbleIcon index={index} />
                </span>
                <span className="tme-bubble-text">{line}</span>
              </li>
            ))}
          </ul>
        </header>

        <section
          className="tme-panel"
          aria-labelledby={view === "request" ? undefined : "tme-choose"}
          aria-label={view === "request" ? copy.otherTime : undefined}
          ref={pickRef}
        >
            {view === "request" || view === "details" ? (
              <div className={`tme-panel-head${view === "request" ? " is-request" : ""}`}>
                {view === "request" ? (
                  <button
                    type="button"
                    className="tme-linkish tme-panel-back"
                    onClick={() => {
                      setView(listView.current);
                      setError(null);
                    }}
                  >
                    <ChevronLeft className="tme-panel-back-chevron" aria-hidden="true" />
                    <IconCalendar />
                    <span>{copy.requestBack}</span>
                  </button>
                ) : (
                  <h2 id="tme-choose">{copy.formLead}</h2>
                )}
              </div>
            ) : null}

            {loadState === "loading" ? <p role="status">{copy.loading}</p> : null}

            {loadState === "error" || loadState === "off" ? (
              <div className="tme-empty">
                <p className={loadState === "error" ? "tme-alert" : "tme-note"} role={loadState === "error" ? "alert" : "status"}>
                  {loadState === "error" ? copy.loadError : copy.notConfigured}
                </p>
                <a className="tme-book" href={telHref()}>
                  {copy.callNow} {phoneDisplay}
                </a>
              </div>
            ) : null}

            {loadState === "ready" && view === "details" && offer ? (
              <form onSubmit={onSubmit} noValidate>
                <p className="tme-chosen">
                  {sentenceCase(formatMadrid(new Date(offer.startsAt), locale))}
                  {" · "}
                  {minutes(detailsHelpMinutes)}
                  {" · "}
                  {plainEuros(detailsPriceCents, locale)}
                  {seats(offer) ? ` · ${seats(offer)}` : ""}
                </p>
                {pathLabel ? <p className="tme-where"><strong>{pathLabel}</strong></p> : null}
                {offer.kind === "group" ? (
                  <p className="tme-where">{copy.assistanceOnsiteBody}</p>
                ) : assistanceMode === "phone" ? (
                  <p className="tme-where">{copy.assistancePhoneBody}</p>
                ) : assistanceMode === "home_visit" ? (
                  <p className="tme-where">{copy.assistanceHomeBody}</p>
                ) : (
                  <p className="tme-where">{copy.assistanceOnsiteBody}</p>
                )}
                {assistanceMode === "home_visit" && offer.kind === "individual" && offer.mode === "create" ? (
                  offerHomeOk && detailsTiming ? (
                    <p className="tme-assist-travel">
                      {copy.assistanceHomeTravel
                        .replace("{help}", String(detailsTiming.helpMinutes))
                        .replace("{total}", String(homeBlockMinutes(detailsTiming.helpMinutes)))
                        .replace("{price}", plainEuros(detailsTiming.priceCents, locale))}
                    </p>
                  ) : (
                    <p className="tme-assist-travel" role="status">
                      {copy.homeVisitUnavailable}{" "}
                      <button type="button" className="tme-linkish" onClick={backToList}>
                        {copy.changeTime}
                      </button>
                    </p>
                  )
                ) : null}
                <p className="tme-where">{detailsVenue}</p>
                {languageNote(offer.sessionLanguage) ? <p className="tme-where">{languageNote(offer.sessionLanguage)}</p> : null}
                <button type="button" className="tme-linkish" onClick={backToList}>
                  {copy.changeTime}
                </button>
                {!(assistanceMode === "home_visit" && offer.kind === "individual" && !offerHomeOk) ? (
                  <>
                    <p className="tme-note">{copy.paySafe}</p>
                    {personFields(copy.submitBook)}
                  </>
                ) : null}
              </form>
            ) : null}

            {loadState === "ready" && view === "request" ? (
              <form onSubmit={onSubmit} noValidate>
                <div className="tme-request-when is-compact">
                  <div className="tme-request-field">
                    <label htmlFor="tme-date">{copy.date}</label>
                    <input
                      id="tme-date"
                      className="tme-date-input"
                      type="date"
                      value={date}
                      min={madridDayKey(new Date())}
                      onChange={(event) => setDate(event.target.value)}
                      onClick={(event) => {
                        const input = event.currentTarget;
                        try {
                          if (typeof input.showPicker === "function") input.showPicker();
                        } catch {
                          /* Older browsers / blocked showPicker — native click still works. */
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="tme-request-field">
                    <label htmlFor="tme-time">{copy.time}</label>
                    <select
                      id="tme-time"
                      value={requestTimesForDate.length > 0 ? time : ""}
                      onChange={(event) => setTime(event.target.value)}
                      disabled={requestTimesForDate.length === 0}
                      aria-invalid={requestTimesForDate.length === 0 || undefined}
                    >
                      {requestTimesForDate.length === 0 ? (
                        <option value="">{copy.dayUnavailable}</option>
                      ) : (
                        requestTimesForDate.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                {requestTimesForDate.length === 0 ? (
                  <p className="tme-request-status" role="status">
                    {copy.requestDayUnavailable}{" "}
                    <a href={telHref()}>
                      {copy.callNow} {phoneDisplay}
                    </a>
                  </p>
                ) : null}
                {requestNeedsCall ? (
                  <p className="tme-request-status is-urgent" role="status">
                    {copy.requestShortNotice.replace("{when}", (() => {
                      const day = dayTitle(date, locale);
                      const named =
                        locale === "en"
                          ? day
                          : day.replace(/^./, (char) => char.toLocaleLowerCase(localeTag(locale)));
                      return `${named} · ${time}`;
                    })())}{" "}
                    <a href={telHref()}>
                      {copy.callNow} {phoneDisplay}
                    </a>
                  </p>
                ) : null}
                {requestTimesForDate.length > 0 && !requestNeedsCall && requestIsAdminFree
                  ? personFields(copy.submitRequest)
                  : null}
                <p className="tme-request-footnote">
                  <span aria-hidden="true">*</span>
                  <strong>{copy.otherTimeNoteLabel}:</strong> {copy.otherTimeHelp}
                </p>
              </form>
            ) : null}

            {loadState === "ready" && (view === "groups" || view === "private") ? (
              <>
                <div className="tme-fork-head">
                  <h2 id="tme-choose">{copy.forkHeading}</h2>
                  {!bookingPath ? <p className="tme-assist-lead">{copy.forkLead}</p> : null}
                </div>

                <div className="tme-fork" role="group" aria-label={copy.forkHeading}>
                  {forkOptions.map(({ path, title, body, Icon }) => (
                    <button
                      key={path}
                      type="button"
                      className="tme-fork-option"
                      aria-pressed={bookingPath === path}
                      aria-label={`${title}. ${body}`}
                      onClick={() => choosePath(path)}
                    >
                      <Icon className="tme-fork-icon" aria-hidden="true" />
                      <strong className="tme-fork-title">{title}</strong>
                      <span className="tme-fork-body">{body}</span>
                    </button>
                  ))}
                </div>

                {bookingPath === "home" ? (
                  <>
                    <div className="tme-fork-head">
                      <h3 className="tme-fork-step">{copy.forkHomeTitle}</h3>
                      <p className="tme-assist-lead">{copy.homePickLead}</p>
                      <p className="tme-assist-lead">
                        {minutes(INDIVIDUAL_MINUTES)} ·{" "}
                        {plainEuros(homePriceCents(INDIVIDUAL_MINUTES), locale)}
                      </p>
                    </div>

                    <form onSubmit={onSubmit} noValidate>
                      <div className="tme-request-when is-compact">
                        <div className="tme-request-field">
                          <label htmlFor="tme-home-date">{copy.date}</label>
                          <input
                            id="tme-home-date"
                            className="tme-date-input"
                            type="date"
                            value={date}
                            min={madridDayKey(new Date())}
                            onChange={(event) => setDate(event.target.value)}
                            onClick={(event) => {
                              const input = event.currentTarget;
                              try {
                                if (typeof input.showPicker === "function") input.showPicker();
                              } catch {
                                /* Older browsers / blocked showPicker — native click still works. */
                              }
                            }}
                            required
                          />
                        </div>
                        <div className="tme-request-field">
                          <label htmlFor="tme-home-time">{copy.time}</label>
                          <select
                            id="tme-home-time"
                            value={homeTimesForDate.length > 0 ? time : ""}
                            onChange={(event) => setTime(event.target.value)}
                            disabled={homeTimesForDate.length === 0}
                            aria-invalid={homeTimesForDate.length === 0 || undefined}
                          >
                            {homeTimesForDate.length === 0 ? (
                              <option value="">{copy.dayUnavailable}</option>
                            ) : (
                              homeTimesForDate.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                      {homeTimesForDate.length === 0 ? (
                        <p className="tme-request-status" role="status">
                          {copy.requestDayUnavailable}{" "}
                          <a href={telHref()}>
                            {copy.callNow} {phoneDisplay}
                          </a>
                        </p>
                      ) : null}
                      {homeNeedsCall ? (
                        <p className="tme-request-status is-urgent" role="status">
                          {copy.requestShortNotice.replace("{when}", (() => {
                            const day = dayTitle(date, locale);
                            const named =
                              locale === "en"
                                ? day
                                : day.replace(/^./, (char) =>
                                    char.toLocaleLowerCase(localeTag(locale))
                                  );
                            return `${named} · ${time}`;
                          })())}{" "}
                          <a href={telHref()}>
                            {copy.callNow} {phoneDisplay}
                          </a>
                        </p>
                      ) : null}
                      {homeTimesForDate.length > 0 && !homeNeedsCall && homeSlotOk
                        ? personFields(copy.submitBook)
                        : null}
                      <p className="tme-request-footnote">
                        <span aria-hidden="true">*</span>
                        <strong>{copy.otherTimeNoteLabel}:</strong> {copy.homePickNote}
                      </p>
                    </form>
                  </>
                ) : null}

                {bookingPath && bookingPath !== "home" ? (
                  <>
                    <div className="tme-fork-head">
                      <h3 className="tme-fork-step">{copy.chooseHeading}</h3>
                      <p className="tme-assist-lead">{copy.dateThenTime}</p>
                    </div>

                    {bookingPath !== "group" ? (
                      <div className="tme-seg" role="group" aria-label={copy.privateHeading}>
                        <button
                          type="button"
                          aria-pressed={privateMinutes === 30}
                          onClick={() => {
                            setPrivateMinutes(30);
                            setSelection(null);
                            setDayKey(null);
                          }}
                        >
                          {minutes(INDIVIDUAL_SHORT_MINUTES)} ·{" "}
                          {plainEuros(
                            priceCentsForCreate("individual", INDIVIDUAL_SHORT_MINUTES),
                            locale
                          )}
                        </button>
                        <button
                          type="button"
                          aria-pressed={privateMinutes === 60}
                          onClick={() => {
                            setPrivateMinutes(60);
                            setSelection(null);
                            setDayKey(null);
                          }}
                        >
                          {minutes(INDIVIDUAL_MINUTES)} ·{" "}
                          {plainEuros(priceCentsForCreate("individual", INDIVIDUAL_MINUTES), locale)}
                        </button>
                      </div>
                    ) : null}

                    {error ? (
                      <p className="tme-alert" role="alert">
                        {copy.errors[error] || copy.errors.tech_failed}
                      </p>
                    ) : null}

                    <div className="tme-week-nav">
                      <button
                        type="button"
                        className="tme-nudge"
                        aria-label={copy.prevFourWeeks}
                        disabled={!canPrev}
                        onClick={() => shiftWeek(-1)}
                      >
                        <ChevronLeft className="tme-nudge-icon" aria-hidden="true" />
                      </button>
                      <p className="tme-week-label">{weekTitle(weekStart, locale, weekCount)}</p>
                      <button
                        type="button"
                        className="tme-nudge"
                        aria-label={copy.nextFourWeeks}
                        disabled={!canNext}
                        onClick={() => shiftWeek(1)}
                      >
                        <ChevronRight className="tme-nudge-icon" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="tme-weeks is-expanded">
                      {visibleWeeks.map((start) => {
                        const days = Array.from({ length: 7 }, (_, index) => shiftDay(start, index));
                        return (
                          <div
                            key={start}
                            className="tme-week"
                            role="group"
                            aria-label={weekTitle(start, locale)}
                          >
                            {days.map((day) => {
                              const bits = dayBits(day, locale);
                              const isToday = day === todayKey;
                              const weekdayLabel = isToday ? copy.today : bits.weekday;
                              const offers = offerMap.get(day) ?? [];
                              const open = offers.length > 0;
                              const hasJoin = offers.some((item) => item.mode === "join");
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  className={`tme-date${open ? (hasJoin ? " is-group" : " is-free") : " is-closed"}${isToday ? " is-today" : ""}`}
                                  aria-pressed={open && day === selectedDay}
                                  aria-current={isToday ? "date" : undefined}
                                  disabled={!open}
                                  aria-label={
                                    open
                                      ? `${weekdayLabel} ${bits.dayNum}`
                                      : `${weekdayLabel} ${bits.dayNum}, ${copy.dayUnavailable}`
                                  }
                                  onClick={() => chooseDay(day)}
                                >
                                  <span className="tme-date-w">{weekdayLabel}</span>
                                  <span className="tme-date-n">{bits.dayNum}</span>
                                  <span
                                    className={`tme-date-mark${hasJoin ? " is-group" : open ? " is-free" : ""}`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {bookingPath === "group" ? (
                      <p className="tme-key">
                        <span>
                          <i className="is-group" />
                          {copy.legendGroup}
                        </span>
                        <span>
                          <i className="is-free" />
                          {copy.openSeat}
                        </span>
                        <span>
                          <i className="is-closed" />
                          {copy.dayUnavailable}
                        </span>
                      </p>
                    ) : null}

                    {selectedDay && dayOffers.length > 0 ? (
                      <div className="tme-slot">
                        <p className="tme-day-name">{dayTitle(selectedDay, locale)}</p>
                        <div className="tme-times" role="group" aria-label={copy.time}>
                          {dayOffers.map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              className={`tme-time${item.mode === "join" ? " is-group" : " is-free"}`}
                              aria-pressed={selection?.key === item.key}
                              onClick={() => {
                                setSelection(item);
                                setError(null);
                              }}
                            >
                              <strong>{clock(item.startsAt, locale)}</strong>
                              <small>{chipLabel(item)}</small>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="tme-book"
                          disabled={
                            !selection || madridDayKey(new Date(selection.startsAt)) !== selectedDay
                          }
                          onClick={() => {
                            if (
                              selection &&
                              madridDayKey(new Date(selection.startsAt)) === selectedDay
                            ) {
                              openOffer(selection, listMode);
                            }
                          }}
                        >
                          {selection && madridDayKey(new Date(selection.startsAt)) === selectedDay
                            ? `${copy.reserve} · ${clock(selection.startsAt, locale)}`
                            : copy.chooseHeading}
                        </button>
                      </div>
                    ) : (
                      <div className="tme-empty">
                        <p role="status">{copy.noTimesWeek}</p>
                      </div>
                    )}

                    <div className="tme-panel-links">
                      <button
                        type="button"
                        onClick={() => {
                          setOffer(null);
                          setSelection(null);
                          setError(null);
                          setView("request");
                        }}
                      >
                        {copy.otherTime}
                      </button>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </section>

        <section className="tme-teacher" aria-labelledby="tme-teacher">
          <div className="tme-teacher-intro">
            <p className="tme-teacher-kicker">{copy.teacherKicker}</p>
            <h2 id="tme-teacher">{copy.teacherHello}</h2>
          </div>

          <figure
            className="tme-teacher-portrait"
            tabIndex={0}
            aria-label={`${copy.teacherName}. ${copy.teacherTags}`}
          >
            <div className="tme-teacher-medal" aria-hidden="true">
              <svg
                className="tme-teacher-network"
                viewBox={`0 0 ${TEACHER_MARK} ${TEACHER_MARK}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {TEACHER_NODES.map(({ key, deg }) => {
                  const hub = teacherPolar(deg, TEACHER_HUB_R);
                  const tip = teacherPolar(deg, TEACHER_SPOKE_END_R);
                  return (
                    <line
                      key={`spoke-${key}`}
                      className="tme-teacher-network-spoke"
                      x1={hub.x}
                      y1={hub.y}
                      x2={tip.x}
                      y2={tip.y}
                    />
                  );
                })}
              </svg>
              {TEACHER_NODES.map(({ key, Icon, deg }) => {
                const point = teacherPolar(deg, TEACHER_ICON_R);
                return (
                  <span
                    key={key}
                    className={`tme-teacher-orbit tme-teacher-orbit-${key}`}
                    style={{
                      left: `${(point.x / TEACHER_MARK) * 100}%`,
                      top: `${(point.y / TEACHER_MARK) * 100}%`,
                    }}
                  >
                    <Icon aria-hidden="true" strokeWidth={1.65} absoluteStrokeWidth />
                  </span>
                );
              })}
              <div className="tme-teacher-photo">
                <Image
                  src="/images/tech/ainhoa-portrait-v4.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 920px) 168px, 140px"
                />
              </div>
            </div>
            <figcaption>
              <p className="tme-teacher-tags">{copy.teacherTags}</p>
              <p className="tme-teacher-name">{copy.teacherName}</p>
            </figcaption>
          </figure>

          <div className="tme-teacher-body">
            <p className="tme-teacher-copy">{copy.teacherLead}</p>
            <p className="tme-teacher-copy">{copy.teacherStory}</p>
            <p className="tme-teacher-copy is-goal">{copy.teacherClose}</p>
          </div>
        </section>

        <footer className="tme-foot">
          <p>{copy.placeBody}</p>
          <p className="tme-foot-pay">{copy.payShort}</p>
          <div className="tme-foot-links">
            <a href={telHref()}>{copy.callNow} {phoneDisplay}</a>
            <span aria-hidden="true">·</span>
            <Link href={techConditionsHref(locale)}>{copy.footerLegalLabel}</Link>
            <span aria-hidden="true">·</span>
            <SiteCopyright style={{ margin: 0, color: "inherit", fontSize: "0.85rem", textAlign: "inherit" }} />
          </div>
        </footer>
      </div>

      <div className="tme-urgent-fab" role="group" aria-label={copy.fabCallAria}>
        <a className="tme-urgent-call" href={telHref()} aria-label={copy.fabCallAria}>
          <IconPhone />
          <span>{copy.fabCallLabel}</span>
        </a>
        <a
          className="tme-urgent-wa"
          href={fabWhatsAppHref}
          {...externalAnchorProps(fabWhatsAppHref)}
          aria-label={copy.fabWhatsAppAria}
        >
          <WhatsAppMark className="tme-urgent-wa-mark" />
          <span>{copy.fabWhatsAppLabel}</span>
        </a>
      </div>
    </div>
  );
}
