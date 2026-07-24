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
  PARKING_DNI_BUCKET,
  dniStoragePath,
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
  customer_dni_image_path: "" as string,
  customer_phone: "",
  vehicle_registration: "",
  vehicle_description: "",
  price_eur: "",
  private_notes: "",
};

const LOGO_SRC = "/images/parking/guardamar-parking-logo.png";

const SCHEMA_MIGRATE_HINT =
  "Falta una columna en Supabase. Abre SQL Editor del proyecto y ejecuta supabase/parking-booking-fields.sql (incluye customer_dni / customer_surnames y NOTIFY pgrst).";

function formatParkingError(message: string): string {
  if (
    /customer_dni|customer_surnames|customer_dni_image_path|schema cache/i.test(
      message
    )
  ) {
    return `${message}\n\n${SCHEMA_MIGRATE_HINT}`;
  }
  return message;
}

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
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [dniLocalPreview, setDniLocalPreview] = useState<string | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);

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
      if (dniLocalPreview) URL.revokeObjectURL(dniLocalPreview);
    };
  }, [previewUrl, dniLocalPreview]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setDniFile(null);
    if (dniLocalPreview) URL.revokeObjectURL(dniLocalPreview);
    setDniLocalPreview(null);
  }

  async function onPickDni(file: File | null) {
    if (dniLocalPreview) URL.revokeObjectURL(dniLocalPreview);
    setDniFile(file);
    setDniLocalPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    if (!file || !file.type.startsWith("image/")) return;

    setOcrBusy(true);
    setMessage("Leyendo el DNI…");
    try {
      const { extractDniFromImage } = await import("@/lib/parking/parseDniOcr");
      const parsed = await extractDniFromImage(file);
      setForm((prev) => ({
        ...prev,
        customer_name: parsed.name || prev.customer_name,
        customer_surnames: parsed.surnames || prev.customer_surnames,
        customer_dni: parsed.dni || prev.customer_dni,
        status: prev.status === "blocked" ? "reserved" : prev.status,
      }));
      const filled = [parsed.name, parsed.surnames, parsed.dni].filter(Boolean).length;
      setMessage(
        filled
          ? `DNI leído (${filled}/3 campos). Revisa y completa fechas, teléfono e importe.`
          : "No se pudo leer el DNI con claridad. Rellena los datos a mano."
      );
    } catch {
      setMessage("No se pudo leer el DNI. Rellena los datos a mano.");
    } finally {
      setOcrBusy(false);
    }
  }

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
    resetForm();
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
      customer_dni_image_path: row.customer_dni_image_path || "",
      customer_phone: row.customer_phone || "",
      vehicle_registration: row.vehicle_registration || "",
      vehicle_description: row.vehicle_description || "",
      price_eur: row.price_eur != null ? String(row.price_eur) : "",
      private_notes: row.private_notes || "",
    });
    setDniFile(null);
    if (dniLocalPreview) URL.revokeObjectURL(dniLocalPreview);
    setDniLocalPreview(null);
    setMessage(null);
    setLastSaved(row);
  }

  async function openDniImage(path: string) {
    if (!supabase) return;
    const { data, error } = await supabase.storage
      .from(PARKING_DNI_BUCKET)
      .createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) {
      setMessage(error?.message || "No se pudo abrir la imagen del DNI.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function uploadDniForBooking(bookingId: string, file: File) {
    if (!supabase) throw new Error("Supabase no configurado");
    const path = dniStoragePath(bookingId, file);
    const { error } = await supabase.storage
      .from(PARKING_DNI_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw error;
    return path;
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
      if (!dniFile && !form.customer_dni_image_path) {
        setMessage("Sube una foto o PDF del DNI para confirmar la reserva.");
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

    const bookingId = form.id || crypto.randomUUID();
    let dniPath = form.customer_dni_image_path || null;

    setSaving(true);
    try {
      if (dniFile) {
        dniPath = await uploadDniForBooking(bookingId, dniFile);
      }

      const payload = {
        id: bookingId,
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
        customer_name: form.customer_name.trim() || null,
        customer_surnames: form.customer_surnames.trim() || null,
        customer_dni: form.customer_dni.trim().toUpperCase() || null,
        customer_dni_image_path: dniPath,
        customer_phone: form.customer_phone.trim() || null,
        vehicle_registration: form.vehicle_registration.trim() || null,
        vehicle_description: form.vehicle_description.trim() || null,
        price_eur: form.price_eur === "" ? null : Number(form.price_eur),
        private_notes: form.private_notes.trim() || null,
      };

      const result = form.id
        ? await supabase
            .from("parking_bookings")
            .update(payload)
            .eq("id", form.id)
            .select()
            .single()
        : await supabase.from("parking_bookings").insert(payload).select().single();

      if (result.error) {
        setMessage(formatParkingError(result.error.message));
        return;
      }

      const saved = result.data as ParkingBooking;
      const wasUpdate = Boolean(form.id);
      setLastSaved(saved);
      // Keep the saved booking loaded so missing fields can be fixed and saved again.
      setForm({
        id: saved.id,
        start_date: saved.start_date,
        end_date: saved.end_date,
        status: saved.status,
        customer_name: saved.customer_name || "",
        customer_surnames: saved.customer_surnames || "",
        customer_dni: saved.customer_dni || "",
        customer_dni_image_path: saved.customer_dni_image_path || "",
        customer_phone: saved.customer_phone || "",
        vehicle_registration: saved.vehicle_registration || "",
        vehicle_description: saved.vehicle_description || "",
        price_eur: saved.price_eur != null ? String(saved.price_eur) : "",
        private_notes: saved.private_notes || "",
      });
      setDniFile(null);
      if (dniLocalPreview) URL.revokeObjectURL(dniLocalPreview);
      setDniLocalPreview(null);

      let nextMessage = wasUpdate
        ? "Registro actualizado."
        : "Reserva guardada. Puedes editar los datos abajo si falta algo.";

      if (isBooking) {
        try {
          await makeConfirmation(saved);
        } catch {
          nextMessage = wasUpdate
            ? "Registro actualizado, pero no se pudo generar la imagen de confirmación."
            : "Reserva guardada, pero no se pudo generar la imagen de confirmación. Puedes editar los datos abajo si falta algo.";
        }
      }

      setMessage(nextMessage);
      await loadRows();
    } catch (err) {
      const raw =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : err instanceof Error
            ? err.message
            : "Error al guardar.";
      setMessage(
        /bucket not found/i.test(raw)
          ? "Falta crear el bucket en Supabase. En SQL Editor ejecuta supabase/parking-dni-storage.sql y vuelve a guardar."
          : raw
      );
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!supabase) return;
    if (!window.confirm("¿Eliminar este registro?")) return;
    const row = rows.find((r) => r.id === id);
    if (row?.customer_dni_image_path) {
      await supabase.storage
        .from(PARKING_DNI_BUCKET)
        .remove([row.customer_dni_image_path]);
    }
    const { error } = await supabase.from("parking_bookings").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (form.id === id) resetForm();
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
        <div className="brand">
          <img className="logo" src={LOGO_SRC} alt="Guardamar Parking" width={48} height={48} decoding="async" />
          <h1>Administración. Parking Guardamar Centro</h1>
        </div>
        <p className="warn">
          Configura <code>NEXT_PUBLIC_SUPABASE_URL</code> y la publishable/anon
          key, ejecuta <code>supabase/parking.sql</code> y crea un usuario
          administrador en Supabase Auth.
        </p>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (!sessionEmail) {
    return (
      <div className="adm">
        <div className="brand">
          <img className="logo" src={LOGO_SRC} alt="Guardamar Parking" width={48} height={48} decoding="async" />
          <h1>Administración. Parking Guardamar Centro</h1>
        </div>
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
        <div className="brand">
          <img className="logo" src={LOGO_SRC} alt="Guardamar Parking" width={48} height={48} decoding="async" />
          <div>
            <h1>Administración. Parking Guardamar Centro</h1>
            <p className="muted">{sessionEmail}</p>
          </div>
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
          Sube la foto del DNI primero: se rellenan nombre, apellidos y número.
          Luego completa fechas, teléfono e importe.
        </p>
        <label>
          <span className="adm-lab">
            Foto del DNI <span className="req">*</span>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            disabled={ocrBusy}
            onChange={(e) => void onPickDni(e.target.files?.[0] || null)}
          />
        </label>
        {ocrBusy ? <p className="hint">Leyendo el DNI…</p> : null}
        {dniLocalPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dniLocalPreview} alt="Vista previa DNI" className="dni-preview" />
        ) : null}
        {form.customer_dni_image_path && !dniFile ? (
          <p className="hint">
            DNI guardado.{" "}
            <button
              type="button"
              className="linkish"
              onClick={() => void openDniImage(form.customer_dni_image_path)}
            >
              Ver archivo
            </button>
          </p>
        ) : null}
        <div className="row">
          <label>
            <span className="adm-lab">
              Nombre <span className="req">*</span>
            </span>
            <input
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              autoComplete="given-name"
            />
          </label>
          <label>
            <span className="adm-lab">
              Apellidos <span className="req">*</span>
            </span>
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
            <span className="adm-lab">
              DNI / NIE <span className="req">*</span>
            </span>
            <input
              value={form.customer_dni}
              onChange={(e) => setForm({ ...form, customer_dni: e.target.value })}
            />
          </label>
          <label>
            <span className="adm-lab">
              Teléfono <span className="req">*</span>
            </span>
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
        <div className="row">
          <label>
            <span className="adm-lab">
              Inicio <span className="req">*</span>
            </span>
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </label>
          <label>
            <span className="adm-lab">
              Fin <span className="req">*</span>
            </span>
            <input
              type="date"
              required
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </label>
        </div>
        <div className="row">
          <label>
            <span className="adm-lab">Estado</span>
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
          <label>
            <span className="adm-lab">
              Importe pagado (€) <span className="req">*</span>
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price_eur}
              onChange={(e) => setForm({ ...form, price_eur: e.target.value })}
            />
          </label>
        </div>
        <div className="row">
          <label>
            <span className="adm-lab">Matrícula</span>
            <input
              value={form.vehicle_registration}
              onChange={(e) =>
                setForm({ ...form, vehicle_registration: e.target.value })
              }
            />
          </label>
          <label>
            <span className="adm-lab">Vehículo</span>
            <input
              value={form.vehicle_description}
              onChange={(e) =>
                setForm({ ...form, vehicle_description: e.target.value })
              }
            />
          </label>
        </div>
        <label>
          <span className="adm-lab">Notas privadas</span>
          <textarea
            rows={3}
            value={form.private_notes}
            onChange={(e) => setForm({ ...form, private_notes: e.target.value })}
          />
        </label>
        {message ? <p className="msg">{message}</p> : null}
        <div className="actions">
          <button type="submit" disabled={saving || ocrBusy}>
            {saving
              ? "Guardando…"
              : ocrBusy
                ? "Leyendo DNI…"
                : form.id
                  ? "Guardar cambios"
                  : "Guardar y generar comprobante"}
          </button>
          {form.id ? (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                resetForm();
                setMessage(null);
              }}
            >
              Nueva reserva
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
                <th>Foto</th>
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
                  <td>
                    {r.customer_dni_image_path ? (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => void openDniImage(r.customer_dni_image_path!)}
                      >
                        Ver
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
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
  .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .brand h1 { margin: 0; }
  .brand .muted { margin: 4px 0 0; }
  .top .brand { margin-bottom: 0; }
  .logo { width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; display: block; }
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
  .form { display: grid; gap: 8px; }
  label { display: grid; gap: 5px; font-size: 0.88rem; font-weight: 650; }
  .adm-lab { display: inline; line-height: 1.2; }
  .req { color: #b42318; font-weight: 700; }
  input, select, textarea { min-height: 44px; border: 1px solid #ccc; border-radius: 8px; padding: 8px 10px; font: inherit; font-weight: 400; }
  textarea { min-height: 80px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  @media (max-width: 560px) { .row { grid-template-columns: 1fr; } .top { flex-direction: column; } }
  button { min-height: 44px; border: 0; border-radius: 10px; background: #111; color: #fff; font-weight: 650; cursor: pointer; padding: 0 14px; }
  .ghost { background: #fff; color: #111; border: 1px solid #ccc; }
  .danger { background: #8b1e1e; }
  .wa { background: #128c7e; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .preview { width: 100%; max-width: 360px; border-radius: 10px; border: 1px solid #e6e6e6; margin: 8px 0 12px; }
  .dni-preview { width: 100%; max-width: 280px; border-radius: 10px; border: 1px solid #e6e6e6; }
  .linkish { background: none; border: 0; color: #0b6e4f; text-decoration: underline; cursor: pointer; padding: 0; min-height: auto; font: inherit; font-weight: 650; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  .ops { display: flex; flex-wrap: wrap; gap: 6px; }
  .ops button { min-height: 36px; font-size: 0.8rem; }
`;
