/** Minimal Google Maps Places types for Life location picker. */
export {};

declare global {
  namespace google.maps.places {
    interface AutocompletePrediction {
      place_id: string;
      description: string;
      structured_formatting?: {
        main_text: string;
        secondary_text?: string;
      };
    }

    interface PlaceResult {
      place_id?: string;
      name?: string;
      formatted_address?: string;
      geometry?: {
        location?: {
          lat(): number;
          lng(): number;
        };
      };
      address_components?: google.maps.GeocoderAddressComponent[];
    }

    class AutocompleteService {
      getPlacePredictions(
        request: {
          input: string;
          types?: string[];
        },
        callback: (
          predictions: AutocompletePrediction[] | null,
          status: string
        ) => void
      ): void;
    }

    class PlacesService {
      constructor(attrContainer: HTMLDivElement);
      getDetails(
        request: { placeId: string; fields: string[] },
        callback: (place: PlaceResult | null, status: string) => void
      ): void;
    }

    const PlacesServiceStatus: {
      OK: string;
    };
  }

  namespace google.maps {
    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }
  }

  interface Window {
    google?: {
      maps?: {
        places?: typeof google.maps.places;
      };
    };
  }
}
