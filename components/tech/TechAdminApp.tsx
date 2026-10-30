"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
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

function span(startIso: string, minutes: number): Interval {
  const startMs = new Date(startIso).getTime();
  return { startMs, endMs: startMs + minutes * 60 * 1000 };
}

export default function TechAdminApp() {
  const supabase = useMemo(() => createTechBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(() => !isTechSupabaseConfigured());
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [kind, setKind] = useState<"group" | "individual">("group");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [capacity, setCapacity] = useState(GROUP_CAPACITY);
  const [venue, setVenue] = useState("");
  const [publish, setPublish] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [venues, setVenues] = useState<Record<string, string>>({});
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
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
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
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
  }, [supabase, load]);

  useEffect(() => {
    if (!isAdmin || loadedAt == null) return;
    const params = new URLSearchParams(window.location.search);
    const target = parseAdminFocus(params.get("focus"), params.get("ref"));
    if (!target) return;

    const key = `${target.focus}-${target.ref}`;
    let nextKey: string | null = key;
    let nextMessage: string | null = null;

    if (target.focus === "booking") {
      const booking = bookings.find((row) => row.public_reference === target.ref);
      if (!booking) {
        nextKey = null;
        nextMessage = `No hay ninguna reserva con la referencia ${target.ref}.`;
      }
    } else {
      const request = requests.find((row) => row.public_reference === target.ref);
      if (!request) {
        nextKey = null;
        nextMessage = `No hay ninguna solicitud con la referencia ${target.ref}.`;
      } else if (request.status !== "pending") {
        nextKey = null;
        nextMessage = `La solicitud ${target.ref} ya no está pendiente (estado: ${request.status}).`;
      }
    }

    const timer = window.setTimeout(() => {
      setFocusKey(nextKey);
      if (nextMessage) setMessage(nextMessage);
      if (nextKey) {
        document.getElementById(nextKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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

  const pending = requests.filter((request) => request.status === "pending");
  const fresh = bookings.filter((booking) => {
    if (!loadedAt || booking.status !== "confirmed") return false;
    return new Date(booking.created_at).getTime() >= loadedAt - 3 * 24 * 60 * 60 * 1000;
  });
  const failedNotes = notes.filter((note) => note.status !== "sent");

  async function createSession(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
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
      setMessage(error.message.includes("tech_overlap") || error.message.includes("tech_sessions_no_overlap") || error.message.includes("conflicts")
        ? "Esa hora se solapa con otra sesión."
        : error.message);
      return;
    }
    setMessage(publish ? "Sesión publicada." : "Borrador guardado. No se puede reservar hasta publicarla con lugar.");
    await load();
  }

  async function addBlock(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const range = wholeMadridDay(blockDate);
    const { error } = await supabase.from("tech_blocks").insert({
      starts_at: range.startsAt.toISOString(),
      ends_at: range.endsAt.toISOString(),
      reason: blockReason.trim() || null,
    });
    setMessage(error ? error.message : "Día bloqueado. Las sesiones ya publicadas hay que cancelarlas aparte.");
    if (!error) await load();
  }

  async function approve(request: RequestRow) {
    if (!supabase) return;
    const venueLabel = (venues[request.id] || "").trim();
    const candidate = span(request.requested_start, 60);
    if (approvalBlocked(occupied, candidate)) {
      setMessage("Esa hora ya está ocupada. No se ha reservado. Rechaza la solicitud o espera a liberar la hora.");
      return;
    }
    const blocked = blocks.some((block) =>
      intervalsOverlap(
        { startMs: new Date(block.starts_at).getTime(), endMs: new Date(block.ends_at).getTime() },
        candidate
      )
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
    if (!supabase) return;
    const { data, error } = await supabase.rpc("tech_decline_request", { payload: { request_id: id } });
    setMessage(error || !data?.ok ? "No se ha podido rechazar." : "Solicitud rechazada.");
    await load();
  }

  async function patchBooking(id: string, patch: Partial<BookingRow>) {
    if (!supabase) return;
    const { error } = await supabase.from("tech_bookings").update(patch).eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  }

  async function cancelSession(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("tech_sessions").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await supabase
      .from("tech_bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("session_id", id)
      .eq("status", "confirmed");
    setMessage("Sesión cancelada. Avisa por teléfono a quien tuviera plaza.");
    await load();
  }

  async function retry(id: string) {
    const response = await fetch("/api/tech/admin/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = await response.json().catch(() => null);
    setMessage(payload?.notification === "sent" ? "Aviso enviado." : "El aviso sigue sin enviarse. La reserva no se ha borrado.");
    await load();
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

  if (!supabase) {
    return (
      <div className="tme-wrap">
        <p>
          Tech Made Easy no está conectado: faltan variables <code>NEXT_PUBLIC_TECH_SUPABASE_*</code> o coinciden
          con el proyecto de parking. Configura un proyecto Supabase aislado.
        </p>
      </div>
    );
  }
  if (!ready) return <div className="tme-wrap"><p>Cargando…</p></div>;

  if (!isAdmin) {
    return (
      <div className="tme-wrap">
        <h1>Sesiones</h1>
        <form onSubmit={onLogin}>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {message ? <p className="tme-alert" role="alert">{message}</p> : null}
          <button className="tme-primary" type="submit">Entrar</button>
        </form>
        <p><button type="button" onClick={onForgot}>Recuperar contraseña</button></p>
      </div>
    );
  }

  return (
    <div className="tme-wrap">
      <h1>Tech Made Easy</h1>
      <p>{sessions.filter((session) => session.status === "published").length} sesiones publicadas · {bookings.filter((booking) => booking.status === "confirmed").length} reservas confirmadas · {pending.length} solicitudes pendientes</p>
      <p>
        <button type="button" onClick={() => navigator.clipboard.writeText("https://iknowainhoa.com/tech-made-easy?src=flyer")}>
          Copiar enlace del cartel
        </button>
        {" "}
        <button type="button" onClick={exportCsv}>Exportar CSV</button>
        {" "}
        <button type="button" onClick={() => supabase.auth.signOut().then(() => setIsAdmin(false))}>Salir</button>
      </p>
      {message ? <p className="tme-alert" role="status">{message}</p> : null}
      {pending.length ? <p className="tme-admin-banner">{pending.length} solicitud{pending.length === 1 ? "" : "es"} sin responder. No ocupan el calendario.</p> : null}
      {fresh.length ? <p className="tme-admin-banner">{fresh.length} reserva{fresh.length === 1 ? "" : "s"} nueva{fresh.length === 1 ? "" : "s"} en los últimos 3 días.</p> : null}

      <section>
        <h2>Avisos</h2>
        {failedNotes.length === 0 ? <p>No hay avisos pendientes.</p> : null}
        {failedNotes.map((note) => (
          <article key={note.id} className="tme-card">
            <strong>{note.subject}</strong>
            <p>{note.status} · intentos {note.attempts}{note.last_error ? ` · ${note.last_error}` : ""}</p>
            <button type="button" onClick={() => retry(note.id)}>Reintentar aviso</button>
          </article>
        ))}
      </section>

      <section>
        <h2>Solicitudes</h2>
        {pending.length === 0 ? <p>No hay solicitudes pendientes.</p> : null}
        {pending.map((request) => {
          const clash = approvalBlocked(occupied, span(request.requested_start, 60));
          const requestFocus = `request-${request.public_reference}`;
          return (
            <article
              key={request.id}
              id={requestFocus}
              className={focusKey === requestFocus ? "tme-card tme-card-focus" : "tme-card"}
            >
              <strong>{request.public_reference}</strong>
              <p>{formatMadrid(new Date(request.requested_start), "es")}</p>
              <p>{request.contact_name} · asiste {request.attendee_name}</p>
              <p>{request.phone}{request.email ? ` · ${request.email}` : ""}</p>
              {request.question ? <p>{request.question}</p> : null}
              {clash ? <p>Esta hora choca con una sesión ya confirmada. Aceptarla fallará y no reservará nada.</p> : null}
              <label htmlFor={`venue-${request.id}`}>Lugar que se puede publicar</label>
              <input id={`venue-${request.id}`} value={venues[request.id] ?? ""} onChange={(event) => setVenues((current) => ({ ...current, [request.id]: event.target.value }))} />
              <p className="tme-hint">No escribas una dirección particular si no quieres publicarla.</p>
              <button type="button" className="tme-primary" onClick={() => approve(request)}>Aceptar y reservar</button>
              <button type="button" onClick={() => decline(request.id)}>Rechazar</button>
            </article>
          );
        })}
      </section>

      <section>
        <h2>Nueva sesión</h2>
        <p>No se crea ninguna sesión sola. Un borrador sin lugar no se puede reservar.</p>
        <form onSubmit={createSession}>
          <label htmlFor="kind">Tipo</label>
          <select id="kind" value={kind} onChange={(event) => setKind(event.target.value as "group" | "individual")}>
            <option value="group">Grupo · 75 min · 10 €</option>
            <option value="individual">Individual · 60 min · 25 €</option>
          </select>
          {kind === "group" ? (
            <>
              <label htmlFor="capacity">Plazas, máximo 5</label>
              <input id="capacity" type="number" min={1} max={5} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} />
            </>
          ) : null}
          <label htmlFor="day">Día</label>
          <input id="day" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          <label htmlFor="hour">Hora</label>
          <input id="hour" type="time" step={900} value={time} onChange={(event) => setTime(event.target.value)} required />
          <label htmlFor="venue">Lugar visible</label>
          <input id="venue" value={venue} onChange={(event) => setVenue(event.target.value)} />
          <label className="tme-check">
            <input type="checkbox" checked={publish} onChange={(event) => setPublish(event.target.checked)} />
            <span>Publicar ya. La gente podrá reservarla.</span>
          </label>
          <button className="tme-primary" type="submit">Guardar sesión</button>
        </form>
      </section>

      <section>
        <h2>Días bloqueados</h2>
        <form onSubmit={addBlock}>
          <label htmlFor="block-day">Día</label>
          <input id="block-day" type="date" value={blockDate} onChange={(event) => setBlockDate(event.target.value)} required />
          <label htmlFor="block-reason">Motivo, solo para ti</label>
          <input id="block-reason" value={blockReason} onChange={(event) => setBlockReason(event.target.value)} />
          <button type="submit">Bloquear día</button>
        </form>
        {blocks.map((block) => (
          <p key={block.id}>{formatMadrid(new Date(block.starts_at), "es")} {block.reason ? `· ${block.reason}` : ""}</p>
        ))}
      </section>

      <section>
        <h2>Sesiones</h2>
        {sessions.map((session) => (
          <article key={session.id} className="tme-card">
            <strong>{session.kind === "group" ? "Grupo" : "Individual"} · {session.status}</strong>
            <p>{formatMadrid(new Date(session.starts_at), "es")}</p>
            <p>{session.venue_public ? session.venue_label : "Lugar sin publicar"} · {session.capacity} plazas</p>
            {session.status === "published" ? (
              <button type="button" onClick={() => cancelSession(session.id)}>Cancelar sesión</button>
            ) : null}
          </article>
        ))}
      </section>

      <section>
        <h2>Reservas</h2>
        {bookings.map((booking) => {
          const bookingFocus = `booking-${booking.public_reference}`;
          return (
          <article
            key={booking.id}
            id={bookingFocus}
            className={focusKey === bookingFocus ? "tme-card tme-card-focus" : "tme-card"}
          >
            <strong>{booking.public_reference}</strong> · {booking.status}
            <p>{booking.contact_name} · asiste {booking.attendee_name}</p>
            <p>{booking.phone}{booking.email ? ` · ${booking.email}` : ""}</p>
            {booking.question ? <p>{booking.question}</p> : null}
            <label htmlFor={`pay-${booking.id}`}>Pago</label>
            <select id={`pay-${booking.id}`} value={booking.payment_status} onChange={(event) => patchBooking(booking.id, { payment_status: event.target.value })}>
              <option value="unpaid">Sin pagar</option>
              <option value="paid">Pagado</option>
            </select>
            <label htmlFor={`att-${booking.id}`}>Asistencia</label>
            <select id={`att-${booking.id}`} value={booking.attendance} onChange={(event) => patchBooking(booking.id, { attendance: event.target.value })}>
              <option value="unknown">Sin marcar</option>
              <option value="attended">Asistió</option>
              <option value="no_show">No vino</option>
            </select>
            <button type="button" onClick={() => supabase.from("tech_bookings").delete().eq("id", booking.id).then(() => load())}>
              Borrar datos de esta persona
            </button>
          </article>
          );
        })}
      </section>
    </div>
  );
}
