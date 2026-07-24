"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getParkingSupabase, parkingSupabaseConfigured } from "@/lib/parking/supabase";
import {
  STATUS_LABELS_ES,
  formatSpanishDate,
  rangesOverlap,
  type ParkingBooking,
  type ParkingBookingStatus,
} from "@/lib/parking/types";

const EMPTY_FORM = {
  id: "" as string,
  start_date: "",
  end_date: "",
  status: "reserved" as ParkingBookingStatus,
  customer_name: "",
  customer_phone: "",
  vehicle_registration: "",
  vehicle_description: "",
  arrival_time: "",
  departure_time: "",
  price_eur: "",
  private_notes: "",
};

export default function ParkingAdminApp() {
  const configured = parkingSupabaseConfigured();
  const supabase = getParkingSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rows, setRows] = useState<ParkingBooking[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    setSessionEmail(data.session?.user?.email ?? null);
  }, [supabase]);

  const loadRows = useCallback(async () => {
    if (!supabase || !sessionEmail) return;
    const { data, error } = await supabase
      .from("parking_bookings")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) {
      setLoadError(error.message);
      setRows([]);
      return;
    }
    setLoadError(null);
    setRows((data || []) as ParkingBooking[]);
  }, [supabase, sessionEmail]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (sessionEmail) void loadRows();
  }, [sessionEmail, loadRows]);

  const today = useMemo(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  }, []);

  const upcomingArrivals = rows.filter(
    (r) => r.status === "reserved" && r.start_date >= today
  );
  const upcomingDepartures = rows.filter(
    (r) => r.status === "reserved" && r.end_date >= today
  );
  const current = rows.filter(
    (r) => r.status === "reserved" && r.start_date <= today && r.end_date >= today
  );
  const completed = rows.filter((r) => r.status === "completed");

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!supabase) {
      setAuthError("Supabase no está configurado.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }
    await refreshSession();
  }

  async function onLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSessionEmail(null);
    setRows([]);
    setForm(EMPTY_FORM);
  }

  function editRow(row: ParkingBooking) {
    setForm({
      id: row.id,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      customer_name: row.customer_name || "",
      customer_phone: row.customer_phone || "",
      vehicle_registration: row.vehicle_registration || "",
      vehicle_description: row.vehicle_description || "",
      arrival_time: row.arrival_time?.slice(0, 5) || "",
      departure_time: row.departure_time?.slice(0, 5) || "",
      price_eur: row.price_eur != null ? String(row.price_eur) : "",
      private_notes: row.private_notes || "",
    });
    setMessage(null);
  }

  function validateOverlap(start: string, end: string, status: ParkingBookingStatus, id?: string) {
    if (status !== "reserved" && status !== "blocked") return null;
    const clash = rows.find(
      (r) =>
        r.id !== id &&
        (r.status === "reserved" || r.status === "blocked") &&
        rangesOverlap(start, end, r.start_date, r.end_date)
    );
    if (clash) {
      return `Las fechas se solapan con un registro existente (${STATUS_LABELS_ES[clash.status]}: ${clash.start_date} – ${clash.end_date}).`;
    }
    return null;
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return;
    if (!form.start_date || !form.end_date) {
      setMessage("Las fechas son obligatorias.");
      return;
    }
    if (form.end_date < form.start_date) {
      setMessage("La fecha de fin debe ser igual o posterior a la de inicio.");
      return;
    }
    const overlap = validateOverlap(form.start_date, form.end_date, form.status, form.id || undefined);
    if (overlap) {
      setMessage(overlap);
      return;
    }

    const payload = {
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
      customer_name: form.customer_name.trim() || null,
      customer_phone: form.customer_phone.trim() || null,
      vehicle_registration: form.vehicle_registration.trim() || null,
      vehicle_description: form.vehicle_description.trim() || null,
      arrival_time: form.arrival_time || null,
      departure_time: form.departure_time || null,
      price_eur: form.price_eur === "" ? null : Number(form.price_eur),
      private_notes: form.private_notes.trim() || null,
    };

    setSaving(true);
    const result = form.id
      ? await supabase.from("parking_bookings").update(payload).eq("id", form.id).select().single()
      : await supabase.from("parking_bookings").insert(payload).select().single();
    setSaving(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setMessage(form.id ? "Registro actualizado." : "Registro creado.");
    setForm(EMPTY_FORM);
    await loadRows();
  }

  async function onDelete(id: string) {
    if (!supabase) return;
    if (!window.confirm("¿Eliminar este registro?")) return;
    const { error } = await supabase.from("parking_bookings").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (form.id === id) setForm(EMPTY_FORM);
    await loadRows();
  }

  if (!configured || !supabase) {
    return (
      <div className="adm">
        <h1>Administración — Parking Guardamar Centro</h1>
        <p className="warn">
          Configura <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, ejecuta{" "}
          <code>supabase/parking.sql</code> y crea un usuario administrador en
          Supabase Auth.
        </p>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (!sessionEmail) {
    return (
      <div className="adm">
        <h1>Administración — Parking Guardamar Centro</h1>
        <p className="muted">Acceso restringido. Inicia sesión.</p>
        <form className="card form" onSubmit={onLogin}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {authError ? <p className="err">{authError}</p> : null}
          <button type="submit">Entrar</button>
        </form>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="adm">
      <header className="top">
        <div>
          <h1>Administración — Parking Guardamar Centro</h1>
          <p className="muted">{sessionEmail}</p>
        </div>
        <button type="button" className="ghost" onClick={() => void onLogout()}>
          Cerrar sesión
        </button>
      </header>

      <div className="dash">
        <DashCard title="Próximas llegadas" rows={upcomingArrivals} />
        <DashCard title="Próximas salidas" rows={upcomingDepartures} />
        <DashCard title="Reservas actuales" rows={current} />
        <DashCard title="Finalizadas" rows={completed} />
      </div>

      <form className="card form" onSubmit={(e) => void onSave(e)}>
        <h2>{form.id ? "Editar registro" : "Nuevo registro"}</h2>
        <div className="row">
          <label>
            Inicio *
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </label>
          <label>
            Fin *
            <input
              type="date"
              required
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </label>
        </div>
        <label>
          Estado
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as ParkingBookingStatus })
            }
          >
            <option value="reserved">Reservado</option>
            <option value="blocked">No disponible (bloqueado)</option>
            <option value="completed">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
        <label>
          Nombre del cliente
          <input
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          />
        </label>
        <label>
          Teléfono
          <input
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          />
        </label>
        <label>
          Matrícula
          <input
            value={form.vehicle_registration}
            onChange={(e) =>
              setForm({ ...form, vehicle_registration: e.target.value })
            }
          />
        </label>
        <label>
          Vehículo
          <input
            value={form.vehicle_description}
            onChange={(e) =>
              setForm({ ...form, vehicle_description: e.target.value })
            }
          />
        </label>
        <div className="row">
          <label>
            Hora llegada
            <input
              type="time"
              value={form.arrival_time}
              onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
            />
          </label>
          <label>
            Hora salida
            <input
              type="time"
              value={form.departure_time}
              onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
            />
          </label>
        </div>
        <label>
          Precio (€)
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price_eur}
            onChange={(e) => setForm({ ...form, price_eur: e.target.value })}
          />
        </label>
        <label>
          Notas privadas
          <textarea
            rows={3}
            value={form.private_notes}
            onChange={(e) => setForm({ ...form, private_notes: e.target.value })}
          />
        </label>
        {message ? <p className="msg">{message}</p> : null}
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? "Guardando…" : form.id ? "Guardar cambios" : "Añadir"}
          </button>
          {form.id ? (
            <button
              type="button"
              className="ghost"
              onClick={() => setForm(EMPTY_FORM)}
            >
              Cancelar edición
            </button>
          ) : null}
        </div>
      </form>

      {loadError ? <p className="err">{loadError}</p> : null}

      <section className="card">
        <h2>Todos los registros</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Tel.</th>
                <th>Matrícula</th>
                <th>€</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {formatSpanishDate(r.start_date)} → {formatSpanishDate(r.end_date)}
                  </td>
                  <td>{STATUS_LABELS_ES[r.status]}</td>
                  <td>{r.customer_name || "—"}</td>
                  <td>{r.customer_phone || "—"}</td>
                  <td>{r.vehicle_registration || "—"}</td>
                  <td>{r.price_eur != null ? r.price_eur : "—"}</td>
                  <td className="ops">
                    <button type="button" onClick={() => editRow(r)}>
                      Editar
                    </button>
                    <button type="button" className="danger" onClick={() => void onDelete(r.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="muted">Sin registros.</p> : null}
        </div>
      </section>

      <style jsx>{styles}</style>
    </div>
  );
}

