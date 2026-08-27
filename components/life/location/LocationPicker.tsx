"use client";

import { useEffect, useId, useRef, useState } from "react";
import { externalAnchorProps } from "@/lib/links";
import {
  googleMapsHref,
  isGoogleMapsConfigured,
  loadGoogleMapsPlaces,
  parseAddressComponents,
} from "@/lib/life/google-maps";
import {
  type LifeLocationSelection,
  locationHintForTrack,
} from "@/lib/life/location-types";

type LocationPickerProps = {
  trackName: string;
  value: LifeLocationSelection | null;
  onChange: (value: LifeLocationSelection | null) => void;
};

type Suggestion = {
  placeId: string;
  description: string;
  mainText: string;
};

function selectionFromManual(displayName: string, fullAddress: string): LifeLocationSelection {
  return {
    displayName: displayName.trim(),
    fullAddress: fullAddress.trim() || null,
    googlePlaceId: null,
    latitude: null,
    longitude: null,
    country: null,
    countryCode: null,
    region: null,
    city: null,
    postalCode: null,
    isManual: true,
  };
}

export default function LocationPicker({ trackName, value, onChange }: LocationPickerProps) {
  const listId = useId();
  const placesHostRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [placesReady, setPlacesReady] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");

  const mapsConfigured = isGoogleMapsConfigured();
  const hint = locationHintForTrack(trackName);
  const mapsLink = value ? googleMapsHref(value) : null;

  useEffect(() => {
    if (!mapsConfigured || manualMode) return;
    let cancelled = false;
    void loadGoogleMapsPlaces()
      .then(() => {
        if (!cancelled) setPlacesReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPlacesError(error instanceof Error ? error.message : "Google Places unavailable.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mapsConfigured, manualMode]);

  useEffect(() => {
    if (!placesReady || manualMode || !query.trim() || value) {
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: query.trim() }, (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
          setSuggestions([]);
          return;
        }
        setSuggestions(
          predictions.map((prediction) => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting?.main_text ?? prediction.description,
          }))
        );
      });
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, placesReady, manualMode, value]);

  const showSuggestions =
    placesReady && !manualMode && !value && query.trim().length > 0 && suggestions.length > 0;

  function clearSelection() {
    onChange(null);
    setQuery("");
    setSuggestions([]);
    setManualName("");
    setManualAddress("");
    setManualMode(false);
  }

  async function selectPlace(placeId: string, description: string) {
    if (!placesHostRef.current) return;
    setPlacesError(null);

    const service = new google.maps.places.PlacesService(placesHostRef.current);
    service.getDetails(
      {
        placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "geometry",
          "address_components",
        ],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          setPlacesError("Could not load place details.");
          return;
        }

        const parsed = parseAddressComponents(place.address_components ?? []);
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        onChange({
          locationId: value?.locationId,
          displayName: place.name ?? description,
          fullAddress: place.formatted_address ?? description,
          googlePlaceId: place.place_id ?? placeId,
          latitude: lat ?? null,
          longitude: lng ?? null,
          country: parsed.country,
          countryCode: parsed.countryCode,
          region: parsed.region,
          city: parsed.city,
          postalCode: parsed.postalCode,
          isManual: false,
        });
        setQuery("");
        setSuggestions([]);
      }
    );
  }

  function applyManualLocation() {
    if (!manualName.trim()) return;
    onChange(selectionFromManual(manualName, manualAddress));
    setManualMode(false);
  }

  return (
    <fieldset className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
      <legend className="px-1 text-sm font-medium text-gray-700">Location (optional)</legend>
      <p className="text-xs text-gray-500">{hint}</p>

      <div ref={placesHostRef} className="hidden" aria-hidden />

      {value ? (
        <div className="rounded-md border border-gray-200 bg-white p-3 text-sm">
          <p className="font-medium text-gray-900">{value.displayName}</p>
          {value.fullAddress ? <p className="text-gray-600">{value.fullAddress}</p> : null}
          {value.city || value.country ? (
            <p className="text-gray-500">
              {[value.city, value.country].filter(Boolean).join(", ")}
            </p>
          ) : null}
          {value.isManual ? (
            <p className="mt-1 text-xs text-amber-700">Manual / unverified location</p>
          ) : null}
          {trackName === "Home" && value.latitude != null && value.longitude != null ? (
            <details className="mt-2 text-xs text-gray-500">
              <summary className="cursor-pointer">Location details</summary>
              <p>
                Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </p>
            </details>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3">
            {mapsLink ? (
              <a
                href={mapsLink}
                {...externalAnchorProps(mapsLink)}
                className="text-sm text-blue-700 hover:underline"
              >
                Open in Google Maps ↗
              </a>
            ) : null}
            <button
              type="button"
              onClick={clearSelection}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear location
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setQuery(value.displayName);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Change
            </button>
          </div>
        </div>
      ) : manualMode ? (
        <div className="flex flex-col gap-2">
          {!mapsConfigured || placesError ? (
            <p className="text-xs text-amber-700">
              Google Places is unavailable. Enter a manual location below.
            </p>
          ) : null}
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Display name
            <input
              type="text"
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. Home, Barcelona, Office"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Address or notes (optional)
            <input
              type="text"
              value={manualAddress}
              onChange={(event) => setManualAddress(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyManualLocation}
              className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white"
            >
              Use manual location
            </button>
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {!mapsConfigured ? (
            <p className="text-xs text-amber-700">
              Set <code className="text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for address
              autocomplete, or use manual entry.
            </p>
          ) : null}
          {placesError ? <p className="text-xs text-amber-700">{placesError}</p> : null}
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Search for a place or address
            <input
              type="text"
              value={query}
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                if (!next.trim()) setSuggestions([]);
              }}
              disabled={!mapsConfigured || !placesReady}
              className="rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
              placeholder="Start typing…"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-controls={listId}
            />
          </label>
          {showSuggestions ? (
            <ul id={listId} className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white">
              {suggestions.map((suggestion) => (
                <li key={suggestion.placeId}>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => void selectPlace(suggestion.placeId, suggestion.description)}
                  >
                    {suggestion.description}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="self-start text-sm text-gray-600 hover:text-gray-900"
          >
            Enter location manually
          </button>
        </>
      )}
    </fieldset>
  );
}
