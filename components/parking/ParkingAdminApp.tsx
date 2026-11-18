"use client";

import {
  Fragment,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import {
  buildConfirmationImage,
  customerWhatsAppHref,
  downloadBlob,
} from "@/lib/parking/confirmationImage";
import { PARKING_BADGE_SRC } from "@/lib/parking/constants";
import { PARKING_ORIGIN, PARKING_PATH } from "@/lib/parking/seo";
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
  statusOccupiesSpot,
  type ParkingBooking,
  type ParkingBookingStatus,
} from "@/lib/parking/types";

const STATUS_OPTIONS: ParkingBookingStatus[] = [
  "reserved",
  "completed",
  "blocked",
  "cancelled",
  "refunded",
  "eliminated",
];

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
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_description: "",
  price_eur: "",
  private_notes: "",
};

const SCHEMA_MIGRATE_HINT =
  "Falta una columna en Supabase. Abre SQL Editor del proyecto y ejecuta supabase/parking-booking-fields.sql y/o supabase/parking-vehicle-brand-model.sql (incluye NOTIFY pgrst).";

function formatParkingError(message: string): string {
  if (
    /customer_dni|customer_surnames|customer_dni_image_path|vehicle_brand|vehicle_model|schema cache/i.test(
      message
    )
  ) {
    return `${message}\n\n${SCHEMA_MIGRATE_HINT}`;
  }
  return message;
}

