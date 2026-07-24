"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildConfirmationImage,
  customerWhatsAppHref,
  downloadBlob,
} from "@/lib/parking/confirmationImage";
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
  customer_surnames: "",
  customer_dni: "",
  customer_phone: "",
  vehicle_registration: "",
  vehicle_description: "",
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
  const [lastSaved, setLastSaved] = useState<ParkingBooking | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
    setLastSaved(null);
  }

  function editRow(row: ParkingBooking) {
    setForm({
      id: row.id,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      customer_name: row.customer_name || "",
      customer_surnames: row.customer_surnames || "",
      customer_dni: row.customer_dni || "",
      customer_phone: row.customer_phone || "",
      vehicle_registration: row.vehicle_registration || "",
      vehicle_description: row.vehicle_description || "",
      price_eur: row.price_eur != null ? String(row.price_eur) : "",
      private_notes: row.private_notes || "",
    });
    setMessage(null);
    setLastSaved(row);
  }

  function validateOverlap(
    start: string,
    end: string,
    status: ParkingBookingStatus,
    id?: string
  ) {
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

  async function makeConfirmation(booking: {
    customer_name: string | null;
    customer_surnames: string | null;
    customer_dni: string | null;
    customer_phone: string | null;
    start_date: string;
    end_date: string;
    price_eur: number | null;
  }) {
    if (
      !booking.customer_name ||
      !booking.customer_surnames ||
      !booking.customer_dni ||
      !booking.customer_phone ||
      booking.price_eur == null
    ) {
      return;
    }
    const blob = await buildConfirmationImage({
      name: booking.customer_name,
      surnames: booking.customer_surnames,
      dni: booking.customer_dni,
      phone: booking.customer_phone,
      startDate: booking.start_date,
      endDate: booking.end_date,
      priceEur: Number(booking.price_eur),
    });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
    downloadBlob(
      blob,
      `confirmacion-parking-${booking.start_date}-${booking.customer_dni}.png`
    );
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

    const isBooking = form.status === "reserved" || form.status === "completed";
    if (isBooking) {
      if (!form.customer_name.trim()) {
        setMessage("El nombre es obligatorio para una reserva.");
        return;
      }
      if (!form.customer_surnames.trim()) {
        setMessage("Los apellidos son obligatorios para una reserva.");
        return;
      }
      if (!form.customer_dni.trim()) {
        setMessage("El DNI/NIE es obligatorio para una reserva.");
        return;
      }
      if (!form.customer_phone.trim()) {
        setMessage("El teléfono es obligatorio para una reserva.");
        return;
      }
      if (form.price_eur === "" || Number.isNaN(Number(form.price_eur))) {
        setMessage("El importe pagado es obligatorio para una reserva.");
        return;
      }
    }

    const overlap = validateOverlap(
      form.start_date,
      form.end_date,
      form.status,
      form.id || undefined
    );
    if (overlap) {
      setMessage(overlap);
      return;
    }

    const payload = {
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
      customer_name: form.customer_name.trim() || null,
      customer_surnames: form.customer_surnames.trim() || null,
      customer_dni: form.customer_dni.trim().toUpperCase() || null,
      customer_phone: form.customer_phone.trim() || null,
      vehicle_registration: form.vehicle_registration.trim() || null,
      vehicle_description: form.vehicle_description.trim() || null,
      price_eur: form.price_eur === "" ? null : Number(form.price_eur),
      private_notes: form.private_notes.trim() || null,
    };

    setSaving(true);
    const result = form.id
      ? await supabase
          .from("parking_bookings")
          .update(payload)
          .eq("id", form.id)
          .select()
          .single()
      : await supabase.from("parking_bookings").insert(payload).select().single();
    setSaving(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    const saved = result.data as ParkingBooking;
    setLastSaved(saved);
    setMessage(
      form.id
        ? "Registro actualizado."
        : "Reserva guardada. Se ha descargado la imagen de confirmación."
    );

    if (isBooking) {
      try {
        await makeConfirmation(saved);
      } catch {
        setMessage(
          "Reserva guardada, pero no se pudo generar la imagen de confirmación."
        );
      }
    }

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
    if (lastSaved?.id === id) setLastSaved(null);
    await loadRows();
  }

  function openCustomerWhatsApp(booking: ParkingBooking) {
    if (!booking.customer_phone) return;
    const fullName = [booking.customer_name, booking.customer_surnames]
      .filter(Boolean)
      .join(" ");
    const msg = `Hola${fullName ? ` ${fullName}` : ""}, te confirmo la reserva de Parking Guardamar Centro (Jorge Juan 13) del ${formatSpanishDate(booking.start_date)} al ${formatSpanishDate(booking.end_date)}${booking.price_eur != null ? ` por ${booking.price_eur} €` : ""}. Te envío el comprobante con tu DNI en la siguiente imagen.`;
    window.open(
      customerWhatsAppHref(booking.customer_phone, msg),
      "_blank",
      "noopener,noreferrer"
    );
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
        <h2>{form.id ? "Editar registro" : "Confirmar reserva"}</h2>
        <p className="hint">
          Para una reserva confirmada: nombre, apellidos, DNI, teléfono, fechas e
          importe. Al guardar se genera una imagen de confirmación para enviar por
          WhatsApp.
        </p>
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
            <option value="reserved">Reservado (confirmado)</option>
            <option value="blocked">No disponible (bloqueado)</option>
            <option value="completed">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
        <div className="row">
          <label>
            Nombre *
            <input
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              autoComplete="given-name"
            />
          </label>
          <label>
            Apellidos *
            <input
              value={form.customer_surnames}
              onChange={(e) =>
                setForm({ ...form, customer_surnames: e.target.value })
              }
              autoComplete="family-name"
            />
          </label>
        </div>
        <div className="row">
          <label>
            DNI / NIE *
            <input
              value={form.customer_dni}
              onChange={(e) => setForm({ ...form, customer_dni: e.target.value })}
            />
          </label>
          <label>
            Teléfono *
            <input
              type="tel"
              value={form.customer_phone}
              onChange={(e) =>
                setForm({ ...form, customer_phone: e.target.value })
              }
              placeholder="636…"
              autoComplete="tel"
            />
          </label>
        </div>
        <label>
          Importe pagado (€) *
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price_eur}
            onChange={(e) => setForm({ ...form, price_eur: e.target.value })}
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
            {saving
              ? "Guardando…"
              : form.id
                ? "Guardar cambios"
                : "Guardar y generar comprobante"}
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

      {lastSaved &&
      lastSaved.customer_phone &&
      (lastSaved.status === "reserved" || lastSaved.status === "completed") ? (
        <section className="card confirm-box">
          <h2>Enviar confirmación</h2>
          <p className="hint">
            WhatsApp no puede adjuntar la imagen automáticamente. Descárgala (o
            usa la vista previa) y adjúntala en el chat.
          </p>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Vista previa del comprobante"
              className="preview"
            />
          ) : null}
          <div className="actions">
            <button
              type="button"
              onClick={() => void makeConfirmation(lastSaved)}
            >
              Descargar imagen otra vez
            </button>
            <button
              type="button"
              className="wa"
              onClick={() => openCustomerWhatsApp(lastSaved)}
            >
              Abrir WhatsApp del cliente
            </button>
          </div>
        </section>
      ) : null}

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
                <th>DNI</th>
                <th>Tel.</th>
                <th>€</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {formatSpanishDate(r.start_date)} →{" "}
                    {formatSpanishDate(r.end_date)}
                  </td>
                  <td>{STATUS_LABELS_ES[r.status]}</td>
                  <td>
                    {[r.customer_name, r.customer_surnames]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td>{r.customer_dni || "—"}</td>
                  <td>{r.customer_phone || "—"}</td>
                  <td>{r.price_eur != null ? r.price_eur : "—"}</td>
                  <td className="ops">
                    <button type="button" onClick={() => editRow(r)}>
                      Editar
                    </button>
                    {r.customer_phone &&
                    (r.status === "reserved" || r.status === "completed") ? (
                      <button
                        type="button"
                        className="wa"
                        onClick={() => {
                          setLastSaved(r);
                          void makeConfirmation(r).then(() =>
                            openCustomerWhatsApp(r)
                          );
                        }}
                      >
                        WhatsApp
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void onDelete(r.id)}
                    >
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
              <strong>
                {[r.customer_name, r.customer_surnames].filter(Boolean).join(" ") ||
                  "Sin nombre"}
              </strong>
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
  .hint { margin: 0 0 8px; color: #555; font-size: 0.88rem; line-height: 1.45; font-weight: 400; }
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
  .wa { background: #128c7e; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .preview { width: 100%; max-width: 360px; border-radius: 10px; border: 1px solid #e6e6e6; margin: 8px 0 12px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  .ops { display: flex; flex-wrap: wrap; gap: 6px; }
  .ops button { min-height: 36px; font-size: 0.8rem; }
`;
