import type { SupabaseClient } from "@supabase/supabase-js";
import { failLifeOperation, logLifeOperation } from "@/lib/life/errors";
import { getLifeSupabaseEnv } from "@/lib/life/env";
import type {
  DbLifeEntry,
  DbLifeGroup,
  DbLifeTrack,
  LifeEntry,
  LifeEntryStatus,
  LifeGroup,
  LifeTrack,
} from "@/lib/life/types";
import type { LifeLocation } from "@/lib/life/location-types";
import { fetchLifeLocations } from "@/lib/life/locations";

function lifeSupabaseHost(): string {
  const { url } = getLifeSupabaseEnv();
  if (!url) return "(missing NEXT_PUBLIC_LIFE_SUPABASE_URL)";
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function mapEntry(row: DbLifeEntry, location: LifeLocation | null): LifeEntry {
  return {
    id: row.id,
    trackId: row.track_id,
    locationId: row.location_id,
    location,
    title: row.title,
    entryType: row.entry_type,
    startDate: row.start_date,
    startPrecision: row.start_precision,
    endDate: row.end_date,
    endPrecision: row.end_precision,
    isOngoing: row.is_ongoing,
    notes: row.notes,
    entryStatus: row.entry_status ?? "complete",
  };
}

function mapTrack(row: DbLifeTrack, entries: LifeEntry[]): LifeTrack {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    order: row.sort_order,
    isVisible: row.is_visible,
    entries,
  };
}

function mapGroup(row: DbLifeGroup, tracks: LifeTrack[]): LifeGroup {
  return {
    id: row.id,
    name: row.name,
    order: row.sort_order,
    isVisible: row.is_visible,
    tracks,
  };
}

export async function fetchLifeTree(supabase: SupabaseClient, userId?: string): Promise<LifeGroup[]> {
  const supabaseUrl = lifeSupabaseHost();

  const groupsRes = await supabase.from("life_groups").select("*").order("sort_order");
  if (groupsRes.error) {
    failLifeOperation("fetchLifeTree:life_groups", groupsRes.error, groupsRes.data, groupsRes.status);
  }
  logLifeOperation("fetchLifeTree:life_groups", {
    ok: true,
    userId,
    supabaseUrl,
    count: groupsRes.data?.length ?? 0,
    status: groupsRes.status,
  });

  const tracksRes = await supabase.from("life_tracks").select("*").order("sort_order");
  if (tracksRes.error) {
    failLifeOperation("fetchLifeTree:life_tracks", tracksRes.error, tracksRes.data, tracksRes.status);
  }
  logLifeOperation("fetchLifeTree:life_tracks", {
    ok: true,
    userId,
    supabaseUrl,
    count: tracksRes.data?.length ?? 0,
    status: tracksRes.status,
  });

  const [entriesRes, locationsById] = await Promise.all([
    supabase.from("life_entries").select("*").order("start_date", { ascending: false }),
    fetchLifeLocations(supabase),
  ]);
  if (entriesRes.error) {
    failLifeOperation("fetchLifeTree:life_entries", entriesRes.error, entriesRes.data, entriesRes.status);
  }
  logLifeOperation("fetchLifeTree:life_entries", {
    ok: true,
    userId,
    supabaseUrl,
    count: entriesRes.data?.length ?? 0,
    status: entriesRes.status,
  });
  logLifeOperation("fetchLifeTree:life_locations", {
    ok: true,
    userId,
    supabaseUrl,
    count: locationsById.size,
  });

  const entriesByTrack = new Map<string, LifeEntry[]>();
  for (const row of (entriesRes.data ?? []) as DbLifeEntry[]) {
    const location = row.location_id ? locationsById.get(row.location_id) ?? null : null;
    const entry = mapEntry(row, location);
    const list = entriesByTrack.get(entry.trackId) ?? [];
    list.push(entry);
    entriesByTrack.set(entry.trackId, list);
  }

  const tracksByGroup = new Map<string, LifeTrack[]>();
  for (const row of (tracksRes.data ?? []) as DbLifeTrack[]) {
    const track = mapTrack(row, entriesByTrack.get(row.id) ?? []);
    const list = tracksByGroup.get(track.groupId) ?? [];
    list.push(track);
    tracksByGroup.set(track.groupId, list);
  }

  return ((groupsRes.data ?? []) as DbLifeGroup[]).map((row) =>
    mapGroup(row, tracksByGroup.get(row.id) ?? [])
  );
}

