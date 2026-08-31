import Link from "next/link";
import { formatLifeEntrySummary, LIFE_PRECISION_LABELS } from "@/lib/life/format";
import { isSkeletonEntry, LIFE_ENTRY_STATUS_LABELS } from "@/lib/life/entry-status";
import { googleMapsHref } from "@/lib/life/google-maps";
import { externalAnchorProps } from "@/lib/links";
import type { TimelineEntryContext } from "@/lib/life/timeline-types";

type TimelineEntryDetailProps = {
  context: TimelineEntryContext;
  onClose: () => void;
};

export default function TimelineEntryDetail({ context, onClose }: TimelineEntryDetailProps) {
  const { entry, trackName, groupName } = context;
  const mapsHref = entry.location ? googleMapsHref(entry.location) : null;
  const manageHref = `/life/manage?entry=${encodeURIComponent(entry.id)}`;
  const skeleton = isSkeletonEntry(entry);

  return (
    <aside
      className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5"
      aria-label="Entry details"
    >
      {skeleton ? (
        <p className="mb-3 text-sm italic text-gray-500">{LIFE_ENTRY_STATUS_LABELS.skeleton}</p>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {groupName} · {trackName}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-sm text-gray-500 hover:text-gray-900"
          aria-label="Close details"
        >
          Close
        </button>
      </div>

      <h2
        className={`mt-1 text-xl font-semibold tracking-tight ${
          skeleton ? "italic text-gray-600" : "text-gray-900"
        }`}
      >
        {entry.title}
      </h2>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
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
        <section className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Location
          </h3>
          <p className="mt-1 font-medium text-gray-900">{entry.location.displayName}</p>
          {entry.location.fullAddress ? (
            <p className="text-gray-600">{entry.location.fullAddress}</p>
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
        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {entry.notes}
          </p>
        </section>
      ) : null}

      <p className="mt-4">
        <Link href={manageHref} className="text-sm text-gray-600 hover:text-gray-900">
          Edit in Manage →
        </Link>
      </p>
    </aside>
  );
}
