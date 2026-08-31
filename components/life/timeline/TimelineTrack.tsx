import TimelineEvent from "@/components/life/timeline/TimelineEvent";
import TimelinePeriod from "@/components/life/timeline/TimelinePeriod";
import type { LifeEntry } from "@/lib/life/types";
import type { TimelineScale, TimelineTrackRow } from "@/lib/life/timeline-types";

type TimelineTrackProps = {
  row: TimelineTrackRow;
  scale: TimelineScale;
  selectedEntryId: string | null;
  onSelectEntry: (entry: LifeEntry) => void;
  rowHeight?: number;
};

export default function TimelineTrack({
  row,
  scale,
  selectedEntryId,
  onSelectEntry,
  rowHeight = 48,
}: TimelineTrackProps) {
  return (
    <div
      className="relative border-b border-gray-100"
      style={{ width: scale.widthPx, height: rowHeight }}
      role="group"
      aria-label={row.trackName}
    >
      {row.entries.map((entry) =>
        entry.entryType === "period" ? (
          <TimelinePeriod
            key={entry.id}
            entry={entry}
            scale={scale}
            selected={selectedEntryId === entry.id}
            onSelect={onSelectEntry}
          />
        ) : (
          <TimelineEvent
            key={entry.id}
            entry={entry}
            scale={scale}
            selected={selectedEntryId === entry.id}
            onSelect={onSelectEntry}
          />
        )
      )}
    </div>
  );
}