export async function createLifeGroup(
  supabase: SupabaseClient,
  userId: string,
  input: { name: string; order: number; isVisible?: boolean }
): Promise<DbLifeGroup> {
  const { data, error } = await supabase
    .from("life_groups")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      sort_order: input.order,
      is_visible: input.isVisible ?? true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbLifeGroup;
}

export async function updateLifeGroup(
  supabase: SupabaseClient,
  groupId: string,
  patch: Partial<{ name: string; order: number; isVisible: boolean }>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name.trim();
  if (patch.order !== undefined) row.sort_order = patch.order;
  if (patch.isVisible !== undefined) row.is_visible = patch.isVisible;

  const { error } = await supabase.from("life_groups").update(row).eq("id", groupId);
  if (error) throw error;
}

export async function deleteLifeGroup(supabase: SupabaseClient, groupId: string): Promise<void> {
  const { error } = await supabase.from("life_groups").delete().eq("id", groupId);
  if (error) throw error;
}

export async function createLifeTrack(
  supabase: SupabaseClient,
  userId: string,
  input: { groupId: string; name: string; order: number; isVisible?: boolean }
): Promise<DbLifeTrack> {
  const { data, error } = await supabase
    .from("life_tracks")
    .insert({
      user_id: userId,
      group_id: input.groupId,
      name: input.name.trim(),
      sort_order: input.order,
      is_visible: input.isVisible ?? true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbLifeTrack;
}

export async function updateLifeTrack(
  supabase: SupabaseClient,
  trackId: string,
  patch: Partial<{ name: string; order: number; isVisible: boolean; groupId: string }>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name.trim();
  if (patch.order !== undefined) row.sort_order = patch.order;
  if (patch.isVisible !== undefined) row.is_visible = patch.isVisible;
  if (patch.groupId !== undefined) row.group_id = patch.groupId;

  const { error } = await supabase.from("life_tracks").update(row).eq("id", trackId);
  if (error) throw error;
}

export async function deleteLifeTrack(supabase: SupabaseClient, trackId: string): Promise<void> {
  const { error } = await supabase.from("life_tracks").delete().eq("id", trackId);
  if (error) throw error;
}

export async function createLifeEntry(
  supabase: SupabaseClient,
  userId: string,
  input: {
    trackId: string;
    locationId: string | null;
    title: string;
    entryType: "event" | "period";
    startDate: string;
    startPrecision: DbLifeEntry["start_precision"];
    endDate: string | null;
    endPrecision: DbLifeEntry["end_precision"];
    isOngoing: boolean;
    notes: string | null;
    entryStatus?: LifeEntryStatus;
  }
): Promise<DbLifeEntry> {
  const { data, error } = await supabase
    .from("life_entries")
    .insert({
      user_id: userId,
      track_id: input.trackId,
      location_id: input.locationId,
      title: input.title.trim(),
      entry_type: input.entryType,
      start_date: input.startDate,
      start_precision: input.startPrecision,
      end_date: input.endDate,
      end_precision: input.endPrecision,
      is_ongoing: input.isOngoing,
      notes: input.notes?.trim() || null,
      entry_status: input.entryStatus ?? "complete",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbLifeEntry;
}

export async function updateLifeEntry(
  supabase: SupabaseClient,
  entryId: string,
  input: {
    trackId: string;
    locationId: string | null;
    title: string;
    entryType: "event" | "period";
    startDate: string;
    startPrecision: DbLifeEntry["start_precision"];
    endDate: string | null;
    endPrecision: DbLifeEntry["end_precision"];
    isOngoing: boolean;
    notes: string | null;
    entryStatus?: LifeEntryStatus;
  }
): Promise<void> {
  const { error } = await supabase
    .from("life_entries")
    .update({
      track_id: input.trackId,
      location_id: input.locationId,
      title: input.title.trim(),
      entry_type: input.entryType,
      start_date: input.startDate,
      start_precision: input.startPrecision,
      end_date: input.endDate,
      end_precision: input.endPrecision,
      is_ongoing: input.isOngoing,
      notes: input.notes?.trim() || null,
      entry_status: input.entryStatus ?? "complete",
    })
    .eq("id", entryId);

  if (error) throw error;
}

export async function deleteLifeEntry(supabase: SupabaseClient, entryId: string): Promise<void> {
  const { error } = await supabase.from("life_entries").delete().eq("id", entryId);
  if (error) throw error;
}

export function nextSortOrder(items: { order: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.order)) + 1;
}
