import type { LifeEntry, LifeGroup } from "@/lib/life/types";
import type { TimelineRow, VisibleTimelineTree } from "@/lib/life/timeline-types";

export function filterVisibleTimelineGroups(groups: LifeGroup[]): LifeGroup[] {
  return groups
    .filter((group) => group.isVisible)
    .map((group) => ({
      ...group,
      tracks: group.tracks.filter((track) => track.isVisible),
    }))
    .filter((group) => group.tracks.length > 0);
}

export function buildTimelineRows(groups: LifeGroup[]): TimelineRow[] {
  const visible = filterVisibleTimelineGroups(groups);
  const rows: TimelineRow[] = [];

  for (const group of visible) {
    const tracksWithEntries = group.tracks.filter((track) => track.entries.length > 0);
    if (tracksWithEntries.length === 0) continue;

    rows.push({
      kind: "group",
      key: `group-${group.id}`,
      groupId: group.id,
      groupName: group.name,
    });

    for (const track of tracksWithEntries) {
      rows.push({
        kind: "track",
        key: `track-${track.id}`,
        groupId: group.id,
        groupName: group.name,
        trackId: track.id,
        trackName: track.name,
        entries: track.entries,
      });
    }
  }

  return rows;
}

export function collectTimelineEntries(rows: TimelineRow[]): LifeEntry[] {
  return rows
    .filter((row): row is Extract<TimelineRow, { kind: "track" }> => row.kind === "track")
    .flatMap((row) => row.entries);
}

export function buildVisibleTimelineTree(groups: LifeGroup[]): VisibleTimelineTree {
  const visibleGroups = filterVisibleTimelineGroups(groups);
  const rows = buildTimelineRows(groups);
  const entries = collectTimelineEntries(rows);

  return {
    groups: visibleGroups,
    rows,
    entries,
  };
}

export function findTimelineEntryContext(
  groups: LifeGroup[],
  entryId: string
): { entry: LifeEntry; trackName: string; groupName: string } | undefined {
  for (const group of groups) {
    if (!group.isVisible) continue;
    for (const track of group.tracks) {
      if (!track.isVisible) continue;
      const entry = track.entries.find((item) => item.id === entryId);
      if (entry) {
        return { entry, trackName: track.name, groupName: group.name };
      }
    }
  }
  return undefined;
}
