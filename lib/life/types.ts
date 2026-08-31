import type { LifeLocation } from "@/lib/life/location-types";

export type LifeDatePrecision = "exact" | "month" | "year" | "approximate";

export type LifeEntryType = "event" | "period";

export type LifeEntryStatus = "skeleton" | "complete";

export type LifeRelationType = "related" | (string & {});

/** Database row shapes (snake_case). */
export type DbLifeGroup = {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type DbLifeTrack = {
  id: string;
  user_id: string;
  group_id: string;
  name: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type DbLifeEntry = {
  id: string;
  user_id: string;
  track_id: string;
  location_id: string | null;
  title: string;
  entry_type: LifeEntryType;
  start_date: string;
  start_precision: LifeDatePrecision;
  end_date: string | null;
  end_precision: LifeDatePrecision | null;
  is_ongoing: boolean;
  notes: string | null;
  entry_status: LifeEntryStatus;
  created_at: string;
  updated_at: string;
};

export type DbLifeEntryRelation = {
  id: string;
  user_id: string;
  from_entry_id: string;
  to_entry_id: string;
  relation_type: string;
  created_at: string;
};

/** UI / domain shapes (camelCase). */
export type LifeEntry = {
  id: string;
  trackId: string;
  locationId: string | null;
  location: LifeLocation | null;
  title: string;
  entryType: LifeEntryType;
  startDate: string;
  startPrecision: LifeDatePrecision;
  endDate: string | null;
  endPrecision: LifeDatePrecision | null;
  isOngoing: boolean;
  notes: string | null;
  entryStatus: LifeEntryStatus;
};

export type LifeTrack = {
  id: string;
  groupId: string;
  name: string;
  order: number;
  isVisible: boolean;
  entries: LifeEntry[];
};

export type LifeGroup = {
  id: string;
  name: string;
  order: number;
  isVisible: boolean;
  tracks: LifeTrack[];
};

export type LifeEntryRelation = {
  id: string;
  userId: string;
  fromEntryId: string;
  toEntryId: string;
  relationType: string;
  createdAt: string;
};

export type LifeEntryInput = {
  trackId: string;
  locationId: string | null;
  title: string;
  entryType: LifeEntryType;
  startDate: string;
  startPrecision: LifeDatePrecision;
  endDate: string | null;
  endPrecision: LifeDatePrecision | null;
  isOngoing: boolean;
  notes: string | null;
  entryStatus?: LifeEntryStatus;
};

export type LifeGroupInput = {
  name: string;
  order?: number;
  isVisible?: boolean;
};

export type LifeTrackInput = {
  groupId: string;
  name: string;
  order?: number;
  isVisible?: boolean;
};
