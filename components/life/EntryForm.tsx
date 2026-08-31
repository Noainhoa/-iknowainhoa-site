"use client";

import { FormEvent, useMemo, useState } from "react";
import LocationPicker from "@/components/life/location/LocationPicker";
import { normalizeLifeDate, LIFE_PRECISION_LABELS, lifeDateToFormValue } from "@/lib/life/dates";
import { lifeLocationToSelection } from "@/lib/life/location-types";
import type { LifeLocationSelection } from "@/lib/life/location-types";
import { validateLifeEntryInput } from "@/lib/life/validation";
import type { LifeDatePrecision, LifeEntry, LifeEntryStatus, LifeEntryType } from "@/lib/life/types";
import { LIFE_ENTRY_STATUS_LABELS } from "@/lib/life/entry-status";

export type EntryFormPayload = {
  title: string;
  entryType: LifeEntryType;
  startDate: string;
  startPrecision: LifeDatePrecision;
  endDate: string | null;
  endPrecision: LifeDatePrecision | null;
  isOngoing: boolean;
  notes: string | null;
  location: LifeLocationSelection | null;
  entryStatus: LifeEntryStatus;
};

type EntryFormProps = {
  trackName: string;
  initial?: LifeEntry | null;
  onSubmit: (payload: EntryFormPayload) => Promise<void>;
  onCancel: () => void;
  busy?: boolean;
};

const PRECISIONS: LifeDatePrecision[] = ["exact", "month", "year", "approximate"];

function emptyStartRaw(precision: LifeDatePrecision): string {
  if (precision === "year") return String(new Date().getFullYear());
  if (precision === "month") {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  return new Date().toISOString().slice(0, 10);
}

const STATUSES: LifeEntryStatus[] = ["complete", "skeleton"];

export default function EntryForm({
  trackName,
  initial = null,
  onSubmit,
  onCancel,
  busy = false,
}: EntryFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [entryType, setEntryType] = useState<LifeEntryType>(initial?.entryType ?? "event");
  const [startPrecision, setStartPrecision] = useState<LifeDatePrecision>(
    initial?.startPrecision ?? "exact"
  );
  const [startRaw, setStartRaw] = useState(
    initial ? lifeDateToFormValue(initial.startPrecision, initial.startDate) : emptyStartRaw("exact")
  );
  const [endPrecision, setEndPrecision] = useState<LifeDatePrecision>(
    initial?.endPrecision ?? "exact"
  );
  const [endRaw, setEndRaw] = useState(
    initial?.endDate && initial.endPrecision
      ? lifeDateToFormValue(initial.endPrecision, initial.endDate)
      : emptyStartRaw("exact")
  );
  const [isOngoing, setIsOngoing] = useState(initial?.isOngoing ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [entryStatus, setEntryStatus] = useState<LifeEntryStatus>(
    initial?.entryStatus ?? "complete"
  );
  const [location, setLocation] = useState<LifeLocationSelection | null>(
    initial?.location ? lifeLocationToSelection(initial.location) : null
  );
  const [error, setError] = useState<string | null>(null);

  const startInputType = useMemo(() => {
    if (startPrecision === "year") return "number";
    if (startPrecision === "month") return "month";
    return "date";
  }, [startPrecision]);

  const endInputType = useMemo(() => {
    if (endPrecision === "year") return "number";
    if (endPrecision === "month") return "month";
    return "date";
  }, [endPrecision]);

  function handleStartPrecisionChange(next: LifeDatePrecision) {
    setStartPrecision(next);
    setStartRaw(emptyStartRaw(next));
  }

  function handleEndPrecisionChange(next: LifeDatePrecision) {
    setEndPrecision(next);
    setEndRaw(emptyStartRaw(next));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const startDate = normalizeLifeDate(startPrecision, startRaw);
    if (!startDate) {
      setError("Invalid start date for the selected precision.");
      return;
    }

    let endDate: string | null = null;
    let endPrec: LifeDatePrecision | null = null;

    if (entryType === "period" && !isOngoing) {
      endDate = normalizeLifeDate(endPrecision, endRaw);
      if (!endDate) {
        setError("Invalid end date for the selected precision.");
        return;
      }
      endPrec = endPrecision;
    }

    const payload: EntryFormPayload = {
      title,
      entryType,
      startDate,
      startPrecision,
      endDate,
      endPrecision: endPrec,
      isOngoing: entryType === "period" ? isOngoing : false,
      notes: notes.trim() || null,
      location,
      entryStatus,
    };

    const validationError = validateLifeEntryInput({
      trackId: initial?.trackId ?? "",
      locationId: initial?.locationId ?? null,
      title: payload.title,
      entryType: payload.entryType,
      startDate: payload.startDate,
      startPrecision: payload.startPrecision,
      endDate: payload.endDate,
      endPrecision: payload.endPrecision,
      isOngoing: payload.isOngoing,
      notes: payload.notes,
      entryStatus: payload.entryStatus,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    await onSubmit(payload);
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div>
        <p className="text-sm text-gray-500">Track</p>
        <p className="font-medium text-gray-900">{trackName}</p>
      </div>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Title
        <input
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Type
        <select
          value={entryType}
          onChange={(event) => setEntryType(event.target.value as LifeEntryType)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="event">Event</option>
          <option value="period">Period</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Record status
        <select
          value={entryStatus}
          onChange={(event) => setEntryStatus(event.target.value as LifeEntryStatus)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {LIFE_ENTRY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
        <legend className="px-1 text-sm font-medium text-gray-700">Start</legend>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Precision
          <select
            value={startPrecision}
            onChange={(event) =>
              handleStartPrecisionChange(event.target.value as LifeDatePrecision)
            }
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            {PRECISIONS.map((precision) => (
              <option key={precision} value={precision}>
                {LIFE_PRECISION_LABELS[precision]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Date
          <input
            type={startInputType}
            required
            value={startRaw}
            onChange={(event) => setStartRaw(event.target.value)}
            min={startPrecision === "year" ? "1900" : undefined}
            max={startPrecision === "year" ? "2200" : undefined}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      </fieldset>

      {entryType === "period" ? (
        <fieldset className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-sm font-medium text-gray-700">End</legend>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isOngoing}
              onChange={(event) => setIsOngoing(event.target.checked)}
              className="size-4 rounded border-gray-300"
            />
            Still ongoing
          </label>
          {!isOngoing ? (
            <>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Precision
                <select
                  value={endPrecision}
                  onChange={(event) =>
                    handleEndPrecisionChange(event.target.value as LifeDatePrecision)
                  }
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  {PRECISIONS.map((precision) => (
                    <option key={precision} value={precision}>
                      {LIFE_PRECISION_LABELS[precision]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Date
                <input
                  type={endInputType}
                  required
                  value={endRaw}
                  onChange={(event) => setEndRaw(event.target.value)}
                  min={endPrecision === "year" ? "1900" : undefined}
                  max={endPrecision === "year" ? "2200" : undefined}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            </>
          ) : null}
        </fieldset>
      ) : null}

      <LocationPicker
        trackName={trackName}
        value={location}
        onChange={(next) => {
          setLocation(next);
        }}
      />

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : initial ? "Update entry" : "Save entry"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
