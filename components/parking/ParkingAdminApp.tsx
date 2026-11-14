"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildConfirmationImage,
  customerWhatsAppHref,
  downloadBlob,
} from "@/lib/parking/confirmationImage";
import { PARKING_BADGE_SRC } from "@/lib/parking/constants";
import { getParkingSupabase, parkingSupabaseConfigured } from "@/lib/parking/supabase";
import {
  DEFAULT_PARKING_RATES,
  PARKING_SEASON_ORDER,
  type ParkingRateRow,
  type ParkingSeason,
  type SeasonRates,
} from "@/lib/parking/pricing";
import {
  STATUS_LABELS_ES,
  PARKING_DNI_BUCKET,
  bookingOccupiesDate,
  dniStoragePath,
  formatSpanishDate,
  rangesOverlap,
  type ParkingBooking,
  type ParkingBookingStatus,
} from "@/lib/parking/types";

const LOGO_SRC = PARKING_BADGE_SRC;

const SEASON_LABELS_ES: Record<ParkingSeason, string> = {
  summer: "Junio–agosto",
  september: "Septiembre",
  winter: "Octubre–mayo",
};

type RateFormRow = Record<
  ParkingSeason,
  { day: string; week: string; month: string }
>;

function ratesToForm(map: Record<ParkingSeason, SeasonRates>): RateFormRow {
  const out = {} as RateFormRow;
  for (const season of PARKING_SEASON_ORDER) {
    const r = map[season];
    out[season] = {
      day: r.day == null ? "" : String(r.day),
      week: r.week == null ? "" : String(r.week),
      month: r.month == null ? "" : String(r.month),
    };
  }
  return out;
}

