/** Database row (snake_case). */
export type DbLifeLocation = {
  id: string;
  user_id: string;
  display_name: string;
  full_address: string | null;
  google_place_id: string | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
};

/** UI / domain shape (camelCase). */
export type LifeLocation = {
  id: string;
  displayName: string;
  fullAddress: string | null;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  postalCode: string | null;
  /** True when entered manually (no Google place id). */
  isManual: boolean;
};

/** Persisted location fields (no id). */
export type LifeLocationInput = {
  displayName: string;
  fullAddress: string | null;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  postalCode: string | null;
};

/** LocationPicker value — optional linked row id when editing. */
export type LifeLocationSelection = LifeLocationInput & {
  locationId?: string | null;
  isManual: boolean;
};

export function mapDbLifeLocation(row: DbLifeLocation): LifeLocation {
  return {
    id: row.id,
    displayName: row.display_name,
    fullAddress: row.full_address,
    googlePlaceId: row.google_place_id,
    latitude: row.latitude,
    longitude: row.longitude,
    country: row.country,
    countryCode: row.country_code,
    region: row.region,
    city: row.city,
    postalCode: row.postal_code,
    isManual: !row.google_place_id,
  };
}

export function lifeLocationToSelection(location: LifeLocation): LifeLocationSelection {
  return {
    locationId: location.id,
    displayName: location.displayName,
    fullAddress: location.fullAddress,
    googlePlaceId: location.googlePlaceId,
    latitude: location.latitude,
    longitude: location.longitude,
    country: location.country,
    countryCode: location.countryCode,
    region: location.region,
    city: location.city,
    postalCode: location.postalCode,
    isManual: location.isManual,
  };
}

/** Track-specific hint text for the optional location field. */
export function locationHintForTrack(trackName: string): string {
  switch (trackName) {
    case "Home":
      return "Search for your exact residential address.";
    case "Country / Base":
      return "Country or base location is enough — a street address is not required.";
    case "Where I was":
      return "Search for a city, region, or place.";
    case "Experiences":
      return "Optional place linked to this experience.";
    case "Work":
      return "Optional workplace or city.";
    case "Education":
      return "Optional school, campus, or city.";
    default:
      return "Optional place or address linked to this entry.";
  }
}
