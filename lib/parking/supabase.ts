import { createClient as createBrowserClient } from "@/utils/supabase/client";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function supabaseEnvReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getParkingSupabase() {
  if (!supabaseEnvReady()) return null;

  if (typeof window === "undefined") {
    // Client components call this in the browser; server pages should use
    // utils/supabase/server.createClient instead.
    return createBrowserClient();
  }

  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}

export function parkingSupabaseConfigured(): boolean {
  return supabaseEnvReady();
}