function parseAmount(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const hash = window.location.hash.replace(/^#/, "");
    return new URLSearchParams(hash).get("type") === "recovery";
  });
  const [resetSent, setResetSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
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
  const [rateForm, setRateForm] = useState<RateFormRow>(() =>
    ratesToForm(DEFAULT_PARKING_RATES)
  );
  const [ratesSaving, setRatesSaving] = useState(false);
  const [ratesMessage, setRatesMessage] = useState<string | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email ?? null;
    if (!email) {
      setSessionEmail(null);
      return;
    }

    const hash = window.location.hash.replace(/^#/, "");
    const isRecovery =
      recoveryMode || new URLSearchParams(hash).get("type") === "recovery";
    if (isRecovery) {
      setRecoveryMode(true);
      setSessionEmail(email);
      return;
    }

    const { data: isAdmin, error } = await supabase.rpc("is_parking_admin");
    // Before parking-admin-rls.sql is applied the RPC is missing — allow session.
    if (error && !/could not find|PGRST202|42883/i.test(error.message)) {
      await supabase.auth.signOut();
      setSessionEmail(null);
      setRows([]);
      setAuthError(error.message);
      return;
    }
    if (!error && !isAdmin) {
      await supabase.auth.signOut();
      setSessionEmail(null);
      setRows([]);
      setAuthError(
        "No tienes permiso de administrador. En Supabase SQL Editor ejecuta supabase/parking-admin-access-fix.sql (añade tu email a parking_admin_allowlist)."
      );
      return;
    }
    setAuthError(null);
    setSessionEmail(email);
  }, [supabase, recoveryMode]);

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

  const loadRates = useCallback(async () => {
    if (!supabase || !sessionEmail) return;
    const { data, error } = await supabase.rpc("parking_public_rates");
    if (error) {
      if (!/could not find|PGRST202|42883|parking_rates|parking_public_rates/i.test(error.message)) {
        setRatesError(formatParkingError(error.message));
      } else {
        setRatesError(
          "Falta la tabla de tarifas. Ejecuta supabase/parking-rates.sql en el SQL Editor."
        );
      }
      setRateForm(ratesToForm(DEFAULT_PARKING_RATES));
      return;
    }
    setRatesError(null);
    const map = {
      summer: { ...DEFAULT_PARKING_RATES.summer },
      september: { ...DEFAULT_PARKING_RATES.september },
      winter: { ...DEFAULT_PARKING_RATES.winter },
    };
    for (const row of (data || []) as ParkingRateRow[]) {
      if (
        row.season === "summer" ||
        row.season === "september" ||
        row.season === "winter"
      ) {
        map[row.season] = {
          day: row.day_eur == null ? null : Number(row.day_eur),
          week: row.week_eur == null ? null : Number(row.week_eur),
          month: row.month_eur == null ? null : Number(row.month_eur),
        };
      }
    }
    setRateForm(ratesToForm(map));
  }, [supabase, sessionEmail]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const hashParams = new URLSearchParams(hash);
    if (hashParams.get("type") === "recovery") {
      setRecoveryMode(true);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "denied") {
      setAuthError("No tienes permiso de administrador.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (sessionEmail) {
      void loadRows();
      void loadRates();
    }
  }, [sessionEmail, loadRows, loadRates]);

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
    (r) =>
      r.status === "reserved" &&
      bookingOccupiesDate(today, r.start_date, r.end_date)
  );
  const completed = rows.filter((r) => r.status === "completed");

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setResetSent(false);
    if (!supabase) {
      setAuthError("Supabase no está configurado.");
      return;
    }
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    await refreshSession();
  }

  async function onForgotPassword() {
    setAuthError(null);
    setResetSent(false);
    if (!supabase) {
      setAuthError("Supabase no está configurado.");
      return;
    }
    if (!email.trim()) {
      setAuthError("Escribe tu email y pulsa «Olvidé la contraseña».");
      return;
    }
    setAuthBusy(true);
    const redirectTo = `${window.location.origin}/parking-guardamar-centro/admin`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    setAuthBusy(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setResetSent(true);
  }

  async function onSetNewPassword(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!supabase) {
      setAuthError("Supabase no está configurado.");
      return;
    }
    if (newPassword.length < 8) {
      setAuthError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError("Las contraseñas no coinciden.");
      return;
    }
    setAuthBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setAuthBusy(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setRecoveryMode(false);
    setNewPassword("");
    setConfirmPassword("");
    window.history.replaceState({}, "", window.location.pathname);
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

  async function onSaveRates(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setRatesSaving(true);
    setRatesMessage(null);
    setRatesError(null);

    const defaults = {
      summer: {
        label_es: "Junio–agosto",
        label_en: "June–August",
        label_fr: "Juin–août",
        sort_order: 1,
      },
      september: {
        label_es: "Septiembre",
        label_en: "September",
        label_fr: "Septembre",
        sort_order: 2,
      },
      winter: {
        label_es: "Octubre–mayo",
        label_en: "October–May",
        label_fr: "Octobre–mai",
        sort_order: 3,
      },
    } as const;

    const payload = PARKING_SEASON_ORDER.map((season) => {
      const f = rateForm[season];
      const day = parseAmount(f.day);
      const week = parseAmount(f.week);
      const month = parseAmount(f.month);
      if (f.day.trim() && day == null) {
        throw new Error(`Importe día no válido (${SEASON_LABELS_ES[season]})`);
      }
      if (f.week.trim() && week == null) {
        throw new Error(`Importe semana no válido (${SEASON_LABELS_ES[season]})`);
      }
      if (f.month.trim() && month == null) {
        throw new Error(`Importe mes no válido (${SEASON_LABELS_ES[season]})`);
      }
      return {
        season,
        day_eur: day,
        week_eur: week,
        month_eur: month,
        ...defaults[season],
      };
    });

    try {
      const { error } = await supabase.rpc("parking_admin_upsert_rates", {
        p_rows: payload,
      });
      if (error) {
        setRatesError(formatParkingError(error.message));
        return;
      }
      setRatesMessage("Tarifas guardadas. La página pública las usará al recargar.");
      await loadRates();
    } catch (err) {
      setRatesError(err instanceof Error ? err.message : "No se pudieron guardar las tarifas.");
    } finally {
      setRatesSaving(false);
    }
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
          key, ejecuta <code>supabase/parking.sql</code> y{" "}
          <code>supabase/parking-admin-rls.sql</code>, crea un usuario en
          Supabase Auth y añade su email a{" "}
          <code>parking_admin_allowlist</code> y a{" "}
          <code>PARKING_ADMIN_EMAILS</code> en Vercel.
        </p>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (recoveryMode) {
    return (
      <div className="adm auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <img src={LOGO_SRC} alt="Guardamar Parking" width={48} height={48} decoding="async" />
          </div>
          <h1 className="auth-title">Nueva contraseña</h1>
          <p className="auth-sub">Elige una contraseña segura para tu cuenta de administrador.</p>
          <form className="auth-form" onSubmit={(e) => void onSetNewPassword(e)}>
            <label className="auth-label">
              Nueva contraseña
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="auth-input"
                placeholder="Mínimo 8 caracteres"
              />
            </label>
            <label className="auth-label">
              Confirmar contraseña
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="auth-input"
                placeholder="Repite la contraseña"
              />
            </label>
            {authError ? <p className="auth-err">{authError}</p> : null}
            <button type="submit" className="auth-btn" disabled={authBusy}>
              {authBusy ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (!sessionEmail) {
    return (
      <div className="adm auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <img src={LOGO_SRC} alt="Guardamar Parking" width={48} height={48} decoding="async" />
          </div>
          <h1 className="auth-title">Administración</h1>
          <p className="auth-sub">Parking Guardamar Centro · Acceso restringido</p>
          <form className="auth-form" onSubmit={(e) => void onLogin(e)}>
            <label className="auth-label">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="auth-input"
                placeholder="tu@email.com"
              />
            </label>
            <label className="auth-label">
              Contraseña
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="auth-input"
                placeholder="••••••••"
              />
            </label>
            {authError ? <p className="auth-err">{authError}</p> : null}
            {resetSent ? (
              <p className="auth-success">
                ✓ Email enviado. Abre el enlace desde este mismo navegador.
              </p>
            ) : null}
            <button type="submit" className="auth-btn" disabled={authBusy}>
              {authBusy ? "Entrando…" : "Entrar"}
            </button>
            <button
              type="button"
              className="auth-link"
              disabled={authBusy}
              onClick={() => void onForgotPassword()}
            >
              Olvidé la contraseña
            </button>
          </form>
        </div>
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

      <form className="card form" onSubmit={(e) => void onSaveRates(e)}>
        <h2>Tarifas públicas</h2>
        <p className="hint">
          Estos importes actualizan la tabla de precios, las estimaciones del
          calendario y el mensaje de WhatsApp. Deja un campo vacío para mostrar
          “—” (unidad no ofrecida).
        </p>
        <div className="rates-grid">
          {PARKING_SEASON_ORDER.map((season) => (
            <fieldset key={season} className="rates-season">
              <legend>{SEASON_LABELS_ES[season]}</legend>
              <label>
                Día (€)
                <input
                  inputMode="decimal"
                  value={rateForm[season].day}
                  onChange={(e) =>
                    setRateForm({
                      ...rateForm,
                      [season]: { ...rateForm[season], day: e.target.value },
                    })
                  }
                  placeholder="—"
                />
              </label>
              <label>
                Semana (€)
                <input
                  inputMode="decimal"
                  value={rateForm[season].week}
                  onChange={(e) =>
                    setRateForm({
                      ...rateForm,
                      [season]: { ...rateForm[season], week: e.target.value },
                    })
                  }
                  placeholder="—"
                />
              </label>
              <label>
                Mes (€)
                <input
                  inputMode="decimal"
                  value={rateForm[season].month}
                  onChange={(e) =>
                    setRateForm({
                      ...rateForm,
                      [season]: { ...rateForm[season], month: e.target.value },
                    })
                  }
                  placeholder="—"
                />
              </label>
            </fieldset>
          ))}
        </div>
        {ratesError ? <p className="err">{ratesError}</p> : null}
        {ratesMessage ? <p className="msg">{ratesMessage}</p> : null}
        <div className="actions">
          <button type="submit" disabled={ratesSaving}>
            {ratesSaving ? "Guardando…" : "Guardar tarifas"}
          </button>
        </div>
      </form>

      <form className="card form" onSubmit={(e) => void onSave(e)}>
        <h2>{form.id ? "Editar registro" : "Confirmar reserva"}</h2>
        <p className="hint">
          Puedes rellenar nombre, apellidos y DNI a mano. La foto es obligatoria;
          la lectura automática es opcional y a veces falla con fotos borrosas.
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
        {ocrBusy ? (
          <p className="hint">
            Intentando leer el DNI… Si tarda o falla, completa los campos a mano.
          </p>
        ) : null}
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
              name="customer_dni"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
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
              name="vehicle_registration"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={form.vehicle_registration}
              onChange={(e) =>
                setForm({ ...form, vehicle_registration: e.target.value })
              }
            />
          </label>
          <label>
            <span className="adm-lab">Vehículo</span>
            <input
              name="vehicle_description"
              autoComplete="off"
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
            WhatsApp Business no puede adjuntar la imagen automáticamente.
            Descárgala (o usa la vista previa) y adjúntala en el chat.
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
              Abrir WhatsApp Business del cliente
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
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => editRow(r)}
                      aria-label="Editar"
                      title="Editar"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    {r.customer_phone &&
                    (r.status === "reserved" || r.status === "completed") ? (
                      <button
                        type="button"
                        className="icon-btn wa"
                        onClick={() => {
                          setLastSaved(r);
                          void makeConfirmation(r).then(() =>
                            openCustomerWhatsApp(r)
                          );
                        }}
                        aria-label="WhatsApp Business"
                        title="WhatsApp Business"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                        >
                          <path d="M12.04 2a9.9 9.9 0 0 0-9.9 9.9c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01a9.9 9.9 0 0 0 9.9-9.9 9.86 9.86 0 0 0-9.91-9.92Zm5.76 14.07c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.29.59-.37.79-.37h.57c.18 0 .42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.3.39-.43.52-.14.14-.29.3-.12.58.16.29.73 1.2 1.56 1.94 1.08.96 1.98 1.26 2.27 1.4.28.14.45.12.61-.07.17-.2.7-.82.89-1.1.19-.29.38-.24.64-.14.26.1 1.66.78 1.95.92.28.15.47.21.54.33.07.12.07.68-.17 1.36Z" />
                        </svg>
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => void onDelete(r.id)}
                      aria-label="Eliminar"
                      title="Eliminar"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
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
  /* ── Auth screens (login / recovery) ── */
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: #f5f5f5;
  }
  .auth-card {
    width: 100%;
    max-width: 400px;
    background: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 16px;
    padding: 36px 32px 32px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  }
  .auth-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  .auth-logo img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
  }
  .auth-title {
    margin: 0 0 4px;
    font-size: 1.4rem;
    font-weight: 700;
    text-align: center;
    color: #111;
  }
  .auth-sub {
    margin: 0 0 24px;
    font-size: 0.88rem;
    color: #666;
    text-align: center;
  }
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .auth-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
  }
  .auth-input {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    font-size: 1rem;
    border: 1.5px solid #d1d1d1;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .auth-input:focus { border-color: #111; }
  .auth-err {
    margin: 0;
    padding: 10px 12px;
    background: #fff3f3;
    border: 1px solid #f5c6c6;
    border-radius: 8px;
    color: #8b1e1e;
    font-size: 0.85rem;
  }
  .auth-success {
    margin: 0;
    padding: 10px 12px;
    background: #f0faf4;
    border: 1px solid #b2dfcc;
    border-radius: 8px;
    color: #1b5e34;
    font-size: 0.85rem;
  }
  .auth-btn {
    width: 100%;
    min-height: 46px;
    background: #111;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 650;
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
    margin-top: 4px;
  }
  .auth-btn:hover:not(:disabled) { background: #333; }
  .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .auth-link {
    background: none;
    border: 0;
    color: #555;
    font-size: 0.85rem;
    text-align: center;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }
  .auth-link:hover { color: #111; }
  .auth-link:disabled { opacity: 0.5; cursor: not-allowed; }
  /* ── End auth screens ── */
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
  .rates-grid { display: grid; gap: 12px; }
  .rates-season {
    margin: 0;
    padding: 10px 12px;
    border: 1px solid #e6e6e6;
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .rates-season legend { padding: 0 4px; font-weight: 700; }
  @media (max-width: 560px) {
    .rates-season { grid-template-columns: 1fr; }
  }
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
  .wa { background: #25d366; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .preview { width: 100%; max-width: 360px; border-radius: 10px; border: 1px solid #e6e6e6; margin: 8px 0 12px; }
  .dni-preview { width: 100%; max-width: 280px; border-radius: 10px; border: 1px solid #e6e6e6; }
  .linkish { background: none; border: 0; color: #0b6e4f; text-decoration: underline; cursor: pointer; padding: 0; min-height: auto; font: inherit; font-weight: 650; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  .ops { display: flex; flex-wrap: nowrap; gap: 6px; align-items: center; }
  .ops .icon-btn {
    min-height: 36px;
    min-width: 36px;
    width: 36px;
    height: 36px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }
  .ops .icon-btn svg { display: block; }
`;
