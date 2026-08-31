import type { LifeEntry, LifeGroup } from "@/lib/life/types";

export type TimelineZoom = "life" | "20y" | "10y" | "5y" | "1y";

export type TimelineScale = {
  startMs: number;
  endMs: number;
  widthPx: number;
  zoom: TimelineZoom;
  pxPerDay: number;
  labelMode: "hidden" | "short" | "full";
};

export type TimelineTrackRow = {
  kind: "track";
  key: string;
  groupId: string;
  groupName: string;
  trackId: string;
  trackName: string;
  entries: LifeEntry[];
};

export type TimelineGroupRow = {
  kind: "group";
  key: string;
  groupId: string;
  groupName: string;
};

export type TimelineRow = TimelineGroupRow | TimelineTrackRow;

export type TimelineEntryContext = {
  entry: LifeEntry;
  trackName: string;
  groupName: string;
};

export type VisibleTimelineTree = {
  groups: LifeGroup[];
  rows: TimelineRow[];
  entries: LifeEntry[];
};
