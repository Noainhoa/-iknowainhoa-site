import GroupNavigatorItem from "@/components/life/navigator/GroupNavigatorItem";
import type { LifeEntry, LifeGroup } from "@/lib/life/types";

type LifeNavigatorProps = {
  groups: LifeGroup[];
  collapsedGroupIds: Set<string>;
  selectedEntryId: string | null;
  onToggleGroupCollapsed: (groupId: string) => void;
  onNewGroup: () => void;
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

export default function LifeNavigator({
  groups,
  collapsedGroupIds,
  selectedEntryId,
  onToggleGroupCollapsed,
  onNewGroup,
  onGroupVisibilityChange,
  onTrackVisibilityChange,
  onAddEntry,
  onEditGroup,
  onDeleteGroup,
  onNewTrack,
  onEditTrack,
  onDeleteTrack,
  onSelectEntry,
}: LifeNavigatorProps) {
  return (
    <nav
      aria-label="Life entries"
      className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Entries</p>
        <button
          type="button"
          onClick={onNewGroup}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          + New group
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {groups.length === 0 ? (
          <p className="text-sm text-gray-500">No groups yet.</p>
        ) : (
          groups.map((group) => (
            <GroupNavigatorItem
              key={group.id}
              group={group}
              collapsed={collapsedGroupIds.has(group.id)}
              selectedEntryId={selectedEntryId}
              onToggleCollapsed={() => onToggleGroupCollapsed(group.id)}
              onGroupVisibilityChange={onGroupVisibilityChange}
              onTrackVisibilityChange={onTrackVisibilityChange}
              onAddEntry={onAddEntry}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
              onNewTrack={onNewTrack}
              onEditTrack={onEditTrack}
              onDeleteTrack={onDeleteTrack}
              onSelectEntry={onSelectEntry}
            />
          ))
        )}
      </div>
    </nav>
  );
}
