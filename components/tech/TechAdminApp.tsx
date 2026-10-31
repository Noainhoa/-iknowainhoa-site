"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { adminCopy, adminLocaleFromSearch, type AdminLocale } from "@/lib/tech/admin-copy";
import { isTechSupabaseConfigured } from "@/lib/tech/env";
import { createTechBrowserClient } from "@/lib/tech/supabase-browser";
import { GROUP_CAPACITY } from "@/lib/tech/constants";
import { parseAdminFocus } from "@/lib/tech/seo";
import { approvalBlocked, formatMadrid, intervalsOverlap, madridLocalToUtc, wholeMadridDay, type Interval } from "@/lib/tech/time";

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

type BookingRow = {
  id: string;
  session_id: string;
  public_reference: string;
  contact_name: string;
  attendee_name: string;
  phone: string;
  email: string | null;
  question: string | null;
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

type BlockRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

type AdminSection = "resumen" | "sesiones" | "reservas" | "solicitudes" | "mas";

const SECTIONS: { id: AdminSection; label: string; short: string }[] = [
  { id: "resumen", label: "Resumen", short: "Inicio" },
  { id: "sesiones", label: "Sesiones", short: "Sesiones" },
  { id: "reservas", label: "Reservas", short: "Reservas" },
  { id: "solicitudes", label: "Solicitudes", short: "Pedidos" },
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
      duration_minutes: 75,
      capacity: 5,
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
  return { sessions, bookings, requests, notes, blocks };
}

export default function TechAdminApp() {
  const supabase = useMemo(() => createTechBrowserClient(), []);
  const [previewMode] = useState(isDevUiPreview);
  const previewSeed = useMemo(() => (previewMode ? seedPreviewData() : null), [previewMode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(() => previewMode || !isTechSupabaseConfigured());
  const [isAdmin, setIsAdmin] = useState(previewMode);
  const [message, setMessage] = useState<string | null>(() => (previewMode ? "Vista previa local (datos de ejemplo)." : null));
  const [section, setSection] = useState<AdminSection>("resumen");
  const [sessions, setSessions] = useState<SessionRow[]>(() => previewSeed?.sessions ?? []);
  const [bookings, setBookings] = useState<BookingRow[]>(() => previewSeed?.bookings ?? []);
  const [requests, setRequests] = useState<RequestRow[]>(() => previewSeed?.requests ?? []);
  const [notes, setNotes] = useState<NoteRow[]>(() => previewSeed?.notes ?? []);
  const [blocks, setBlocks] = useState<BlockRow[]>(() => previewSeed?.blocks ?? []);
  const [kind, setKind] = useState<"group" | "individual">("group");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [capacity, setCapacity] = useState(GROUP_CAPACITY);
  const [venue, setVenue] = useState("");
  const [publish, setPublish] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [venues, setVenues] = useState<Record<string, string>>({});
  const [loadedAt, setLoadedAt] = useState<number | null>(() => (previewMode ? Date.now() : null));
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [locale] = useState<AdminLocale>(() =>
    typeof window === "undefined" ? "es" : adminLocaleFromSearch(window.location.search)
  );
  const copy = adminCopy[locale];

  const load = useCallback(async () => {
    if (previewMode || !supabase) return;
    const [sessionRes, bookingRes, requestRes, noteRes, blockRes] = await Promise.all([
      supabase.from("tech_sessions").select("id, kind, starts_at, duration_minutes, capacity, price_cents, venue_label, venue_public, status").order("starts_at"),
      supabase.from("tech_bookings").select("id, session_id, public_reference, contact_name, attendee_name, phone, email, question, status, attendance, payment_status, source, created_at, price_cents").order("created_at", { ascending: false }),
      supabase.from("tech_requests").select("id, public_reference, requested_start, contact_name, attendee_name, phone, email, question, status, source, created_at").order("created_at", { ascending: false }),
      supabase.from("tech_notifications").select("id, subject, status, attempts, last_error, created_at").order("created_at", { ascending: false }).limit(30),
      supabase.from("tech_blocks").select("id, starts_at, ends_at, reason").order("starts_at"),
    ]);
    if (sessionRes.error || bookingRes.error || requestRes.error) {
      setMessage(sessionRes.error?.message || bookingRes.error?.message || requestRes.error?.message || "No se han podido leer los datos. ¿Está aplicada la migración?");
      return;
    }
    setSessions((sessionRes.data ?? []) as SessionRow[]);
    setBookings((bookingRes.data ?? []) as BookingRow[]);
    setRequests((requestRes.data ?? []) as RequestRow[]);
    setNotes((noteRes.data ?? []) as NoteRow[]);
    setBlocks((blockRes.data ?? []) as BlockRow[]);
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
      else if (error) setMessage("La migración de Tech Made Easy todavía no está aplicada en la base de datos.");
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
      redirectTo: `${window.location.origin}/tech-made-easy/admin`,
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
    const candidate = span(starts.toISOString(), kind === "group" ? 75 : 60);
    if (publish && approvalBlocked(occupied, candidate)) {
      setMessage("Esa hora se solapa con otra sesión confirmada.");
      return;
    }
    const { error } = await supabase.from("tech_sessions").insert({
      kind,
      starts_at: starts.toISOString(),
      duration_minutes: kind === "group" ? 75 : 60,
      capacity: kind === "group" ? capacity : 1,
      price_cents: kind === "group" ? 1000 : 2500,
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

  async function addBlock(event: FormEvent) {
    event.preventDefault();
    if (previewMode || !supabase) {
      if (previewMode) setMessage("Vista previa: no se guarda nada.");
      return;
    }
    const range = wholeMadridDay(blockDate);
    const { error } = await supabase.from("tech_blocks").insert({
      starts_at: range.startsAt.toISOString(),
      ends_at: range.endsAt.toISOString(),
      reason: blockReason.trim() || null,
    });
    setMessage(error ? error.message : "Día bloqueado. Las sesiones ya publicadas hay que cancelarlas aparte.");
    if (!error) {
      setBlockDate("");
      setBlockReason("");
      await load();
    }
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
    link.download = "tech-made-easy-reservas.csv";
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
            Tech Made Easy no está conectado: faltan variables <code>NEXT_PUBLIC_TECH_SUPABASE_*</code> o coinciden con el
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
          <p className="tme-admin-kicker">Administración</p>
          <h1>Tech Made Easy</h1>
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
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
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
          <div>
            <p className="tme-admin-kicker">Administración</p>
            <h1>Tech Made Easy</h1>
          </div>
          <div className="tme-admin-top-actions">
            <button
              type="button"
              className="tme-secondary"
              onClick={() => navigator.clipboard.writeText("https://iknowainhoa.com/tech-made-easy?src=flyer")}
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
                        {session.kind === "group" ? "Grupo" : "Individual"} · {formatMadrid(new Date(session.starts_at), "es")}
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
                  <select id="kind" value={kind} onChange={(event) => setKind(event.target.value as "group" | "individual")}>
                    <option value="group">Grupo · 75 min · 10 €</option>
                    <option value="individual">Individual · 60 min · 25 €</option>
                  </select>
                </div>
                {kind === "group" ? (
                  <div>
                    <label htmlFor="capacity">Plazas, máximo 5</label>
                    <input
                      id="capacity"
                      type="number"
                      min={1}
                      max={5}
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
                          {session.kind === "group" ? "Grupo" : "Individual"} · {formatMadrid(new Date(session.starts_at), "es")}
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

        {section === "mas" ? (
          <section className="tme-admin-panel" aria-labelledby="admin-mas">
            <div className="tme-admin-panel-head">
              <h2 id="admin-mas">Más</h2>
              <p>Bloqueos, avisos, exportación y salida.</p>
            </div>

            <div className="tme-admin-grid">
              <form className="tme-admin-form tme-admin-card" onSubmit={addBlock}>
                <h3>Días bloqueados</h3>
                <label htmlFor="block-day">Día</label>
                <input id="block-day" type="date" value={blockDate} onChange={(event) => setBlockDate(event.target.value)} required />
                <label htmlFor="block-reason">Motivo, solo para ti</label>
                <input id="block-reason" value={blockReason} onChange={(event) => setBlockReason(event.target.value)} />
                <button type="submit" className="tme-secondary">
                  Bloquear día
                </button>
                <div className="tme-admin-list">
                  {blocks.length === 0 ? <EmptyState>No hay días bloqueados.</EmptyState> : null}
                  {blocks.map((block) => (
                    <p key={block.id} className="tme-admin-muted-line">
                      {formatMadrid(new Date(block.starts_at), "es")}
                      {block.reason ? ` · ${block.reason}` : ""}
                    </p>
                  ))}
                </div>
              </form>

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
                  onClick={() => navigator.clipboard.writeText("https://iknowainhoa.com/tech-made-easy?src=flyer")}
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