function DashCard({ title, rows }: { title: string; rows: ParkingBooking[] }) {
  return (
    <div className="card dash-card">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="muted">Ninguno</p>
      ) : (
        <ul>
          {rows.slice(0, 5).map((r) => (
            <li key={r.id}>
              <strong>{r.customer_name || "Sin nombre"}</strong>
              <span>
                {r.start_date} → {r.end_date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = `
  .adm {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px 16px 56px;
    font-family: system-ui, -apple-system, sans-serif;
    color: #1a1a1a;
  }
  h1 { margin: 0 0 8px; font-size: 1.45rem; }
  h2 { margin: 0 0 12px; font-size: 1.1rem; }
  h3 { margin: 0 0 8px; font-size: 0.95rem; }
  .muted { color: #666; font-size: 0.9rem; }
  .warn { background: #fff6d6; border: 1px solid #f0e0a0; padding: 12px; border-radius: 10px; line-height: 1.5; }
  .err { color: #8b1e1e; }
  .msg { color: #1b5e34; }
  .top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 18px; }
  .dash { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px; }
  .card { background: #fff; border: 1px solid #e6e6e6; border-radius: 12px; padding: 14px; margin-bottom: 14px; }
  .dash-card ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  .dash-card li { display: grid; gap: 2px; font-size: 0.85rem; }
  .form { display: grid; gap: 10px; }
  label { display: grid; gap: 6px; font-size: 0.88rem; font-weight: 650; }
  input, select, textarea { min-height: 44px; border: 1px solid #ccc; border-radius: 8px; padding: 8px 10px; font: inherit; font-weight: 400; }
  textarea { min-height: 80px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 560px) { .row { grid-template-columns: 1fr; } .top { flex-direction: column; } }
  button { min-height: 44px; border: 0; border-radius: 10px; background: #111; color: #fff; font-weight: 650; cursor: pointer; padding: 0 14px; }
  .ghost { background: #fff; color: #111; border: 1px solid #ccc; }
  .danger { background: #8b1e1e; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  .ops { display: flex; gap: 6px; }
  .ops button { min-height: 36px; font-size: 0.8rem; }
`;
