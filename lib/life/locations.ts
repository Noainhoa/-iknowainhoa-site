import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DbLifeLocation,
  LifeLocation,
  LifeLocationInput,
  LifeLocationSelection,
} from "@/lib/life/location-types";
import { mapDbLifeLocation } from "@/lib/life/location-types";

function toRow(userId: string, input: LifeLocationInput): Record<string, unknown> {
  return {
    user_id: userId,
    display_name: input.displayName.trim(),
    full_address: input.fullAddress?.trim() || null,
    google_place_id: input.googlePlaceId,
    latitude: input.latitude,
    longitude: input.longitude,
    country: input.country,
    country_code: input.countryCode,
    region: input.region,
    city: input.city,
    postal_code: input.postalCode,
  };
}

export async function fetchLifeLocations(
  supabase: SupabaseClient
): Promise<Map<string, LifeLocation>> {
  const { data, error } = await supabase.from("life_locations").select("*");
  if (error) throw error;

  const map = new Map<string, LifeLocation>();
  for (const row of (data ?? []) as DbLifeLocation[]) {
    map.set(row.id, mapDbLifeLocation(row));
  }
  return map;
}

async function findLocationByPlaceId(
  supabase: SupabaseClient,
  userId: string,
  googlePlaceId: string
): Promise<LifeLocation | null> {
  const { data, error } = await supabase
    .from("life_locations")
    .select("*")
    .eq("user_id", userId)
    .eq("google_place_id", googlePlaceId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbLifeLocation(data as DbLifeLocation) : null;
}

export async function createLifeLocation(
  supabase: SupabaseClient,
  userId: string,
  input: LifeLocationInput
): Promise<LifeLocation> {
  const { data, error } = await supabase
    .from("life_locations")
    .insert(toRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return mapDbLifeLocation(data as DbLifeLocation);
}

export async function updateLifeLocation(
  supabase: SupabaseClient,
  userId: string,
  locationId: string,
  input: LifeLocationInput
): Promise<LifeLocation> {
  const { data, error } = await supabase
    .from("life_locations")
    .update(toRow(userId, input))
    .eq("id", locationId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapDbLifeLocation(data as DbLifeLocation);
}

/**
 * Resolve a location selection to a life_locations row id for linking on an entry.
 * Reuses existing rows by google_place_id when possible.
 */
export async function resolveLifeLocationId(
  supabase: SupabaseClient,
  userId: string,
  selection: LifeLocationSelection | null | undefined
): Promise<string | null> {
  if (!selection) return null;

  if (selection.googlePlaceId) {
    const existing = await findLocationByPlaceId(supabase, userId, selection.googlePlaceId);
    if (existing) {
      const updated = await updateLifeLocation(supabase, userId, existing.id, selection);
      return updated.id;
    }
    const created = await createLifeLocation(supabase, userId, selection);
    return created.id;
  }

  if (selection.locationId) {
    const updated = await updateLifeLocation(supabase, userId, selection.locationId, selection);
    return updated.id;
  }

  const created = await createLifeLocation(supabase, userId, selection);
  return created.id;
}
