import type { LifeEntry } from "@/lib/life/types";
import { eventMarkerLayout } from "@/lib/life/timeline-scale";
import type { TimelineScale } from "@/lib/life/timeline-types";
import { formatLifeEntrySummary } from "@/lib/life/format";
import { isSkeletonEntry } from "@/lib/life/entry-status";
import {
  formatEntryLabel,
  shouldShowEntryLabel,
} from "@/lib/life/timeline-domain";

type TimelineEventProps = {
  entry: LifeEntry;
  scale: TimelineScale;
  selected: boolean;
  onSelect: (entry: LifeEntry) => void;
};

export default function TimelineEvent({
  entry,
  scale,
  selected,
  onSelect,
}: TimelineEventProps) {
  const layout = eventMarkerLayout(entry, scale);
  const summary = formatLifeEntrySummary(entry);
  const label = `${entry.title}, ${summary}`;

  const isApproximate = entry.startPrecision === "approximate";
  const skeleton = isSkeletonEntry(entry);
  const hasRange = layout.widthPx > 0;
  const showLabel = shouldShowEntryLabel(
    scale,
    hasRange ? layout.widthPx : Math.max(4, scale.pxPerDay * 7)
  );
  const displayTitle = formatEntryLabel(entry.title, scale.labelMode);

  return (
    <button
      type="button"
      className={`absolute z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
        hasRange ? "top-1/2 h-3 -translate-y-1/2" : "size-3"
      } ${selected ? "z-20" : ""}`}
      style={
        hasRange
          ? { left: layout.leftPx, width: layout.widthPx }
          : { left: layout.centerPx, top: "50%", transform: "translate(-50%, -50%)" }
      }
      aria-label={label}
      aria-pressed={selected}
      title={entry.title}
      onClick={() => onSelect(entry)}
    >
      {hasRange ? (
        <span
          className={`block h-full rounded-sm border ${
            skeleton
              ? "border-dashed border-gray-400 bg-white"
              : isApproximate
                ? "border-dashed border-gray-500 bg-gray-100"
                : "border-gray-600 bg-gray-700"
          } ${selected ? "ring-2 ring-gray-900" : ""}`}
        />
      ) : (
        <span
          className={`block size-2.5 rounded-full border ${
            skeleton
              ? "border-dashed border-gray-400 bg-white"
              : isApproximate
                ? "border-dashed border-gray-600 bg-white"
                : "border-gray-800 bg-gray-800"
          } ${selected ? "ring-2 ring-gray-900 ring-offset-1" : ""}`}
        />
      )}
      {showLabel ? (
        <span
          className={`pointer-events-none absolute left-1/2 top-full mt-1 max-w-[8rem] -translate-x-1/2 truncate text-[10px] leading-tight ${
            skeleton ? "italic text-gray-400" : "text-gray-700"
          }`}
        >
          {displayTitle}
        </span>
      ) : null}
    </button>
  );
}
