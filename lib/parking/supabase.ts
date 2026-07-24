import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getParkingSupabase() {
  if (!isSupabaseConfigured()) return null;

  if (typeof window === "undefined") {
    return createBrowserClient();
  }

  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}

export function parkingSupabaseConfigured(): boolean {
  return isSupabaseConfigured();
}
