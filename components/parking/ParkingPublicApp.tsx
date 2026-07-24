"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getParkingSupabase, parkingSupabaseConfigured } from "@/lib/parking/supabase";
import {
  addDays,
  buildWhatsAppMessage,
  formatSpanishDate,
  isDateUnavailable,
  parseISODate,
  rangeContainsUnavailable,
  toISODate,
  whatsAppHref,
  countInclusiveDays,
  type ParkingUnavailableRange,
} from "@/lib/parking/types";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function monthLabel(date: Date): string {
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function buildMonthCells(view: Date): (Date | null)[] {
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  // Monday = 0 … Sunday = 6
  const mondayIndex = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < mondayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ParkingPublicApp() {
  const today = useMemo(() => startOfToday(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [ranges, setRanges] = useState<ParkingUnavailableRange[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [configured] = useState(() => parkingSupabaseConfigured());

  const [arrival, setArrival] = useState<string | null>(null);
  const [departure, setDeparture] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [comments, setComments] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!configured) {
      setRanges([]);
      setLoadError(null);
      return;
    }
    const supabase = getParkingSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.rpc("parking_unavailable_ranges");
    if (error) {
      // Fallback to view if RPC is not yet deployed
      const fallback = await supabase
        .from("parking_public_availability")
        .select("id, start_date, end_date, availability");
      if (fallback.error) {
        setLoadError(
          "No se ha podido cargar la disponibilidad. Inténtalo de nuevo más tarde."
        );
        setRanges([]);
        return;
      }
      setLoadError(null);
      setRanges((fallback.data || []) as ParkingUnavailableRange[]);
      return;
    }
    setLoadError(null);
    setRanges((data || []) as ParkingUnavailableRange[]);
  }, [configured]);

  useEffect(() => {
    void load();
  }, [load]);

  const cells = useMemo(() => buildMonthCells(view), [view]);

  const previewEnd = departure || (arrival && hover ? hover : null);

  function dayState(iso: string): "past" | "unavailable" | "available" | "selected" | "inrange" {
    const d = parseISODate(iso);
    if (d < today) return "past";
    if (isDateUnavailable(iso, ranges)) return "unavailable";
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

  function onSelectDay(iso: string) {
    const state = dayState(iso);
    if (state === "past" || state === "unavailable") return;

    if (!arrival || (arrival && departure)) {
      setArrival(iso);
      setDeparture(null);
      setHover(null);
      return;
    }

    // second click
    let start = arrival;
    let end = iso;
    if (end < start) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    if (rangeContainsUnavailable(start, end, ranges)) {
      setFormError("El intervalo incluye fechas no disponibles. Elige otras fechas.");
      setArrival(iso);
      setDeparture(null);
      return;
    }
    setFormError(null);
    setArrival(start);
    setDeparture(end);
  }

  function clearDates() {
    setArrival(null);
    setDeparture(null);
    setHover(null);
  }

  function openWhatsApp() {
    setFormError(null);
    if (!arrival || !departure) {
      setFormError("Selecciona las fechas de llegada y salida.");
      return;
    }
    if (!name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (rangeContainsUnavailable(arrival, departure, ranges)) {
      setFormError("El intervalo incluye fechas no disponibles.");
      return;
    }
    const message = buildWhatsAppMessage({
      arrival,
      departure,
      name: name.trim(),
      registration,
      vehicle,
      arrivalTime,
      departureTime,
      comments,
    });
    window.open(whatsAppHref(message), "_blank", "noopener,noreferrer");
  }

  const daysCount =
    arrival && departure ? countInclusiveDays(arrival, departure) : 0;

  return (
    <div className="pk">
      <header className="pk-header">
        <p className="pk-brand">Parking Guardamar Centro</p>
        <h1>Disponibilidad de la plaza</h1>
        <p>
          Consulta las fechas disponibles y envíame una solicitud por WhatsApp. La
          selección de fechas no constituye una reserva hasta que sea confirmada.
        </p>
      </header>

      {!configured ? (
        <p className="pk-banner" role="status">
          Calendario en modo local: falta configurar Supabase. Todas las fechas
          futuras aparecen como disponibles hasta que se conecte la base de datos.
        </p>
      ) : null}
      {loadError ? (
        <p className="pk-banner pk-banner-error" role="alert">
          {loadError}
        </p>
      ) : null}

      <section className="pk-legend" aria-label="Leyenda">
        <span>
          <i className="swatch available" /> Disponible
        </span>
        <span>
          <i className="swatch unavailable" /> No disponible
        </span>
        <span>
          <i className="swatch past" /> Pasado
        </span>
        <span>
          <i className="swatch selected" /> Seleccionado
        </span>
      </section>

      <section className="pk-cal" aria-label="Calendario">
        <div className="pk-cal-nav">
          <button
            type="button"
            className="pk-nav-btn"
            aria-label="Mes anterior"
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
            }
          >
            ‹
          </button>
          <h2>{monthLabel(view)}</h2>
          <button
            type="button"
            className="pk-nav-btn"
            aria-label="Mes siguiente"
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
            }
          >
            ›
          </button>
        </div>

        <div className="pk-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="pk-grid">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`e-${i}`} className="pk-cell empty" />;
            const iso = toISODate(cell);
            const state = dayState(iso);
            const disabled = state === "past" || state === "unavailable";
            const label =
              state === "past"
                ? "Pasado"
                : state === "unavailable"
                  ? "No disponible"
                  : state === "selected" || state === "inrange"
                    ? "Seleccionado"
                    : "Disponible";
            return (
              <button
                key={iso}
                type="button"
                className={`pk-cell day ${state}`}
                disabled={disabled}
                aria-label={`${cell.getDate()} de ${monthLabel(view)} — ${label}`}
                aria-pressed={state === "selected" || state === "inrange"}
                onMouseEnter={() => {
                  if (arrival && !departure && !disabled) setHover(iso);
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectDay(iso)}
              >
                <span className="num">{cell.getDate()}</span>
                <span className="sr-only">{label}</span>
              </button>
            );
          })}
        </div>

        {(arrival || departure) && (
          <button type="button" className="pk-clear" onClick={clearDates}>
            Borrar fechas
          </button>
        )}
      </section>

      {arrival && departure ? (
        <p className="pk-summary" role="status">
          Fechas seleccionadas: del {formatSpanishDate(arrival)} al{" "}
          {formatSpanishDate(departure)}.
          <br />
          Duración: {daysCount} {daysCount === 1 ? "día" : "días"}.
        </p>
      ) : arrival ? (
        <p className="pk-summary">Elige la fecha de salida.</p>
      ) : (
        <p className="pk-summary">Elige la fecha de llegada.</p>
      )}

      <form
        className="pk-form"
        onSubmit={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
      >
        <label>
          Nombre <span className="req">*</span>
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>
        <label>
          Matrícula del vehículo
          <input
            name="registration"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="Opcional"
          />
        </label>
        <label>
          Modelo o tipo de vehículo
          <input
            name="vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="Opcional"
          />
        </label>
        <div className="pk-row">
          <label>
            Hora aproximada de llegada
            <input
              type="time"
              name="arrivalTime"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />
          </label>
          <label>
            Hora aproximada de salida
            <input
              type="time"
              name="departureTime"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />
          </label>
        </div>
        <label>
          Comentarios
          <textarea
            name="comments"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Opcional"
          />
        </label>

        {formError ? (
          <p className="pk-form-error" role="alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" className="pk-wa">
          Consultar por WhatsApp
        </button>
        <p className="pk-note">
          Se abrirá WhatsApp con tu consulta. No confirma la reserva hasta que yo
          te responda.
        </p>
      </form>

      <style jsx>{`
        .pk {
          --ink: #1a1a1a;
          --muted: #5a5a5a;
          --line: #e6e6e6;
          --bg: #fafaf8;
          --card: #ffffff;
          --available: #d8f0df;
          --available-ink: #1b5e34;
          --unavailable: #f0d9d9;
          --unavailable-ink: #7a2e2e;
          --past: #ececec;
          --past-ink: #8a8a8a;
          --selected: #b7e4c7;
          --wa: #128c7e;
          --wa-hover: #0e6e63;
          max-width: 520px;
          margin: 0 auto;
          padding: 20px 16px 48px;
          color: var(--ink);
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }
        .pk-brand {
          margin: 0 0 6px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .pk-header h1 {
          margin: 0 0 10px;
          font-size: 1.55rem;
          line-height: 1.2;
          font-weight: 750;
        }
        .pk-header p {
          margin: 0;
          color: var(--muted);
          line-height: 1.55;
          font-size: 0.98rem;
        }
        .pk-banner {
          margin: 16px 0 0;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fff6d6;
          border: 1px solid #f0e0a0;
          font-size: 0.9rem;
          line-height: 1.45;
        }
        .pk-banner-error {
          background: #fde8e8;
          border-color: #f0bcbc;
        }
        .pk-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 14px;
          margin: 18px 0 14px;
          font-size: 0.82rem;
          color: var(--muted);
        }
        .pk-legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .swatch {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          display: inline-block;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .swatch.available {
          background: var(--available);
        }
        .swatch.unavailable {
          background: var(--unavailable);
        }
        .swatch.past {
          background: var(--past);
        }
        .swatch.selected {
          background: var(--selected);
          outline: 2px solid var(--available-ink);
          outline-offset: 0;
        }
        .pk-cal {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px;
        }
        .pk-cal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
        }
        .pk-cal-nav h2 {
          margin: 0;
          font-size: 1.05rem;
          text-transform: capitalize;
          font-weight: 700;
        }
        .pk-nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--bg);
          font-size: 1.4rem;
          cursor: pointer;
        }
        .pk-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 6px;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 650;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .pk-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .pk-cell {
          min-height: 44px;
          border-radius: 10px;
          border: 0;
          background: transparent;
        }
        .pk-cell.day {
          cursor: pointer;
          display: grid;
          place-items: center;
          font-weight: 600;
          font-size: 0.95rem;
          position: relative;
        }
        .pk-cell.available {
          background: var(--available);
          color: var(--available-ink);
        }
        .pk-cell.unavailable {
          background: var(--unavailable);
          color: var(--unavailable-ink);
          cursor: not-allowed;
          opacity: 0.95;
        }
        .pk-cell.past {
          background: var(--past);
          color: var(--past-ink);
          cursor: not-allowed;
        }
        .pk-cell.selected,
        .pk-cell.inrange {
          background: var(--selected);
          color: var(--available-ink);
          box-shadow: inset 0 0 0 2px var(--available-ink);
        }
        .pk-cell:disabled {
          opacity: 1;
        }
        .pk-clear {
          margin-top: 12px;
          width: 100%;
          min-height: 44px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--bg);
          cursor: pointer;
          font-size: 0.95rem;
        }
        .pk-summary {
          margin: 16px 0;
          padding: 12px 14px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 12px;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        .pk-form {
          display: grid;
          gap: 12px;
        }
        .pk-form label {
          display: grid;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .pk-form input,
        .pk-form textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 44px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font: inherit;
          font-weight: 400;
          background: #fff;
        }
        .pk-form textarea {
          min-height: 88px;
          resize: vertical;
        }
        .pk-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 380px) {
          .pk-row {
            grid-template-columns: 1fr;
          }
        }
        .req {
          color: #b42318;
        }
        .pk-form-error {
          margin: 0;
          color: #7a2e2e;
          font-size: 0.9rem;
        }
        .pk-wa {
          min-height: 52px;
          border: 0;
          border-radius: 12px;
          background: var(--wa);
          color: #fff;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
        }
        .pk-wa:hover {
          background: var(--wa-hover);
        }
        .pk-note {
          margin: 0;
          font-size: 0.82rem;
          color: var(--muted);
          line-height: 1.45;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
      `}</style>
    </div>
  );
}

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
