import TrackNavigatorItem from "@/components/life/navigator/TrackNavigatorItem";
import type { LifeEntry, LifeGroup } from "@/lib/life/types";

type GroupNavigatorItemProps = {
  group: LifeGroup;
  collapsed: boolean;
  selectedEntryId: string | null;
  onToggleCollapsed: () => void;
  onGroupVisibilityChange: (groupId: string, visible: boolean) => void;
  onTrackVisibilityChange: (trackId: string, visible: boolean) => void;
  onAddEntry: (trackId: string, trackName: string) => void;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onNewTrack: (groupId: string) => void;
  onEditTrack: (trackId: string, groupId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onSelectEntry: (entry: LifeEntry) => void;
};

export default function GroupNavigatorItem({
  group,
  collapsed,
  selectedEntryId,
  onToggleCollapsed,
  onGroupVisibilityChange,
  onTrackVisibilityChange,
  onAddEntry,
  onEditGroup,
  onDeleteGroup,
  onNewTrack,
  onEditTrack,
  onDeleteTrack,
  onSelectEntry,
}: GroupNavigatorItemProps) {
  return (
    <section aria-labelledby={`life-nav-group-${group.id}`}>
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex size-5 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-expanded={!collapsed}
            aria-controls={`life-nav-group-body-${group.id}`}
            aria-label={collapsed ? `Expand ${group.name}` : `Collapse ${group.name}`}
          >
            <span aria-hidden className="text-xs">
              {collapsed ? "▸" : "▾"}
            </span>
          </button>
          <label className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              checked={group.isVisible}
              onChange={(event) => onGroupVisibilityChange(group.id, event.target.checked)}
              className="size-3.5 shrink-0 rounded border-gray-300"
              aria-label={`Show ${group.name}`}
            />
            <h2
              id={`life-nav-group-${group.id}`}
              className="truncate text-xs font-semibold tracking-wide text-gray-500"
            >
              {group.name}
            </h2>
          </label>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onNewTrack(group.id)}
            className="rounded border border-gray-300 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            + Track
          </button>
          <button
            type="button"
            onClick={() => onEditGroup(group.id)}
            className="text-[11px] text-gray-500 hover:text-gray-900"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDeleteGroup(group.id)}
            className="text-[11px] text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>

      {!collapsed ? (
        <div id={`life-nav-group-body-${group.id}`} className="mt-1 space-y-1 pl-1">
          {group.tracks.length === 0 ? (
            <p className="px-1 py-2 text-[11px] text-gray-400">No tracks yet</p>
          ) : (
            group.tracks.map((track) => (
              <TrackNavigatorItem
                key={track.id}
                groupId={group.id}
                track={track}
                selectedEntryId={selectedEntryId}
                onTrackVisibilityChange={onTrackVisibilityChange}
                onAddEntry={onAddEntry}
                onEditTrack={onEditTrack}
                onDeleteTrack={onDeleteTrack}
                onSelectEntry={onSelectEntry}
              />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
