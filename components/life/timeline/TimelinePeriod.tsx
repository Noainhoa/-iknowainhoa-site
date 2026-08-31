import type { LifeEntry } from "@/lib/life/types";
import { periodBarLayout } from "@/lib/life/timeline-scale";
import type { TimelineScale } from "@/lib/life/timeline-types";
import { formatLifeEntrySummary } from "@/lib/life/format";
import { isSkeletonEntry } from "@/lib/life/entry-status";
import {
  formatEntryLabel,
  shouldShowEntryLabel,
} from "@/lib/life/timeline-domain";

type TimelinePeriodProps = {
  entry: LifeEntry;
  scale: TimelineScale;
  selected: boolean;
  onSelect: (entry: LifeEntry) => void;
};

export default function TimelinePeriod({
  entry,
  scale,
  selected,
  onSelect,
}: TimelinePeriodProps) {
  const layout = periodBarLayout(entry, scale);
  const summary = formatLifeEntrySummary(entry);
  const label = `${entry.title}, ${summary}${entry.isOngoing ? ", ongoing" : ""}`;
  const skeleton = isSkeletonEntry(entry);
  const showLabel = shouldShowEntryLabel(scale, layout.widthPx);
  const displayTitle = formatEntryLabel(entry.title, scale.labelMode);

  return (
    <button
      type="button"
      className={`absolute top-1/2 z-10 h-3 -translate-y-1/2 rounded-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
        skeleton
          ? "border-dashed border-gray-400 bg-white"
          : "border-gray-500 bg-gray-200"
      } ${selected ? "z-20 ring-2 ring-gray-900" : ""}`}
      style={{ left: layout.leftPx, width: layout.widthPx }}
      aria-label={label}
      aria-pressed={selected}
      title={entry.title}
      onClick={() => onSelect(entry)}
    >
      {showLabel ? (
        <span
          className={`pointer-events-none absolute left-0 top-full mt-1 max-w-[10rem] truncate text-[10px] leading-tight ${
            skeleton ? "italic text-gray-400" : "text-gray-700"
          }`}
        >
          {displayTitle}
        </span>
      ) : null}
    </button>
  );
}
