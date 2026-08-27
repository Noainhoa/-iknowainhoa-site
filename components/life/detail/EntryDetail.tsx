import { formatLifeEntrySummary, LIFE_PRECISION_LABELS } from "@/lib/life/format";
import { googleMapsHref } from "@/lib/life/google-maps";
import { externalAnchorProps } from "@/lib/links";
import type { LifeEntry } from "@/lib/life/types";

type EntryDetailProps = {
  entry: LifeEntry;
  trackName: string;
  groupName?: string;
  onEdit: () => void;
  onDelete: () => void;
};

export default function EntryDetail({
  entry,
  trackName,
  groupName,
  onEdit,
  onDelete,
}: EntryDetailProps) {
  const mapsHref = entry.location ? googleMapsHref(entry.location) : null;

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {groupName ? `${groupName} · ` : ""}
            {trackName}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            {entry.title}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </header>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Type</dt>
          <dd className="font-medium text-gray-900 capitalize">{entry.entryType}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Dates</dt>
          <dd className="font-medium text-gray-900">{formatLifeEntrySummary(entry)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Start precision</dt>
          <dd className="font-medium text-gray-900">
            {LIFE_PRECISION_LABELS[entry.startPrecision]}
          </dd>
        </div>
        {entry.entryType === "period" && entry.endPrecision ? (
          <div>
            <dt className="text-gray-500">End precision</dt>
            <dd className="font-medium text-gray-900">
              {LIFE_PRECISION_LABELS[entry.endPrecision]}
            </dd>
          </div>
        ) : null}
        {entry.entryType === "period" ? (
          <div>
            <dt className="text-gray-500">Ongoing</dt>
            <dd className="font-medium text-gray-900">{entry.isOngoing ? "Yes" : "No"}</dd>
          </div>
        ) : null}
      </dl>

      {entry.location ? (
        <section className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Location
          </h3>
          <p className="mt-1 font-medium text-gray-900">{entry.location.displayName}</p>
          {entry.location.fullAddress ? (
            <p className="text-gray-600">{entry.location.fullAddress}</p>
          ) : null}
          {entry.location.city || entry.location.country ? (
            <p className="text-gray-500">
              {[entry.location.city, entry.location.country].filter(Boolean).join(", ")}
            </p>
          ) : null}
          {entry.location.isManual ? (
            <p className="mt-1 text-xs text-amber-700">Manual / unverified location</p>
          ) : null}
          {mapsHref ? (
            <a
              href={mapsHref}
              {...externalAnchorProps(mapsHref)}
              className="mt-2 inline-block text-sm text-blue-700 hover:underline"
            >
              Open in Google Maps ↗
            </a>
          ) : null}
        </section>
      ) : null}

      {entry.notes ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {entry.notes}
          </p>
        </section>
      ) : null}
    </article>
  );
}
