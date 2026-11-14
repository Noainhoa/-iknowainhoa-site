import type { Locale } from "@/lib/i18n/shared";
import type { ParkingSeason } from "@/lib/parking/pricing";

/**
 * Privacy-safe parking analytics stubs.
 * Never send name, registration, comments, or other enquiry PII.
 * Plug a real measurement ID (GA4 / Plausible) in trackParkingEvent when ready.
 */
export type ParkingAnalyticsEvent =
  | { name: "parking_view"; language: Locale }
  | {
      name: "parking_dates_selected";
      language: Locale;
      stayDays: number;
      season: ParkingSeason | "mixed";
      hasQuote: boolean;
    }
  | {
      name: "parking_whatsapp_click";
      language: Locale;
      stayDays: number;
      season: ParkingSeason | "mixed";
      hasQuote: boolean;
    }
  | { name: "parking_map_click"; language: Locale }
  | { name: "parking_google_listing_click"; language: Locale }
  | { name: "parking_whatsapp_tonight_click"; language: Locale }
  | { name: "parking_whatsapp_contact_click"; language: Locale }
  | { name: "parking_language_change"; language: Locale; to: Locale }
  | { name: "parking_form_error"; language: Locale; errorKeys: string[] };

export function trackParkingEvent(event: ParkingAnalyticsEvent): void {
  if (typeof window === "undefined") return;

  // Development visibility only — no network calls until a vendor is configured.
  if (process.env.NODE_ENV === "development") {
    console.debug("[parking-analytics]", event);
  }

  // Example when GA4 is configured:
  // window.gtag?.("event", event.name, { ...sanitized props });
}
