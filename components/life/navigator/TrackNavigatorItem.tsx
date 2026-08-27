import type { LifeEntry, LifeTrack } from "@/lib/life/types";
import { formatLifeEntrySummary } from "@/lib/life/format";

type TrackNavigatorItemProps = {
  groupId: string;
  track: LifeTrack;
  selectedEntryId: string | null;
  onTrackVisibilityChange: (trackId: string, visible: boolean) => void;
  onAddEntry: (trackId: string, trackName: string) => void;
  onEditTrack: (trackId: string, groupId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onSelectEntry: (entry: LifeEntry) => void;
};

export default function TrackNavigatorItem({
  groupId,
  track,
  selectedEntryId,
  onTrackVisibilityChange,
  onAddEntry,
  onEditTrack,
  onDeleteTrack,
  onSelectEntry,
}: TrackNavigatorItemProps) {
  return (
    <div className="mt-1">
      <div className="flex items-start justify-between gap-2 rounded-md px-1 py-1">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-gray-900">
          <input
            type="checkbox"
            checked={track.isVisible}
            onChange={(event) => onTrackVisibilityChange(track.id, event.target.checked)}
            className="size-3.5 shrink-0 rounded border-gray-300"
            aria-label={`Show ${track.name}`}
          />
          <span className="truncate font-medium">{track.name}</span>
        </label>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onAddEntry(track.id, track.name)}
            className="rounded border border-gray-300 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            + Add
          </button>
          <button
            type="button"
            onClick={() => onEditTrack(track.id, groupId)}
            className="text-[11px] text-gray-500 hover:text-gray-900"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDeleteTrack(track.id)}
            className="text-[11px] text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>

      {track.entries.length > 0 ? (
        <ul className="ml-5 mt-0.5 border-l border-gray-200 pl-2">
          {track.entries.map((entry) => {
            const selected = entry.id === selectedEntryId;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelectEntry(entry)}
                  className={`flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left text-sm ${
                    selected
                      ? "bg-gray-900 text-white"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium leading-snug">{entry.title}</span>
                  <span
                    className={`text-[11px] ${selected ? "text-gray-300" : "text-gray-500"}`}
                  >
                    {formatLifeEntrySummary(entry)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ml-5 pl-2 text-[11px] text-gray-400">No entries yet</p>
      )}
    </div>
  );
}
