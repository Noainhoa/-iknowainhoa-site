"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { adminCopy, adminLocaleFromSearch, type AdminLocale } from "@/lib/tech/admin-copy";
import { isTechSupabaseConfigured } from "@/lib/tech/env";
import { createTechBrowserClient } from "@/lib/tech/supabase-browser";
import {
  applyBusyHourToggleLocal,
  buildMonthCells,
  hourIsWeeklyBusy,
  isClosedDay,
  minuteToHhMm,
  planBusyHourToggle,
  templateHourStarts,
  TEMPLATE_DAY_CLOSE_MINUTE,
  TEMPLATE_DAY_OPEN_MINUTE,
  type WeeklyBusyRowLike,
} from "@/lib/tech/calendar";
import {
  GROUP_CAPACITY,
  INDIVIDUAL_SHORT_MINUTES,
  SESSION_MINUTES,
  priceCentsForCreate,
} from "@/lib/tech/constants";
import { parseAdminFocus } from "@/lib/tech/seo";
import {
  approvalBlocked,
  formatMadrid,
  intervalsOverlap,
  madridDayKey,
  madridLocalToUtc,
  wholeMadridDay,
  type Interval,
} from "@/lib/tech/time";

type SessionRow = {
  id: string;
  kind: "group" | "individual";
  starts_at: string;
  duration_minutes: number;
  capacity: number;
  price_cents: number;
  venue_label: string;
  venue_public: boolean;
  status: "draft" | "published" | "cancelled" | "completed";
};

type AdminProduct = "group" | "individual60" | "individual30";

type BookingRow = {
  id: string;
  session_id: string;
  public_reference: string;
  contact_name: string;
  attendee_name: string;
  phone: string;
  email: string | null;
  question: string | null;
  session_language: "es" | "en" | null;
  status: string;
  attendance: string;
  payment_status: string;
  source: string | null;
  created_at: string;
  price_cents: number;
};

type RequestRow = {
  id: string;
  public_reference: string;
  requested_start: string;
  contact_name: string;
  attendee_name: string;
  phone: string;
  email: string | null;
  question: string | null;
  session_language: "es" | "en" | null;
  status: string;
  source: string | null;
  created_at: string;
};

type NoteRow = {
  id: string;
  subject: string;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
};

type TestimonialRow = {
  id: string;
  display_name: string;
  body: string;
  place: string | null;
  locale: string;
  status: "pending" | "published" | "hidden";
  created_at: string;
};

type BlockRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

type CalendarSettingsRow = {
  enabled: boolean;
  day_open_minute: number;
  day_close_minute: number;
  buffer_minutes: number;
  default_venue_label: string;
};

type WeeklyBusyRow = {
  id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
  label: string | null;
};

type AdminSection = "resumen" | "sesiones" | "reservas" | "solicitudes" | "opiniones" | "mas";

const WEEKDAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
const TEMPLATE_HOURS = templateHourStarts();

function defaultCalendarSettings(): CalendarSettingsRow {
  return {
    enabled: false,
    day_open_minute: TEMPLATE_DAY_OPEN_MINUTE,
    day_close_minute: TEMPLATE_DAY_CLOSE_MINUTE,
    buffer_minutes: 15,
    default_venue_label: "Guardamar del Segura",
  };
}

function toBusyLike(row: WeeklyBusyRow): WeeklyBusyRowLike {
  return {
    id: row.id,
    weekday: row.weekday,
    startMinute: row.start_minute,
    endMinute: row.end_minute,
    label: row.label,
  };
}

function fromBusyLike(row: WeeklyBusyRowLike): WeeklyBusyRow {
  return {
    id: row.id,
    weekday: row.weekday,
    start_minute: row.startMinute,
    end_minute: row.endMinute,
    label: row.label ?? null,
  };
}

function monthTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1))
  );
}

function todayMadridIso(): string {
  return madridDayKey(new Date());
}

const SECTIONS: { id: AdminSection; label: string; short: string }[] = [
  { id: "resumen", label: "Resumen", short: "Inicio" },
  { id: "sesiones", label: "Sesiones", short: "Sesiones" },
  { id: "reservas", label: "Reservas", short: "Reservas" },
  { id: "solicitudes", label: "Solicitudes", short: "Pedidos" },
  { id: "opiniones", label: "Opiniones", short: "Opiniones" },
  { id: "mas", label: "Más", short: "Más" },
];

function span(startIso: string, minutes: number): Interval {
  const startMs = new Date(startIso).getTime();
  return { startMs, endMs: startMs + minutes * 60 * 1000 };
}

function statusLabel(status: string): string {
  switch (status) {
    case "published":
      return "Publicada";
    case "draft":
      return "Borrador";
    case "cancelled":
      return "Cancelada";
    case "completed":
      return "Completada";
    case "confirmed":
      return "Confirmada";
    case "pending":
      return "Pendiente";
    case "declined":
      return "Rechazada";
    case "sent":
      return "Enviado";
    case "failed":
      return "Fallido";
    case "paid":
      return "Pagado";
    case "unpaid":
      return "Sin pagar";
    case "attended":
      return "Asistió";
    case "no_show":
      return "No vino";
    case "unknown":
      return "Sin marcar";
    default:
      return status;
  }
}

function StatusPill({ status, tone = "neutral" }: { status: string; tone?: "neutral" | "ok" | "warn" | "danger" | "info" }) {
  return <span className={`tme-admin-pill tme-admin-pill-${tone}`}>{statusLabel(status)}</span>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="tme-admin-empty">{children}</p>;
}

function isDevUiPreview(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("ui") === "preview";
}

/** Survives React Strict Mode remounts; prevents repeat redirects after load(). */
type AdminFocusCache = {
  key: string;
  section: AdminSection;
  focusDomId: string | null;
  message: string | null;
};
let adminFocusCache: AdminFocusCache | null = null;
let adminFocusApplied = false;