function composeVehicleDescription(brand: string, model: string): string | null {
  const parts = [brand.trim(), model.trim()].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function bookingToForm(row: ParkingBooking) {
  return {
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
    vehicle_brand: row.vehicle_brand || "",
    vehicle_model: row.vehicle_model || "",
    vehicle_description: row.vehicle_description || "",
    price_eur: row.price_eur != null ? String(row.price_eur) : "",
    private_notes: row.private_notes || "",
  };
}

export default function ParkingAdminApp() {
  const configured = parkingSupabaseConfigured();
  const supabase = getParkingSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [ticketViewerOpen, setTicketViewerOpen] = useState(false);
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [dniLocalPreview, setDniLocalPreview] = useState<string | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [rateForm, setRateForm] = useState<RateFormRow>(() =>
    ratesToForm(DEFAULT_PARKING_RATES)
  );
  const [ratesSaving, setRatesSaving] = useState(false);
  const [ratesMessage, setRatesMessage] = useState<string | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

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
    const list = (data || []) as ParkingBooking[];
    const n = new Date();
    const todayIso = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    // Checkout day (end_date) still counts as the stay; complete the day after.
    const due = list.filter(
      (r) => r.status === "reserved" && r.end_date < todayIso
    );
    if (due.length > 0) {
      const ids = due.map((r) => r.id);
      const { error: autoErr } = await supabase
        .from("parking_bookings")
        .update({ status: "completed" })
        .in("id", ids)
        .eq("status", "reserved");
      if (!autoErr) {
        for (const r of list) {
          if (ids.includes(r.id)) r.status = "completed";
        }
      }
    }
    setLoadError(null);
    setRows(list);
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
    const params = new URLSearchParams(window.location.search);
    if (hashParams.get("type") === "recovery" || params.get("type") === "recovery") {
      setRecoveryMode(true);
    }
    if (params.get("admin") === "denied") {
      setAuthError("No tienes permiso de administrador.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

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
    // Always send users to the production admin path so the email link opens
    // the “new password” screen (not the site homepage / Site URL fallback).
    const redirectTo = `${PARKING_ORIGIN}${PARKING_PATH}/admin`;
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
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("type");
    url.searchParams.delete("code");
    const search = url.searchParams.toString();
    window.history.replaceState(
      {},
      "",
      url.pathname + (search ? `?${search}` : "")
    );
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
    setForm(bookingToForm(row));
    setDniFile(null);
    if (dniLocalPreview) URL.revokeObjectURL(dniLocalPreview);
    setDniLocalPreview(null);
    setMessage(null);
    setLastSaved(row);
    setDetailId(null);
    window.requestAnimationFrame(() => {
      document
        .getElementById("parking-booking-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
    if (!statusOccupiesSpot(status)) return null;
    const clash = rows.find(
      (r) =>
        r.id !== id &&
        statusOccupiesSpot(r.status) &&
        rangesOverlap(start, end, r.start_date, r.end_date)
    );
    if (clash) {
      return `Las fechas se solapan con un registro existente (${STATUS_LABELS_ES[clash.status]}: ${clash.start_date} – ${clash.end_date}).`;
    }
    return null;
  }

  function canBuildConfirmation(booking: {
    customer_name: string | null;
    customer_surnames: string | null;
    customer_dni: string | null;
    customer_phone: string | null;
    price_eur: number | null;
  }) {
    return Boolean(
      booking.customer_name &&
        booking.customer_surnames &&
        booking.customer_dni &&
        booking.customer_phone &&
        booking.price_eur != null
    );
  }

  async function buildConfirmationBlob(booking: {
    customer_name: string | null;
    customer_surnames: string | null;
    customer_dni: string | null;
    customer_phone: string | null;
    start_date: string;
    end_date: string;
    price_eur: number | null;
  }) {
    if (!canBuildConfirmation(booking)) return null;
    return buildConfirmationImage({
      name: booking.customer_name!,
      surnames: booking.customer_surnames!,
      dni: booking.customer_dni!,
      phone: booking.customer_phone!,
      startDate: booking.start_date,
      endDate: booking.end_date,
      priceEur: Number(booking.price_eur),
    });
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
    const blob = await buildConfirmationBlob(booking);
    if (!blob) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
    downloadBlob(
      blob,
      `confirmacion-parking-${booking.start_date}-${booking.customer_dni}.png`
    );
  }

  /** Show the booking ticket / comprobante inline (blob: URLs cannot be opened as new tabs reliably). */
  async function viewConfirmationTicket(booking: ParkingBooking) {
    try {
      const blob = await buildConfirmationBlob(booking);
      if (!blob) {
        setMessage(
          "Faltan datos (nombre, apellidos, DNI, teléfono o importe) para ver el comprobante."
        );
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setLastSaved(booking);
      setTicketViewerOpen(true);
    } catch {
      setMessage("No se pudo generar el comprobante.");
    }
  }

  function closeTicketViewer() {
    setTicketViewerOpen(false);
  }

  function downloadCurrentTicket() {
    if (!previewUrl || !lastSaved) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `confirmacion-parking-${lastSaved.start_date}-${lastSaved.customer_dni || "ticket"}.png`;
    a.click();
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

    const bookingId = form.id || crypto.randomUUID();
    let dniPath = form.customer_dni_image_path || null;

    setSaving(true);
    try {
      if (dniFile) {
        dniPath = await uploadDniForBooking(bookingId, dniFile);
      }

      const brand = form.vehicle_brand.trim();
      const model = form.vehicle_model.trim();
      const composed = composeVehicleDescription(brand, model);
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
        vehicle_brand: brand || null,
        vehicle_model: model || null,
        vehicle_description:
          form.vehicle_description.trim() || composed || null,
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
      setForm(bookingToForm(saved));
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

  /** Soft status change — rows are never hard-deleted from admin. */
  async function updateBookingStatus(
    id: string,
    status: ParkingBookingStatus,
    opts?: { silent?: boolean }
  ) {
    if (!supabase) return;
    const row = rows.find((r) => r.id === id);
    if (!row || row.status === status) return;

    if (statusOccupiesSpot(status)) {
      const clash = validateOverlap(row.start_date, row.end_date, status, id);
      if (clash) {
        setMessage(clash);
        return;
      }
    }

    const { data, error } = await supabase
      .from("parking_bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      setMessage(formatParkingError(error.message));
      return;
    }
    const saved = data as ParkingBooking;
    if (!opts?.silent) {
      setMessage(`Estado actualizado: ${STATUS_LABELS_ES[saved.status]}.`);
    }
    if (form.id === id) setForm(bookingToForm(saved));
    if (lastSaved?.id === id) setLastSaved(saved);
    await loadRows();
  }

  async function onEliminateBooking(id: string) {
    if (!supabase) return;
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    if (row.status === "eliminated") {
      setMessage("Este registro ya está eliminado (sigue en el historial).");
      return;
    }
    if (
      !window.confirm(
        "¿Eliminar este registro del uso activo?\n\nNo se borra de la base de datos: queda como Eliminado (tachado en el registro) y conserva DNI, vehículo e historial. Puedes cambiar el estado después si hace falta."
      )
    ) {
      return;
    }
    await updateBookingStatus(id, "eliminated");
    setMessage(
      "Registro eliminado del uso activo. Sigue visible en el historial (tachado)."
    );
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
            <label className="auth-label" htmlFor="parking-new-password">
              Nueva contraseña
              <div className="auth-password-field">
                <input
                  id="parking-new-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="auth-input"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={
                    showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showNewPassword}
                  aria-controls="parking-new-password"
                  onClick={() => setShowNewPassword((v) => !v)}
                >
                  {showNewPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>
            <label className="auth-label" htmlFor="parking-confirm-password">
              Confirmar contraseña
              <div className="auth-password-field">
                <input
                  id="parking-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="auth-input"
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  aria-pressed={showConfirmPassword}
                  aria-controls="parking-confirm-password"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
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
            <label className="auth-label" htmlFor="parking-admin-password">
              Contraseña
              <div className="auth-password-field">
                <input
                  id="parking-admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="auth-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                  aria-controls="parking-admin-password"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>
            {authError ? <p className="auth-err">{authError}</p> : null}
            {resetSent ? (
              <p className="auth-success">
                ✓ Email enviado. Abre «Reset password» — debe llevarte a esta
                página de administración para elegir la nueva contraseña (no a
                la home del sitio).
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

      <form
        id="parking-booking-form"
        className="card form"
        onSubmit={(e) => void onSave(e)}
      >
        <h2>{form.id ? "Editar registro" : "Confirmar reserva"}</h2>
        <p className="hint">
          Puedes rellenar nombre, apellidos y DNI a mano. La foto del DNI es
          opcional; si la subes, la lectura automática a veces falla con fotos
          borrosas.
        </p>
        <label>
          <span className="adm-lab">Foto del DNI</span>
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
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS_ES[s]}
                </option>
              ))}
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
        <div className="row row-3">
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
            <span className="adm-lab">Marca</span>
            <input
              name="vehicle_brand"
              autoComplete="off"
              value={form.vehicle_brand}
              onChange={(e) =>
                setForm({ ...form, vehicle_brand: e.target.value })
              }
              placeholder="Mercedes"
            />
          </label>
          <label>
            <span className="adm-lab">Modelo</span>
            <input
              name="vehicle_model"
              autoComplete="off"
              value={form.vehicle_model}
              onChange={(e) =>
                setForm({ ...form, vehicle_model: e.target.value })
              }
              placeholder="Classe 580"
            />
          </label>
        </div>
        <label>
          <span className="adm-lab">Notas del vehículo</span>
          <input
            name="vehicle_description"
            autoComplete="off"
            value={form.vehicle_description}
            onChange={(e) =>
              setForm({ ...form, vehicle_description: e.target.value })
            }
            placeholder="Opcional — se rellena con marca + modelo si lo dejas vacío"
          />
        </label>
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
        <p className="hint">
          Vista compacta: fechas, estado, nombre, matrícula, marca y modelo.
          Pulsa la i para ver el resto y las acciones. Los registros no se
          borran: cambia el estado o usa el icono de papelera (Eliminado,
          tachado en el historial). Las reservas pagadas pasan a Finalizado
          solas cuando pasa la fecha de salida.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Matrícula</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const open = detailId === r.id;
                const rowClass = [
                  open ? "row-open" : null,
                  r.status === "eliminated"
                    ? "row-eliminated"
                    : r.status === "cancelled"
                      ? "row-cancelled"
                      : r.status === "refunded"
                        ? "row-refunded"
                        : null,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <Fragment key={r.id}>
                    <tr className={rowClass || undefined}>
                      <td>
                        {formatSpanishDate(r.start_date)} →{" "}
                        {formatSpanishDate(r.end_date)}
                      </td>
                      <td>
                        <span className={`status-pill status-${r.status}`}>
                          {STATUS_LABELS_ES[r.status]}
                        </span>
                      </td>
                      <td>{r.customer_name || "—"}</td>
                      <td>{r.vehicle_registration || "—"}</td>
                      <td>{r.vehicle_brand || "—"}</td>
                      <td>{r.vehicle_model || "—"}</td>
                      <td className="ops">
                        <button
                          type="button"
                          className={`icon-btn${open ? " active" : ""}`}
                          onClick={() =>
                            setDetailId((id) => (id === r.id ? null : r.id))
                          }
                          aria-expanded={open}
                          aria-label={open ? "Ocultar detalles" : "Más detalles"}
                          title={open ? "Ocultar detalles" : "Más detalles"}
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
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                        </button>
                        {r.status !== "eliminated" ? (
                          <button
                            type="button"
                            className="icon-btn danger-icon"
                            onClick={() => void onEliminateBooking(r.id)}
                            aria-label="Eliminar (conservar en historial)"
                            title="Eliminar (conservar en historial)"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                    {open ? (
                      <tr className="detail-row">
                        <td colSpan={7}>
                          <div className="detail-panel">
                            <dl className="detail-grid">
                              <div>
                                <dt>Nombre completo</dt>
                                <dd>
                                  {[r.customer_name, r.customer_surnames]
                                    .filter(Boolean)
                                    .join(" ") || "—"}
                                </dd>
                              </div>
                              <div>
                                <dt>DNI / NIE</dt>
                                <dd>{r.customer_dni || "—"}</dd>
                              </div>
                              <div>
                                <dt>Foto DNI</dt>
                                <dd>
                                  {r.customer_dni_image_path
                                    ? "Subida"
                                    : "Sin foto"}
                                </dd>
                              </div>
                              <div>
                                <dt>Teléfono</dt>
                                <dd>{r.customer_phone || "—"}</dd>
                              </div>
                              <div>
                                <dt>Importe</dt>
                                <dd>
                                  {r.price_eur != null
                                    ? `${r.price_eur} €`
                                    : "—"}
                                </dd>
                              </div>
                              <div>
                                <dt>Notas vehículo</dt>
                                <dd>{r.vehicle_description || "—"}</dd>
                              </div>
                              <div className="detail-wide">
                                <dt>Notas privadas</dt>
                                <dd>{r.private_notes || "—"}</dd>
                              </div>
                            </dl>
                            <div className="detail-actions">
                              <button
                                type="button"
                                className="ghost action-btn"
                                onClick={() => editRow(r)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="ghost action-btn"
                                disabled={!r.customer_dni_image_path}
                                onClick={() => {
                                  if (!r.customer_dni_image_path) return;
                                  void openDniImage(r.customer_dni_image_path);
                                }}
                              >
                                Ver DNI
                              </button>
                              <button
                                type="button"
                                className="ghost action-btn"
                                disabled={!canBuildConfirmation(r)}
                                onClick={() => void viewConfirmationTicket(r)}
                              >
                                Ver comprobante
                              </button>
                              {r.customer_phone &&
                              (r.status === "reserved" ||
                                r.status === "completed") ? (
                                <button
                                  type="button"
                                  className="wa action-btn"
                                  onClick={() => {
                                    setLastSaved(r);
                                    void (async () => {
                                      if (!canBuildConfirmation(r)) {
                                        setMessage(
                                          "Faltan datos para el comprobante; se abre WhatsApp sin imagen."
                                        );
                                        openCustomerWhatsApp(r);
                                        return;
                                      }
                                      await makeConfirmation(r);
                                      openCustomerWhatsApp(r);
                                    })();
                                  }}
                                >
                                  WhatsApp
                                </button>
                              ) : null}
                              <label className="status-menu">
                                <span className="sr-only">Cambiar estado</span>
                                <select
                                  className="status-select"
                                  value={r.status}
                                  aria-label="Cambiar estado"
                                  onChange={(e) => {
                                    const next = e.target
                                      .value as ParkingBookingStatus;
                                    if (next === "eliminated") {
                                      void onEliminateBooking(r.id);
                                      return;
                                    }
                                    void updateBookingStatus(r.id, next);
                                  }}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                      {STATUS_LABELS_ES[s]}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              {r.status !== "eliminated" ? (
                                <button
                                  type="button"
                                  className="danger action-btn"
                                  onClick={() => void onEliminateBooking(r.id)}
                                >
                                  Eliminar
                                </button>
                              ) : (
                                <span className="muted">Ya eliminado</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="muted">Sin registros.</p> : null}
        </div>
      </section>

      {ticketViewerOpen && previewUrl ? (
        <div
          className="ticket-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Comprobante de reserva"
          onClick={closeTicketViewer}
        >
          <div
            className="ticket-viewer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ticket-viewer-top">
              <h2>Comprobante</h2>
              <button
                type="button"
                className="ghost action-btn"
                onClick={closeTicketViewer}
              >
                Cerrar
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Comprobante de reserva"
              className="ticket-viewer-img"
            />
            <div className="actions">
              <button type="button" onClick={downloadCurrentTicket}>
                Descargar
              </button>
              <button
                type="button"
                className="ghost"
                onClick={closeTicketViewer}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
  .auth-password-field {
    position: relative;
    display: grid;
  }
  .auth-password-field .auth-input {
    padding-right: 44px;
  }
  .auth-password-toggle {
    position: absolute;
    top: 50%;
    right: 6px;
    transform: translateY(-50%);
    min-height: 36px;
    min-width: 36px;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #555;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .auth-password-toggle:hover,
  .auth-password-toggle:focus-visible {
    color: #111;
    background: #f0f0f0;
    outline: none;
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
  .row-3 { grid-template-columns: 1fr 1fr 1fr; }
  @media (max-width: 720px) { .row-3 { grid-template-columns: 1fr; } }
  @media (max-width: 560px) { .row { grid-template-columns: 1fr; } .top { flex-direction: column; } }
  .row-open td { border-bottom-color: transparent; }
  .detail-row td {
    background: #f7f7f7;
    border-bottom: 1px solid #e6e6e6;
    padding: 0 6px 12px;
  }
  .detail-panel {
    display: grid;
    gap: 12px;
    padding: 10px 8px 4px;
    border-radius: 10px;
  }
  .detail-grid {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px 14px;
  }
  .detail-grid dt {
    margin: 0;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #666;
    font-weight: 650;
  }
  .detail-grid dd {
    margin: 2px 0 0;
    font-weight: 500;
    word-break: break-word;
  }
  .detail-wide { grid-column: 1 / -1; }
  .detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 2px;
  }
  .action-btn {
    min-height: 36px;
    padding: 0 12px;
    font-size: 0.82rem;
  }
  .action-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .status-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 650;
    line-height: 1.4;
    white-space: nowrap;
  }
  .status-reserved { background: #e7f6ee; color: #0b6e4f; }
  .status-completed { background: #e8eef8; color: #2a4a7a; }
  .status-blocked { background: #f3efe6; color: #7a5b20; }
  .status-cancelled { background: #f8e8e8; color: #8b1e1e; }
  .status-refunded { background: #f3e9f8; color: #6b3a8a; }
  .status-eliminated { background: #ececec; color: #666; text-decoration: line-through; }
  .row-cancelled td { color: #7a3a3a; }
  .row-refunded td { color: #5c3a70; }
  .row-eliminated td {
    color: #888;
    text-decoration: line-through;
  }
  .row-eliminated .status-pill,
  .row-eliminated .ops {
    text-decoration: none;
  }
  .status-menu { display: inline-flex; margin: 0; }
  .status-select {
    min-height: 36px;
    border-radius: 10px;
    border: 1px solid #ccc;
    padding: 0 10px;
    background: #fff;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 650;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  button { min-height: 44px; border: 0; border-radius: 10px; background: #111; color: #fff; font-weight: 650; cursor: pointer; padding: 0 14px; }
  .ghost { background: #fff; color: #111; border: 1px solid #ccc; }
  .danger { background: #8b1e1e; }
  .wa { background: #25d366; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .preview { width: 100%; max-width: 360px; border-radius: 10px; border: 1px solid #e6e6e6; margin: 8px 0 12px; }
  .dni-preview { width: 100%; max-width: 280px; border-radius: 10px; border: 1px solid #e6e6e6; }
  .ticket-viewer {
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .ticket-viewer-panel {
    background: #fff;
    border-radius: 14px;
    padding: 16px;
    max-width: min(420px, 100%);
    width: 100%;
    max-height: calc(100vh - 32px);
    overflow: auto;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
  }
  .ticket-viewer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .ticket-viewer-top h2 {
    margin: 0;
    font-size: 1.05rem;
  }
  .ticket-viewer-img {
    width: 100%;
    border-radius: 10px;
    border: 1px solid #e6e6e6;
    display: block;
    margin-bottom: 12px;
  }
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
    background: #fff;
    color: #005288;
    border: 1px solid #c9d7e3;
  }
  .ops .icon-btn:hover,
  .ops .icon-btn:focus-visible {
    background: #e8f2f8;
    border-color: #005288;
  }
  .ops .icon-btn.active {
    background: #005288;
    color: #fff;
    border-color: #005288;
  }
  .ops .danger-icon {
    color: #e31c23;
    background: #fff;
    border-color: #f3c2c4;
  }
  .ops .danger-icon:hover,
  .ops .danger-icon:focus-visible {
    background: #e31c23;
    color: #fff;
    border-color: #e31c23;
  }
  .ops .icon-btn svg { display: block; }

  @media (prefers-color-scheme: dark) {
    .adm { color: var(--foreground); }
    .muted, .hint, .detail-grid dt { color: var(--foreground-muted); }
    .card, .rates-season, .auth-card {
      background: #111622;
      border-color: var(--border);
    }
    .auth-page { background: var(--background); }
    .auth-title, .auth-label { color: var(--foreground); }
    .auth-sub, .auth-link { color: var(--foreground-muted); }
    .auth-link:hover { color: var(--foreground); }
    .auth-input, input, select, textarea, .status-select {
      background: var(--background);
      color: var(--foreground);
      border-color: var(--border);
    }
    .auth-input:focus { border-color: #9fd0f0; }
    .auth-password-toggle { color: var(--foreground-muted); }
    .auth-password-toggle:hover,
    .auth-password-toggle:focus-visible {
      color: var(--foreground);
      background: #161922;
    }
    button {
      background: var(--primary);
      color: var(--primary-contrast);
    }
    .auth-btn:hover:not(:disabled) { background: #fff; }
    .ghost {
      background: transparent;
      color: var(--foreground);
      border-color: var(--border);
    }
    th, td { border-bottom-color: var(--border); }
    .detail-row td {
      background: #161922;
      border-bottom-color: var(--border);
    }
    .row-cancelled td { color: #f0b4b4; }
    .row-refunded td { color: #e0c2ee; }
    .row-eliminated td { color: #a3a3a3; }
    .linkish { color: #8fd4ae; }
    .ops .icon-btn {
      background: transparent;
      color: #9fd0f0;
      border-color: color-mix(in srgb, #9fd0f0 55%, var(--border));
    }
    .ops .icon-btn:hover,
    .ops .icon-btn:focus-visible {
      background: color-mix(in srgb, #9fd0f0 16%, transparent);
      border-color: #9fd0f0;
    }
    .ops .icon-btn.active {
      background: #9fd0f0;
      color: #0b1c2c;
      border-color: #9fd0f0;
    }
    .ops .danger-icon {
      color: #ff8d8d;
      background: transparent;
      border-color: color-mix(in srgb, #ff8d8d 55%, var(--border));
    }
    .ops .danger-icon:hover,
    .ops .danger-icon:focus-visible {
      background: #e31c23;
      color: #fff;
      border-color: #e31c23;
    }
  }
`;
