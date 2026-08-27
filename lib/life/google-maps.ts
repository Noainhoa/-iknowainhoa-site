import type { LifeLocation } from "@/lib/life/location-types";

/** Prefer place_id, then coordinates, then encoded address. */
export function googleMapsHref(
  location: Pick<
    LifeLocation,
    "googlePlaceId" | "latitude" | "longitude" | "fullAddress" | "displayName"
  >
): string | null {
  if (location.googlePlaceId) {
    return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(location.googlePlaceId)}`;
  }
  if (location.latitude != null && location.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`;
  }
  const query = location.fullAddress?.trim() || location.displayName.trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function isGoogleMapsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
}

let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsPlaces(): Promise<void> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."));
  }
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const scriptId = "life-google-maps-script";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&loading=async`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

type AddressComponent = google.maps.GeocoderAddressComponent;

export function parseAddressComponents(components: AddressComponent[]): {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  postalCode: string | null;
} {
  const find = (...types: string[]) =>
    components.find((component) => types.some((type) => component.types.includes(type)));

  const country = find("country");
  const region = find("administrative_area_level_1");
  const city =
    find("locality") ??
    find("postal_town") ??
    find("administrative_area_level_2") ??
    find("sublocality");
  const postal = find("postal_code");

  return {
    country: country?.long_name ?? null,
    countryCode: country?.short_name ?? null,
    region: region?.long_name ?? null,
    city: city?.long_name ?? null,
    postalCode: postal?.long_name ?? null,
  };
}