function seedPreviewData() {
  const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  inTwoDays.setHours(10, 0, 0, 0);
  const sessionId = "11111111-1111-4111-8111-111111111111";
  const sessions: SessionRow[] = [
    {
      id: sessionId,
      kind: "group",
      starts_at: inTwoDays.toISOString(),
      duration_minutes: 60,
      capacity: 7,
      price_cents: 1000,
      venue_label: "Biblioteca municipal",
      venue_public: true,
      status: "published",
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      kind: "individual",
      starts_at: new Date(inTwoDays.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      capacity: 1,
      price_cents: 2500,
      venue_label: "",
      venue_public: false,
      status: "draft",
    },
  ];
  const bookings: BookingRow[] = [
    {
      id: "33333333-3333-4333-8333-333333333333",
      session_id: sessionId,
      public_reference: "ABCD2345",
      contact_name: "María López",
      attendee_name: "María López",
      phone: "+34600111222",
      email: "maria@example.com",
      question: "WhatsApp en el móvil",
      session_language: "es",
      status: "confirmed",
      attendance: "unknown",
      payment_status: "unpaid",
      source: "web",
      created_at: new Date().toISOString(),
      price_cents: 1000,
    },
  ];
  const requests: RequestRow[] = [
    {
      id: "44444444-4444-4444-8444-444444444444",
      public_reference: "EFGH6789",
      requested_start: new Date(inTwoDays.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      contact_name: "Carlos Ruiz",
      attendee_name: "Carlos Ruiz",
      phone: "+34600333444",
      email: null,
      question: null,
      session_language: "es",
      status: "pending",
      source: "web",
      created_at: new Date().toISOString(),
    },
  ];
  const notes: NoteRow[] = [
    {
      id: "55555555-5555-4555-8555-555555555555",
      subject: "Nueva reserva ABCD2345",
      status: "failed",
      attempts: 2,
      last_error: "SMTP timeout",
      created_at: new Date().toISOString(),
    },
  ];
  const blocks: BlockRow[] = [
    {
      id: "66666666-6666-4666-8666-666666666666",
      starts_at: new Date(inTwoDays.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(inTwoDays.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(),
      reason: "Viaje",
    },
  ];
  const calendarSettings = defaultCalendarSettings();
  const weeklyBusy: WeeklyBusyRow[] = [
    {
      id: "77777777-7777-4777-8777-777777777777",
      weekday: 3,
      start_minute: 780,
      end_minute: 900,
      label: "Clase de yoga",
    },
  ];
  return { sessions, bookings, requests, notes, blocks, calendarSettings, weeklyBusy };
}

export default function TechAdminApp() {
  const supabase = useMemo(() => createTechBrowserClient(), []);
  const [previewMode] = useState(isDevUiPreview);
  const previewSeed = useMemo(() => (previewMode ? seedPreviewData() : null), [previewMode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(() => previewMode || !isTechSupabaseConfigured());
  const [isAdmin, setIsAdmin] = useState(previewMode);
  const [message, setMessage] = useState<string | null>(() => (previewMode ? "Vista previa local (datos de ejemplo)." : null));
  const [section, setSection] = useState<AdminSection>("resumen");
  const [sessions, setSessions] = useState<SessionRow[]>(() => previewSeed?.sessions ?? []);
  const [bookings, setBookings] = useState<BookingRow[]>(() => previewSeed?.bookings ?? []);
  const [requests, setRequests] = useState<RequestRow[]>(() => previewSeed?.requests ?? []);
  const [notes, setNotes] = useState<NoteRow[]>(() => previewSeed?.notes ?? []);
  const [blocks, setBlocks] = useState<BlockRow[]>(() => previewSeed?.blocks ?? []);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [storyName, setStoryName] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [storyPlace, setStoryPlace] = useState("");
  const [product, setProduct] = useState<AdminProduct>("group");
  const kind = product === "group" ? "group" : "individual";
  const sessionDuration =
    product === "individual30" ? INDIVIDUAL_SHORT_MINUTES : SESSION_MINUTES;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [capacity, setCapacity] = useState(GROUP_CAPACITY);
  const [venue, setVenue] = useState("");
  const [publish, setPublish] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettingsRow>(() =>
    previewSeed?.calendarSettings ?? defaultCalendarSettings()
  );
  const [weeklyBusy, setWeeklyBusy] = useState<WeeklyBusyRow[]>(() => previewSeed?.weeklyBusy ?? []);
  const [closedView, setClosedView] = useState(() => {
    const [year, month] = todayMadridIso().split("-").map(Number);
    return { year, month };
  });
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [venues, setVenues] = useState<Record<string, string>>({});
  const [loadedAt, setLoadedAt] = useState<number | null>(() => (previewMode ? Date.now() : null));
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [locale] = useState<AdminLocale>(() =>
    typeof window === "undefined" ? "es" : adminLocaleFromSearch(window.location.search)
  );
  const copy = adminCopy[locale];
  const closedMonthCells = useMemo(() => buildMonthCells(closedView), [closedView]);
  const closedRanges = useMemo(
    () => blocks.map((block) => ({ startsAt: block.starts_at, endsAt: block.ends_at })),
    [blocks]
  );
  const busyLikes = useMemo(() => weeklyBusy.map(toBusyLike), [weeklyBusy]);

  const load = useCallback(async () => {
    if (previewMode || !supabase) return;
    const [sessionRes, bookingRes, requestRes, noteRes, blockRes, settingsRes, busyRes, storyRes] = await Promise.all([
      supabase.from("tech_sessions").select("id, kind, starts_at, duration_minutes, capacity, price_cents, venue_label, venue_public, status").order("starts_at"),
      supabase.from("tech_bookings").select("id, session_id, public_reference, contact_name, attendee_name, phone, email, question, session_language, status, attendance, payment_status, source, created_at, price_cents").order("created_at", { ascending: false }),
      supabase.from("tech_requests").select("id, public_reference, requested_start, contact_name, attendee_name, phone, email, question, session_language, status, source, created_at").order("created_at", { ascending: false }),
      supabase.from("tech_notifications").select("id, subject, status, attempts, last_error, created_at").order("created_at", { ascending: false }).limit(30),
      supabase.from("tech_blocks").select("id, starts_at, ends_at, reason").order("starts_at"),
      supabase.from("tech_calendar_settings").select("enabled, day_open_minute, day_close_minute, buffer_minutes, default_venue_label").eq("id", 1).maybeSingle(),
      supabase.from("tech_weekly_busy").select("id, weekday, start_minute, end_minute, label").order("weekday").order("start_minute"),
      supabase.from("tech_testimonials").select("id, display_name, body, place, locale, status, created_at").order("created_at", { ascending: false }),
    ]);
    if (sessionRes.error || bookingRes.error || requestRes.error) {
      setMessage(sessionRes.error?.message || bookingRes.error?.message || requestRes.error?.message || "No se han podido leer los datos. ¿Está aplicada la migración?");
      return;
    }
    if (settingsRes.error) {
      setMessage(settingsRes.error.message);
      return;
    }
    setSessions((sessionRes.data ?? []) as SessionRow[]);
    setBookings((bookingRes.data ?? []) as BookingRow[]);
    setRequests((requestRes.data ?? []) as RequestRow[]);
    setNotes((noteRes.data ?? []) as NoteRow[]);
    setBlocks((blockRes.data ?? []) as BlockRow[]);
    if (settingsRes.data) {
      const loaded = settingsRes.data as CalendarSettingsRow;
      const aligned: CalendarSettingsRow = {
        ...loaded,
        day_open_minute: TEMPLATE_DAY_OPEN_MINUTE,
        day_close_minute: TEMPLATE_DAY_CLOSE_MINUTE,
      };
      setCalendarSettings(aligned);
      if (
        loaded.day_open_minute !== TEMPLATE_DAY_OPEN_MINUTE ||
        loaded.day_close_minute !== TEMPLATE_DAY_CLOSE_MINUTE
      ) {
        await supabase.from("tech_calendar_settings").upsert({
          id: 1,
          enabled: aligned.enabled,
          day_open_minute: TEMPLATE_DAY_OPEN_MINUTE,
          day_close_minute: TEMPLATE_DAY_CLOSE_MINUTE,
          buffer_minutes: aligned.buffer_minutes,
          default_venue_label: aligned.default_venue_label,
        });
      }
    } else {
      setCalendarSettings(defaultCalendarSettings());
    }
    if (busyRes.error) {
      setMessage(busyRes.error.message);
    } else {
      setWeeklyBusy((busyRes.data ?? []) as WeeklyBusyRow[]);
    }
    if (storyRes.error) {
      setTestimonials([]);
      setMessage(storyRes.error.message);
    } else {
      setTestimonials((storyRes.data ?? []) as TestimonialRow[]);
    }
    setLoadedAt(Date.now());
  }, [previewMode, supabase]);

  useEffect(() => {
    if (previewMode || !supabase) return;
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      if (!data.user) {
        setIsAdmin(false);
        setReady(true);
        return;
      }
      const { data: allowed, error } = await supabase.rpc("is_tech_admin");
      if (cancelled) return;
      setIsAdmin(allowed === true && !error);
      setReady(true);
      if (allowed === true) await load();
      else if (error) setMessage("La migración de Guardamar Click todavía no está aplicada en la base de datos.");
    });
    return () => {
      cancelled = true;
    };
  }, [previewMode, supabase, load]);

  useEffect(() => {
    if (!isAdmin || loadedAt == null) return;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = parseAdminFocus(params.get("focus"), params.get("ref"));

    if (fromUrl) {
      const key = `${fromUrl.focus}-${fromUrl.ref}`;
      let focusDomId: string | null = key;
      let message: string | null = null;
      const section: AdminSection = fromUrl.focus === "booking" ? "reservas" : "solicitudes";

      if (fromUrl.focus === "booking") {
        const booking = bookings.find((row) => row.public_reference === fromUrl.ref);
        if (!booking) {
          focusDomId = null;
          message = `No hay ninguna reserva con la referencia ${fromUrl.ref}.`;
        }
      } else {
        const request = requests.find((row) => row.public_reference === fromUrl.ref);
        if (!request) {
          focusDomId = null;
          message = `No hay ninguna solicitud con la referencia ${fromUrl.ref}.`;
        } else if (request.status !== "pending") {
          focusDomId = null;
          message = `La solicitud ${fromUrl.ref} ya no está pendiente (estado: ${request.status}).`;
        }
      }

      if (!adminFocusCache || adminFocusCache.key !== key) {
        adminFocusCache = { key, section, focusDomId, message };
        adminFocusApplied = false;
        params.delete("focus");
        params.delete("ref");
        const remaining = params.toString();
        const nextUrl = remaining ? `${window.location.pathname}?${remaining}` : window.location.pathname;
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    }

    if (!adminFocusCache || adminFocusApplied) return;

    const cached = adminFocusCache;
    const timer = window.setTimeout(() => {
      adminFocusApplied = true;
      setSection(cached.section);
      setFocusKey(cached.focusDomId);
      if (cached.message) setMessage(cached.message);
      window.setTimeout(() => {
        document.querySelector<HTMLElement>(`.tme-admin-nav-btn[data-section="${cached.section}"]`)?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
        if (cached.focusDomId) {
          document.getElementById(cached.focusDomId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 40);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, loadedAt, bookings, requests]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    const { data: allowed } = await supabase.rpc("is_tech_admin");
    setIsAdmin(allowed === true);
    if (allowed === true) await load();
    else setMessage("Esta cuenta no puede administrar las sesiones.");
  }

  async function onForgot() {
    if (!supabase || !email.trim()) {
      setMessage("Escribe el email y pulsa recuperar.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/guardamar-click/admin`,
    });
    setMessage(error ? error.message : "Si la cuenta existe, llegará un email para cambiar la contraseña.");
  }

  const occupied = useMemo(
    () =>
      sessions
        .filter((session) => session.status === "published" || session.status === "completed")
        .map((session) => span(session.starts_at, session.duration_minutes)),
    [sessions]
  );

  const pending = useMemo(() => requests.filter((request) => request.status === "pending"), [requests]);
  const confirmedBookings = useMemo(() => bookings.filter((booking) => booking.status === "confirmed"), [bookings]);
  const fresh = useMemo(() => {
    if (!loadedAt) return [];
    return confirmedBookings.filter((booking) => new Date(booking.created_at).getTime() >= loadedAt - 3 * 24 * 60 * 60 * 1000);
  }, [confirmedBookings, loadedAt]);
  const failedNotes = useMemo(() => notes.filter((note) => note.status !== "sent"), [notes]);
  const upcomingSessions = useMemo(() => {
    const now = loadedAt ?? 0;
    return sessions
      .filter((session) => session.status === "published" && new Date(session.starts_at).getTime() >= now)
      .slice(0, 5);
  }, [sessions, loadedAt]);
  const bookedCountBySession = useMemo(() => {
    const map = new Map<string, number>();
    for (const booking of confirmedBookings) {
      map.set(booking.session_id, (map.get(booking.session_id) ?? 0) + 1);
    }
    return map;
  }, [confirmedBookings]);

  async function createSession(event: FormEvent) {
    event.preventDefault();
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    setMessage(null);
    if (publish && venue.trim().length < 3) {
      setMessage("Para publicar, escribe un lugar que se pueda mostrar.");
      return;
    }
    let starts: Date;
    try {
      starts = madridLocalToUtc(date, time);
    } catch {
      setMessage("Revisa el día y la hora.");
      return;
    }
    const candidate = span(starts.toISOString(), sessionDuration);
    if (publish && approvalBlocked(occupied, candidate)) {
      setMessage("Esa hora se solapa con otra sesión confirmada.");
      return;
    }
    const { error } = await supabase.from("tech_sessions").insert({
      kind,
      starts_at: starts.toISOString(),
      duration_minutes: sessionDuration,
      capacity: kind === "group" ? capacity : 1,
      price_cents: priceCentsForCreate(kind, sessionDuration),
      venue_label: venue.trim(),
      venue_public: publish,
      status: publish ? "published" : "draft",
    });
    if (error) {
      setMessage(
        error.message.includes("tech_overlap") || error.message.includes("tech_sessions_no_overlap") || error.message.includes("conflicts")
          ? "Esa hora se solapa con otra sesión."
          : error.message
      );
      return;
    }
    setMessage(publish ? "Sesión publicada." : "Borrador guardado. No se puede reservar hasta publicarla con lugar.");
    setDate("");
    setVenue("");
    setPublish(false);
    await load();
  }

  async function saveCalendarSettings(event: FormEvent) {
    event.preventDefault();
    const default_venue_label = calendarSettings.default_venue_label;
    if (default_venue_label.trim().length < 3) {
      setMessage("El lugar por defecto debe tener al menos 3 caracteres.");
      return;
    }
    const nextSettings: CalendarSettingsRow = {
      ...calendarSettings,
      day_open_minute: TEMPLATE_DAY_OPEN_MINUTE,
      day_close_minute: TEMPLATE_DAY_CLOSE_MINUTE,
      default_venue_label: default_venue_label.trim(),
    };
    setCalendarSettings(nextSettings);
    if (previewMode) {
      setMessage("Vista previa: horario actualizado solo en esta pestaña (08:00–20:00).");
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from("tech_calendar_settings").upsert({
      id: 1,
      enabled: nextSettings.enabled,
      day_open_minute: TEMPLATE_DAY_OPEN_MINUTE,
      day_close_minute: TEMPLATE_DAY_CLOSE_MINUTE,
      buffer_minutes: nextSettings.buffer_minutes,
      default_venue_label: nextSettings.default_venue_label,
    });
    setMessage(
      error
        ? error.message
        : nextSettings.enabled
          ? "Horario guardado (08:00–20:00). El calendario público está activo."
          : "Horario guardado (08:00–20:00). El calendario público sigue desactivado."
    );
    if (!error) await load();
  }

  async function toggleWeeklyBusyHour(weekday: number, hourStart: number) {
    if (scheduleBusy) return;
    if (previewMode) {
      setWeeklyBusy((current) =>
        applyBusyHourToggleLocal(current.map(toBusyLike), weekday, hourStart).map(fromBusyLike)
      );
      setMessage("Vista previa: plantilla semanal actualizada en local.");
      return;
    }
    if (!supabase) return;
    const plan = planBusyHourToggle(busyLikes, weekday, hourStart);
    setScheduleBusy(true);
    try {
      for (const id of plan.deleteIds) {
        const { error } = await supabase.from("tech_weekly_busy").delete().eq("id", id);
        if (error) {
          setMessage(error.message);
          return;
        }
      }
      for (const update of plan.updates) {
        const { error } = await supabase
          .from("tech_weekly_busy")
          .update({ start_minute: update.startMinute, end_minute: update.endMinute })
          .eq("id", update.id);
        if (error) {
          setMessage(error.message);
          return;
        }
      }
      if (plan.inserts.length > 0) {
        const { error } = await supabase.from("tech_weekly_busy").insert(
          plan.inserts.map((row) => ({
            weekday: row.weekday,
            start_minute: row.startMinute,
            end_minute: row.endMinute,
            label: row.label,
          }))
        );
        if (error) {
          setMessage(error.message);
          return;
        }
      }
      setMessage(
        hourIsWeeklyBusy(busyLikes, weekday, hourStart)
          ? "Hora liberada en la plantilla semanal."
          : "Hora marcada como ocupada en la plantilla semanal."
      );
      await load();
    } finally {
      setScheduleBusy(false);
    }
  }

  async function toggleClosedDay(dayKey: string) {
    if (scheduleBusy) return;
    const currentlyClosed = isClosedDay(dayKey, closedRanges);
    if (previewMode) {
      if (currentlyClosed) {
        const range = wholeMadridDay(dayKey);
        setBlocks((current) =>
          current.filter(
            (block) =>
              !intervalsOverlap(
                { startMs: new Date(block.starts_at).getTime(), endMs: new Date(block.ends_at).getTime() },
                { startMs: range.startsAt.getTime(), endMs: range.endsAt.getTime() }
              )
          )
        );
        setMessage("Vista previa: día abierto en local.");
      } else {
        const range = wholeMadridDay(dayKey);
        setBlocks((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            starts_at: range.startsAt.toISOString(),
            ends_at: range.endsAt.toISOString(),
            reason: null,
          },
        ]);
        setMessage("Vista previa: día cerrado en local.");
      }
      return;
    }
    if (!supabase) return;
    setScheduleBusy(true);
    try {
      if (currentlyClosed) {
        const range = wholeMadridDay(dayKey);
        const covering = blocks.filter((block) =>
          intervalsOverlap(
            { startMs: new Date(block.starts_at).getTime(), endMs: new Date(block.ends_at).getTime() },
            { startMs: range.startsAt.getTime(), endMs: range.endsAt.getTime() }
          )
        );
        for (const block of covering) {
          const { error } = await supabase.from("tech_blocks").delete().eq("id", block.id);
          if (error) {
            setMessage(error.message);
            return;
          }
        }
        setMessage("Día abierto. Se pueden ofrecer citas ese día (según la plantilla).");
      } else {
        const range = wholeMadridDay(dayKey);
        const { error } = await supabase.from("tech_blocks").insert({
          starts_at: range.startsAt.toISOString(),
          ends_at: range.endsAt.toISOString(),
          reason: null,
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage("Día cerrado. Las sesiones ya publicadas hay que cancelarlas aparte.");
      }
      await load();
    } finally {
      setScheduleBusy(false);
    }
  }

  function shiftClosedMonth(delta: number) {
    const base = new Date(Date.UTC(closedView.year, closedView.month - 1 + delta, 1));
    setClosedView({ year: base.getUTCFullYear(), month: base.getUTCMonth() + 1 });
  }

  async function approve(request: RequestRow) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    const venueLabel = (venues[request.id] || "").trim();
    const candidate = span(request.requested_start, 60);
    if (approvalBlocked(occupied, candidate)) {
      setMessage("Esa hora ya está ocupada. No se ha reservado. Rechaza la solicitud o espera a liberar la hora.");
      return;
    }
    const blocked = blocks.some((block) =>
      intervalsOverlap({ startMs: new Date(block.starts_at).getTime(), endMs: new Date(block.ends_at).getTime() }, candidate)
    );
    if (blocked) {
      setMessage("Ese día está bloqueado.");
      return;
    }
    const { data, error } = await supabase.rpc("tech_approve_request", {
      payload: { request_id: request.id, venue_label: venueLabel },
    });
    if (error || !data?.ok) {
      const code = data?.error || error?.message || "tech_failed";
      setMessage(code === "tech_overlap" ? "Otra sesión ocupó esa hora. La solicitud sigue pendiente." : String(code));
      return;
    }
    setMessage(`Aceptada ${data.reference}. La hora queda reservada.`);
    await load();
  }

  async function decline(id: string) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    if (!window.confirm(copy.confirmDecline)) return;
    const { data, error } = await supabase.rpc("tech_decline_request", { payload: { request_id: id } });
    setMessage(error || !data?.ok ? "No se ha podido rechazar." : "Solicitud rechazada.");
    await load();
  }

  async function patchBooking(id: string, patch: Partial<BookingRow>) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    const { error } = await supabase.from("tech_bookings").update(patch).eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  }

  async function publishSession(session: SessionRow) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    const venueLabel = (venues[session.id] ?? session.venue_label).trim();
    if (venueLabel.length < 3) {
      setMessage("Para publicar, escribe un lugar que se pueda mostrar.");
      return;
    }
    if (!window.confirm(copy.confirmPublish)) return;
    const candidate = span(session.starts_at, session.duration_minutes);
    if (approvalBlocked(occupied, candidate)) {
      setMessage("Esa hora se solapa con otra sesión confirmada.");
      return;
    }
    const { error } = await supabase
      .from("tech_sessions")
      .update({ status: "published", venue_label: venueLabel, venue_public: true })
      .eq("id", session.id)
      .eq("status", "draft");
    if (error) {
      setMessage(
        error.message.includes("tech_overlap") || error.message.includes("tech_sessions_no_overlap") || error.message.includes("conflicts")
          ? "Esa hora se solapa con otra sesión."
          : error.message
      );
      return;
    }
    setMessage("Sesión publicada.");
    await load();
  }

  async function cancelSession(id: string, asDraft = false) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    if (!window.confirm(asDraft ? copy.confirmDiscardDraft : copy.confirmCancelSession)) return;
    const { data, error } = await supabase.rpc("tech_cancel_session", { payload: { session_id: id } });
    if (error || !data?.ok) {
      const code = data?.error || error?.message || "tech_failed";
      setMessage(
        code === "tech_forbidden"
          ? "No tienes permiso para cancelar."
          : code === "tech_not_found"
            ? "No se ha encontrado esa sesión."
            : code === "tech_not_cancellable"
              ? "Esa sesión no se puede cancelar."
              : String(code)
      );
      return;
    }
    const n = typeof data.cancelled_bookings === "number" ? data.cancelled_bookings : 0;
    if (asDraft) {
      setMessage("Borrador descartado.");
    } else if (data.already_cancelled) {
      setMessage(
        n > 0
          ? `La sesión ya estaba cancelada. Se han cerrado ${n} reserva${n === 1 ? "" : "s"} que seguían activas.`
          : "La sesión ya estaba cancelada."
      );
    } else {
      setMessage(
        n > 0
          ? `Sesión cancelada. ${n} reserva${n === 1 ? "" : "s"} cerrada${n === 1 ? "" : "s"}. Avisa por teléfono a quien tuviera plaza.`
          : "Sesión cancelada. No había reservas confirmadas."
      );
    }
    await load();
  }

  async function retry(id: string) {
    if (previewMode) {
      setMessage("Vista previa: no se reenvía nada.");
      return;
    }
    const response = await fetch("/api/tech/admin/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = await response.json().catch(() => null);
    setMessage(payload?.notification === "sent" ? "Aviso enviado." : "El aviso sigue sin enviarse. La reserva no se ha borrado.");
    await load();
  }

  async function deleteBooking(id: string) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se borra nada.");
      return;
    }
    if (!window.confirm(copy.confirmDeletePerson)) return;
    const { error } = await supabase.from("tech_bookings").delete().eq("id", id);
    setMessage(error ? copy.deleteFailed : copy.deletedPerson);
    if (!error) await load();
  }

  async function addTestimonial(event: FormEvent) {
    event.preventDefault();
    const displayName = storyName.trim().replace(/\s+/g, " ");
    const body = storyBody.trim().replace(/\s+/g, " ");
    const place = storyPlace.trim().replace(/\s+/g, " ");
    if (displayName.length < 1 || displayName.length > 60 || body.length < 8 || body.length > 400 || place.length > 80) {
      setMessage("Revisa el nombre y el texto (entre 8 y 400 caracteres).");
      return;
    }
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    const { error } = await supabase.from("tech_testimonials").insert({
      display_name: displayName,
      body,
      place: place || null,
      locale: "es",
      status: "published",
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setStoryName("");
    setStoryBody("");
    setStoryPlace("");
    setMessage("Opinión publicada en la web.");
    await load();
  }

  async function setTestimonialStatus(id: string, status: TestimonialRow["status"]) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    const { error } = await supabase.from("tech_testimonials").update({ status }).eq("id", id);
    setMessage(error ? error.message : status === "published" ? "Opinión visible en la web." : "Opinión oculta.");
    if (!error) await load();
  }

  async function deleteTestimonial(id: string) {
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se borra nada.");
      return;
    }
    if (!window.confirm("¿Borrar esta opinión?")) return;
    const { error } = await supabase.from("tech_testimonials").delete().eq("id", id);
    setMessage(error ? error.message : "Opinión borrada.");
    if (!error) await load();
  }

  function exportCsv() {
    const bySession = new Map(sessions.map((session) => [session.id, session]));
    const header = ["referencia", "estado", "cuando", "tipo", "contacto", "asiste", "telefono", "email", "pregunta", "pago", "asistencia", "origen", "creada"];
    const lines = bookings.map((booking) => {
      const session = bySession.get(booking.session_id);
      const cells = [
        booking.public_reference,
        booking.status,
        session ? formatMadrid(new Date(session.starts_at), "es") : "",
        session?.kind ?? "",
        booking.contact_name,
        booking.attendee_name,
        booking.phone,
        booking.email ?? "",
        booking.question ?? "",
        booking.payment_status,
        booking.attendance,
        booking.source ?? "",
        booking.created_at,
      ];
      return cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",");
    });
    const blob = new Blob([`\uFEFF${header.join(",")}\n${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guardamar-click-reservas.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function go(next: AdminSection, opts?: { newSession?: boolean }) {
    setSection(next);
    setFocusKey(null);
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(`.tme-admin-nav-btn[data-section="${next}"]`)?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      if (opts?.newSession) {
        document.getElementById("nueva-sesion")?.scrollIntoView({ behavior: "smooth", block: "start" });
        document.getElementById("kind")?.focus();
      }
    }, 40);
  }

  if (!supabase) {
    return (
      <div className="tme-admin">
        <div className="tme-admin-shell">
          <p>
            Guardamar Click no está conectado: faltan variables <code>NEXT_PUBLIC_TECH_SUPABASE_*</code> o coinciden con el
            proyecto de parking. Configura un proyecto Supabase aislado.
          </p>
        </div>
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="tme-admin">
        <div className="tme-admin-shell">
          <p>Cargando…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="tme-admin">
        <div className="tme-admin-shell tme-admin-login">
          <img
            className="tme-admin-logo"
            src="/images/tech/guardamar-click-badge-v2.png"
            alt=""
            width={72}
            height={72}
            decoding="async"
          />
          <p className="tme-admin-kicker">Administración</p>
          <h1>Guardamar Click</h1>
          <p className="tme-admin-lead">Entra para gestionar sesiones, reservas y solicitudes.</p>
          <form className="tme-admin-form" onSubmit={onLogin}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor="admin-password">Contraseña</label>
            <div className="tme-password-field">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="tme-password-toggle"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                aria-controls="admin-password"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
            </div>
            {message ? (
              <p className="tme-alert" role="alert">
                {message}
              </p>
            ) : null}
            <button className="tme-primary" type="submit">
              Entrar
            </button>
          </form>
          <button type="button" className="tme-admin-text-btn" onClick={onForgot}>
            Recuperar contraseña
          </button>
        </div>
      </div>
    );
  }

  const publishedCount = sessions.filter((session) => session.status === "published").length;

  return (
    <div className="tme-admin">
      <header className="tme-admin-top">
        <div className="tme-admin-top-inner">
          <div className="tme-admin-brand">
            <img
              className="tme-admin-logo"
              src="/images/tech/guardamar-click-badge-v2.png"
              alt=""
              width={56}
              height={56}
              decoding="async"
            />
            <div>
              <p className="tme-admin-kicker">Administración</p>
              <h1>Guardamar Click</h1>
            </div>
          </div>
          <div className="tme-admin-top-actions">
            <button
              type="button"
              className="tme-secondary"
              onClick={() => navigator.clipboard.writeText("https://iknowainhoa.com/guardamar-click?src=flyer")}
            >
              Copiar cartel
            </button>
            <button type="button" className="tme-secondary" onClick={exportCsv}>
              Exportar CSV
            </button>
            <button type="button" className="tme-admin-text-btn" onClick={() => supabase.auth.signOut().then(() => setIsAdmin(false))}>
              Salir
            </button>
          </div>
        </div>
        <div className="tme-admin-nav-wrap">
          <nav className="tme-admin-nav" aria-label="Secciones del administrador">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                data-section={item.id}
                className={section === item.id ? "tme-admin-nav-btn is-active" : "tme-admin-nav-btn"}
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => go(item.id)}
              >
                <span className="tme-admin-nav-full">{item.label}</span>
                <span className="tme-admin-nav-short">{item.short}</span>
                {item.id === "solicitudes" && pending.length > 0 ? (
                  <span className="tme-admin-badge" aria-label={`${pending.length} pendientes`}>
                    {pending.length}
                  </span>
                ) : null}
                {item.id === "mas" && failedNotes.length > 0 ? (
                  <span className="tme-admin-badge" aria-label={`${failedNotes.length} avisos fallidos`}>
                    {failedNotes.length}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="tme-admin-shell">
        {message ? (
          <p className="tme-alert" role="status">
            {message}
          </p>
        ) : null}

        {section === "resumen" ? (
          <section className="tme-admin-panel" aria-labelledby="admin-resumen">
            <div className="tme-admin-panel-head">
              <div>
                <h2 id="admin-resumen">Resumen</h2>
                <p>Lo urgente de hoy, sin el ruido del resto.</p>
              </div>
              <button type="button" className="tme-primary" onClick={() => go("sesiones", { newSession: true })}>
                {copy.newSession}
              </button>
            </div>
            <div className="tme-admin-stats">
              <button type="button" className="tme-admin-stat" onClick={() => go("sesiones")}>
                <strong>{publishedCount}</strong>
                <span>Sesiones publicadas</span>
              </button>
              <button type="button" className="tme-admin-stat" onClick={() => go("reservas")}>
                <strong>{confirmedBookings.length}</strong>
                <span>Reservas confirmadas</span>
              </button>
              <button
                type="button"
                className={pending.length > 0 ? "tme-admin-stat tme-admin-stat-attention" : "tme-admin-stat"}
                onClick={() => go("solicitudes")}
              >
                <strong>{pending.length}</strong>
                <span>Solicitudes pendientes</span>
              </button>
              <button
                type="button"
                className={failedNotes.length > 0 ? "tme-admin-stat tme-admin-stat-attention-danger" : "tme-admin-stat"}
                onClick={() => go("mas")}
              >
                <strong>{failedNotes.length}</strong>
                <span>Avisos fallidos</span>
              </button>
            </div>

            {pending.length ? <p className="tme-admin-banner tme-admin-banner-attention">{copy.pendingBanner(pending.length)}</p> : null}
            {fresh.length ? <p className="tme-admin-banner">{copy.freshBanner(fresh.length)}</p> : null}

            <div className="tme-admin-grid">
              <div className="tme-admin-block">
                <h3>Próximas sesiones</h3>
                {upcomingSessions.length === 0 ? <EmptyState>No hay sesiones publicadas próximas.</EmptyState> : null}
                {upcomingSessions.map((session) => (
                  <article key={session.id} className="tme-admin-item">
                    <div className="tme-admin-item-main">
                      <strong>
                        {session.kind === "group" ? "Grupo" : "Individual"} · {session.duration_minutes} min · {formatMadrid(new Date(session.starts_at), "es")}
                      </strong>
                      <p>
                        {session.venue_public ? session.venue_label : "Lugar sin publicar"} · {bookedCountBySession.get(session.id) ?? 0}/
                        {session.capacity} plazas
                      </p>
                    </div>
                    <StatusPill status={session.status} tone="ok" />
                  </article>
                ))}
                <div className="tme-admin-inline-actions">
                  <button type="button" className="tme-admin-text-btn" onClick={() => go("sesiones", { newSession: true })}>
                    {copy.newSession}
                  </button>
                  <button type="button" className="tme-admin-text-btn" onClick={() => go("sesiones")}>
                    Ver todas las sesiones
                  </button>
                </div>
              </div>

              <div className={pending.length || failedNotes.length ? "tme-admin-block tme-admin-block-attention" : "tme-admin-block"}>
                <h3>Pendiente de ti</h3>
                {pending.length === 0 && failedNotes.length === 0 ? <EmptyState>Nada pendiente ahora mismo.</EmptyState> : null}
                {pending.slice(0, 3).map((request) => (
                  <article key={request.id} className="tme-admin-item">
                    <div className="tme-admin-item-main">
                      <strong>{request.public_reference}</strong>
                      <p>
                        {formatMadrid(new Date(request.requested_start), "es")} · {request.contact_name}
                      </p>
                    </div>
                    <StatusPill status="pending" tone="warn" />
                  </article>
                ))}
                {failedNotes.slice(0, 3).map((note) => (
                  <article key={note.id} className="tme-admin-item">
                    <div className="tme-admin-item-main">
                      <strong>{note.subject}</strong>
                      <p>
                        {statusLabel(note.status)} · intentos {note.attempts}
                      </p>
                    </div>
                    <StatusPill status={note.status} tone="danger" />
                  </article>
                ))}
                <div className="tme-admin-inline-actions">
                  {pending.length ? (
                    <button type="button" className="tme-primary" onClick={() => go("solicitudes")}>
                      Revisar solicitudes
                    </button>
                  ) : null}
                  {failedNotes.length ? (
                    <button type="button" className="tme-secondary" onClick={() => go("mas")}>
                      Reintentar avisos
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {section === "sesiones" ? (
          <section className="tme-admin-panel" aria-labelledby="admin-sesiones">
            <div className="tme-admin-panel-head">
              <div>
                <h2 id="admin-sesiones">Sesiones</h2>
                <p>Crea, publica o cancela. Un borrador sin lugar no se puede reservar.</p>
              </div>
              <button type="button" className="tme-secondary" onClick={() => go("sesiones", { newSession: true })}>
                {copy.newSession}
              </button>
            </div>

            <form id="nueva-sesion" className="tme-admin-form tme-admin-card" onSubmit={createSession}>
              <h3>Nueva sesión</h3>
              <div className="tme-admin-form-grid">
                <div>
                  <label htmlFor="kind">Tipo</label>
                  <select
                    id="kind"
                    value={product}
                    onChange={(event) => setProduct(event.target.value as AdminProduct)}
                  >
                    <option value="group">Grupo · 60 min · 10 €</option>
                    <option value="individual60">Individual · 60 min · 25 €</option>
                    <option value="individual30">Individual · 30 min · 10 €</option>
                  </select>
                </div>
                {kind === "group" ? (
                  <div>
                    <label htmlFor="capacity">Plazas, máximo {GROUP_CAPACITY}</label>
                    <input
                      id="capacity"
                      type="number"
                      min={1}
                      max={GROUP_CAPACITY}
                      value={capacity}
                      onChange={(event) => setCapacity(Number(event.target.value))}
                    />
                  </div>
                ) : null}
                <div>
                  <label htmlFor="day">Día</label>
                  <input id="day" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
                </div>
                <div>
                  <label htmlFor="hour">Hora</label>
                  <input id="hour" type="time" step={900} value={time} onChange={(event) => setTime(event.target.value)} required />
                </div>
                <div className="tme-admin-span-2">
                  <label htmlFor="venue">Lugar visible</label>
                  <input id="venue" value={venue} onChange={(event) => setVenue(event.target.value)} />
                </div>
              </div>
              <label className="tme-check">
                <input type="checkbox" checked={publish} onChange={(event) => setPublish(event.target.checked)} />
                <span>Publicar ya. La gente podrá reservarla.</span>
              </label>
              <button className="tme-primary" type="submit">
                Guardar sesión
              </button>
            </form>

            <div className="tme-admin-list">
              {sessions.length === 0 ? <EmptyState>Todavía no hay sesiones.</EmptyState> : null}
              {sessions.map((session) => {
                const taken = bookedCountBySession.get(session.id) ?? 0;
                return (
                  <article key={session.id} className="tme-admin-card">
                    <div className="tme-admin-card-head">
                      <div>
                        <strong>
                          {session.kind === "group" ? "Grupo" : "Individual"} · {session.duration_minutes} min · {formatMadrid(new Date(session.starts_at), "es")}
                        </strong>
                        <p>
                          {session.venue_public ? session.venue_label : "Lugar sin publicar"} · {taken}/{session.capacity} plazas ·{" "}
                          {(session.price_cents / 100).toFixed(0)} €
                        </p>
                      </div>
                      <StatusPill
                        status={session.status}
                        tone={session.status === "published" ? "ok" : session.status === "cancelled" ? "danger" : "neutral"}
                      />
                    </div>
                    {session.status === "draft" ? (
                      <div className="tme-admin-draft-actions">
                        <label htmlFor={`session-venue-${session.id}`}>Lugar visible</label>
                        <input
                          id={`session-venue-${session.id}`}
                          value={venues[session.id] ?? session.venue_label}
                          onChange={(event) => setVenues((current) => ({ ...current, [session.id]: event.target.value }))}
                        />
                        <div className="tme-admin-inline-actions">
                          <button type="button" className="tme-primary" onClick={() => publishSession(session)}>
                            Publicar
                          </button>
                          <button type="button" className="tme-danger" onClick={() => cancelSession(session.id, true)}>
                            Descartar
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {session.status === "published" ? (
                      <button type="button" className="tme-danger" onClick={() => cancelSession(session.id)}>
                        Cancelar sesión
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {section === "reservas" ? (
          <section className="tme-admin-panel" aria-labelledby="admin-reservas">
            <div className="tme-admin-panel-head">
              <div>
                <h2 id="admin-reservas">Reservas</h2>
                <p>Pago, asistencia y datos de cada persona.</p>
              </div>
              <button type="button" className="tme-secondary" onClick={exportCsv}>
                Exportar CSV
              </button>
            </div>
            <div className="tme-admin-list">
              {bookings.length === 0 ? <EmptyState>No hay reservas todavía.</EmptyState> : null}
              {bookings.map((booking) => {
                const bookingFocus = `booking-${booking.public_reference}`;
                const session = sessions.find((row) => row.id === booking.session_id);
                return (
                  <article
                    key={booking.id}
                    id={bookingFocus}
                    className={focusKey === bookingFocus ? "tme-admin-card tme-card-focus" : "tme-admin-card"}
                  >
                    <div className="tme-admin-card-head">
                      <div>
                        <strong>
                          {booking.public_reference} · {booking.contact_name}
                        </strong>
                        <p>
                          Asiste {booking.attendee_name}
                          {session ? ` · ${formatMadrid(new Date(session.starts_at), "es")}` : ""}
                        </p>
                        <p>
                          {booking.phone}
                          {booking.email ? ` · ${booking.email}` : ""}
                        </p>
                        <p className="tme-admin-note">
                          Idioma: {booking.session_language === "en" ? "Inglés" : "Español"}
                        </p>
                        {booking.question ? <p className="tme-admin-note">{booking.question}</p> : null}
                      </div>
                      <StatusPill
                        status={booking.status}
                        tone={booking.status === "confirmed" ? "ok" : booking.status === "cancelled" ? "danger" : "neutral"}
                      />
                    </div>
                    <div className="tme-admin-form-grid">
                      <div>
                        <label htmlFor={`pay-${booking.id}`}>Pago</label>
                        <select
                          id={`pay-${booking.id}`}
                          value={booking.payment_status}
                          onChange={(event) => patchBooking(booking.id, { payment_status: event.target.value })}
                        >
                          <option value="unpaid">Sin pagar</option>
                          <option value="paid">Pagado</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`att-${booking.id}`}>Asistencia</label>
                        <select
                          id={`att-${booking.id}`}
                          value={booking.attendance}
                          onChange={(event) => patchBooking(booking.id, { attendance: event.target.value })}
                        >
                          <option value="unknown">Sin marcar</option>
                          <option value="attended">Asistió</option>
                          <option value="no_show">No vino</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="tme-admin-text-btn tme-admin-danger-text"
                      onClick={() => deleteBooking(booking.id)}
                    >
                      Borrar datos de esta persona
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {section === "solicitudes" ? (
          <section className="tme-admin-panel" aria-labelledby="admin-solicitudes">
            <div className="tme-admin-panel-head">
              <h2 id="admin-solicitudes">Solicitudes</h2>
              <p>Horas pedidas. Aceptar crea la cita; rechazar cierra la petición.</p>
            </div>
            <div className="tme-admin-list">
              {pending.length === 0 ? <EmptyState>No hay solicitudes pendientes.</EmptyState> : null}
              {pending.map((request) => {
                const clash = approvalBlocked(occupied, span(request.requested_start, 60));
                const requestFocus = `request-${request.public_reference}`;
                return (
                  <article
                    key={request.id}
                    id={requestFocus}
                    className={focusKey === requestFocus ? "tme-admin-card tme-card-focus" : "tme-admin-card"}
                  >
                    <div className="tme-admin-card-head">
                      <div>
                        <strong>{request.public_reference}</strong>
                        <p>{formatMadrid(new Date(request.requested_start), "es")}</p>
                        <p>
                          {request.contact_name} · asiste {request.attendee_name}
                        </p>
                        <p>
                          {request.phone}
                          {request.email ? ` · ${request.email}` : ""}
                        </p>
                        <p className="tme-admin-note">
                          Idioma: {request.session_language === "en" ? "Inglés" : "Español"}
                        </p>
                        {request.question ? <p className="tme-admin-note">{request.question}</p> : null}
                      </div>
                      <StatusPill status="pending" tone="warn" />
                    </div>
                    {clash ? (
                      <p className="tme-admin-warn">Esta hora choca con una sesión ya confirmada. Aceptarla fallará y no reservará nada.</p>
                    ) : null}
                    <label htmlFor={`venue-${request.id}`}>Lugar que se puede publicar</label>
                    <input
                      id={`venue-${request.id}`}
                      value={venues[request.id] ?? ""}
                      onChange={(event) => setVenues((current) => ({ ...current, [request.id]: event.target.value }))}
                    />
                    <p className="tme-hint">No escribas una dirección particular si no quieres publicarla.</p>
                    <div className="tme-admin-inline-actions">
                      <button type="button" className="tme-primary" onClick={() => approve(request)}>
                        Aceptar y reservar
                      </button>
                      <button type="button" className="tme-secondary" onClick={() => decline(request.id)}>
                        Rechazar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {section === "opiniones" ? (
          <section className="tme-admin-panel" aria-labelledby="admin-opiniones">
            <div className="tme-admin-panel-head">
              <h2 id="admin-opiniones">Opiniones</h2>
              <p>Las que llegan desde la web esperan aquí. Publícalas para que salgan en la página, u ocúltalas.</p>
            </div>
            <form className="tme-admin-form tme-admin-card" onSubmit={addTestimonial}>
              <h3>Añadir una a mano</h3>
              <p className="tme-hint">Para una frase que te dijeron en persona. Se publica al guardar.</p>
              <div className="tme-admin-form-grid">
                <div>
                  <label htmlFor="story-name">Nombre</label>
                  <input id="story-name" value={storyName} maxLength={60} onChange={(event) => setStoryName(event.target.value)} required />
                </div>
                <div>
                  <label htmlFor="story-place">Lugar, si quieres</label>
                  <input id="story-place" value={storyPlace} maxLength={80} onChange={(event) => setStoryPlace(event.target.value)} />
                </div>
                <div className="tme-admin-span-2">
                  <label htmlFor="story-body">Texto</label>
                  <textarea id="story-body" rows={4} maxLength={400} value={storyBody} onChange={(event) => setStoryBody(event.target.value)} required />
                </div>
              </div>
              <button type="submit" className="tme-primary">
                Publicar en la web
              </button>
            </form>
            <div className="tme-admin-list">
              {testimonials.length === 0 ? <EmptyState>Todavía no hay opiniones.</EmptyState> : null}
              {testimonials.map((story) => (
                <article key={story.id} className="tme-admin-card">
                  <div className="tme-admin-card-head">
                    <div>
                      <strong>{story.display_name}</strong>
                      <p>
                        {story.status === "published" ? "Visible" : story.status === "hidden" ? "Oculta" : "Pendiente"}
                        {story.place ? ` · ${story.place}` : ""}
                        {` · ${story.locale.toUpperCase()}`}
                      </p>
                      <p className="tme-admin-note">{story.body}</p>
                    </div>
                  </div>
                  <div className="tme-admin-actions">
                    {story.status !== "published" ? (
                      <button type="button" className="tme-primary" onClick={() => setTestimonialStatus(story.id, "published")}>
                        Publicar
                      </button>
                    ) : (
                      <button type="button" className="tme-secondary" onClick={() => setTestimonialStatus(story.id, "hidden")}>
                        Ocultar
                      </button>
                    )}
                    <button type="button" className="tme-danger" onClick={() => deleteTestimonial(story.id)}>
                      Borrar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {section === "mas" ? (
          <section className="tme-admin-panel" aria-labelledby="admin-mas">
            <div className="tme-admin-panel-head">
              <h2 id="admin-mas">Más</h2>
              <p>Horario del calendario público, bloqueos, avisos y herramientas.</p>
            </div>

            <form className="tme-admin-form tme-admin-card" onSubmit={saveCalendarSettings}>
              <h3>Horario y calendario público</h3>
              <p className="tme-hint">
                La web solo muestra citas cuando activas el calendario. La plantilla semanal cubre de 08:00 a 20:00; las celdas ocupadas (y su margen) no se ofrecen.
              </p>
              <label className="tme-check">
                <input
                  type="checkbox"
                  checked={calendarSettings.enabled}
                  onChange={(event) => setCalendarSettings((current) => ({ ...current, enabled: event.target.checked }))}
                />
                <span>Calendario público activo (reservas en la web)</span>
              </label>
              <div className="tme-admin-form-grid">
                <div>
                  <span className="tme-admin-field-label">Ventana diaria</span>
                  <p className="tme-admin-muted-line">08:00 – 20:00 (fija con la plantilla)</p>
                </div>
                <div>
                  <label htmlFor="cal-buffer">Margen alrededor de ocupado (min)</label>
                  <input
                    id="cal-buffer"
                    type="number"
                    min={0}
                    max={60}
                    value={calendarSettings.buffer_minutes}
                    onChange={(event) =>
                      setCalendarSettings((current) => ({
                        ...current,
                        buffer_minutes: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="tme-admin-span-2">
                  <label htmlFor="cal-venue">Lugar por defecto en reservas web</label>
                  <input
                    id="cal-venue"
                    value={calendarSettings.default_venue_label}
                    onChange={(event) =>
                      setCalendarSettings((current) => ({ ...current, default_venue_label: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <button type="submit" className="tme-primary">
                Guardar horario
              </button>

              <h3>Plantilla semanal</h3>
              <p className="tme-hint">
                Pulsa una celda para marcarla libre u ocupada. Libre = se puede reservar; ocupada = bloqueada cada semana (más el margen).
              </p>
              <div className="tme-admin-legend" aria-hidden="true">
                <span className="tme-admin-legend-item">
                  <span className="tme-admin-swatch tme-admin-swatch-free" /> Libre
                </span>
                <span className="tme-admin-legend-item">
                  <span className="tme-admin-swatch tme-admin-swatch-busy" /> Ocupada
                </span>
              </div>
              <div className="tme-admin-sheet" role="region" aria-label="Plantilla semanal de disponibilidad">
                <table className="tme-admin-week-grid">
                  <thead>
                    <tr>
                      <th scope="col">Hora</th>
                      {WEEKDAY_SHORT.map((label) => (
                        <th key={label} scope="col">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEMPLATE_HOURS.map((hourStart) => (
                      <tr key={hourStart}>
                        <th scope="row">{minuteToHhMm(hourStart)}</th>
                        {WEEKDAY_SHORT.map((_, index) => {
                          const weekday = index + 1;
                          const busy = hourIsWeeklyBusy(busyLikes, weekday, hourStart);
                          return (
                            <td key={`${weekday}-${hourStart}`}>
                              <button
                                type="button"
                                className={busy ? "tme-admin-cell tme-admin-cell-busy" : "tme-admin-cell tme-admin-cell-free"}
                                aria-pressed={busy}
                                aria-label={`${WEEKDAY_SHORT[index]} ${minuteToHhMm(hourStart)} ${busy ? "ocupada" : "libre"}`}
                                disabled={scheduleBusy}
                                onClick={() => toggleWeeklyBusyHour(weekday, hourStart)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </form>

            <div className="tme-admin-grid">
              <div className="tme-admin-card tme-admin-form">
                <h3>Días cerrados</h3>
                <p className="tme-hint">Pulsa un día para abrirlo o cerrarlo por completo. Cerrado = no se ofrecen citas ese día.</p>
                <div className="tme-admin-legend" aria-hidden="true">
                  <span className="tme-admin-legend-item">
                    <span className="tme-admin-swatch tme-admin-swatch-free" /> Abierto
                  </span>
                  <span className="tme-admin-legend-item">
                    <span className="tme-admin-swatch tme-admin-swatch-closed" /> Cerrado
                  </span>
                </div>
                <div className="tme-admin-month-nav">
                  <button type="button" className="tme-secondary" onClick={() => shiftClosedMonth(-1)}>
                    Anterior
                  </button>
                  <strong className="tme-admin-month-label">{monthTitle(closedView.year, closedView.month)}</strong>
                  <button type="button" className="tme-secondary" onClick={() => shiftClosedMonth(1)}>
                    Siguiente
                  </button>
                </div>
                <div className="tme-admin-month-grid" role="grid" aria-label="Días cerrados del mes">
                  {WEEKDAY_SHORT.map((label) => (
                    <div key={label} className="tme-admin-month-head" role="columnheader">
                      {label}
                    </div>
                  ))}
                  {closedMonthCells.map((cell, index) => {
                    if (!cell.iso) {
                      return <div key={`empty-${index}`} className="tme-admin-month-cell tme-admin-month-empty" />;
                    }
                    const closed = isClosedDay(cell.iso, closedRanges);
                    const past = cell.iso < todayMadridIso();
                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        role="gridcell"
                        className={[
                          "tme-admin-month-cell",
                          closed ? "tme-admin-month-closed" : "tme-admin-month-open",
                          past ? "is-past" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={closed}
                        aria-label={`${cell.iso} ${closed ? "cerrado" : "abierto"}`}
                        disabled={scheduleBusy}
                        onClick={() => toggleClosedDay(cell.iso!)}
                      >
                        {Number(cell.iso.slice(-2))}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="tme-admin-card">
                <h3>Avisos</h3>
                {failedNotes.length === 0 ? <EmptyState>No hay avisos pendientes.</EmptyState> : null}
                {failedNotes.map((note) => (
                  <article key={note.id} className="tme-admin-item">
                    <div className="tme-admin-item-main">
                      <strong>{note.subject}</strong>
                      <p>
                        {statusLabel(note.status)} · intentos {note.attempts}
                        {note.last_error ? ` · ${note.last_error}` : ""}
                      </p>
                    </div>
                    <button type="button" className="tme-secondary" onClick={() => retry(note.id)}>
                      Reintentar
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="tme-admin-card tme-admin-tools">
              <h3>Herramientas</h3>
              <div className="tme-admin-inline-actions">
                <button
                  type="button"
                  className="tme-secondary"
                  onClick={() => navigator.clipboard.writeText("https://iknowainhoa.com/guardamar-click?src=flyer")}
                >
                  Copiar enlace del cartel
                </button>
                <button type="button" className="tme-secondary" onClick={exportCsv}>
                  Exportar CSV
                </button>
                <button type="button" className="tme-admin-text-btn" onClick={() => supabase.auth.signOut().then(() => setIsAdmin(false))}>
                  Salir
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
