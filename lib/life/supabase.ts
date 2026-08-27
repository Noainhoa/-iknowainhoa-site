import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLifeSupabaseEnv, isLifeSupabaseConfigured } from "@/lib/life/env";

let browserClient: SupabaseClient | null = null;
let browserClientUrl: string | null = null;

export function getLifeSupabase(): SupabaseClient | null {
  if (!isLifeSupabaseConfigured()) return null;

  const { url, key } = getLifeSupabaseEnv();

  if (typeof window !== "undefined" && browserClient && browserClientUrl !== url) {
    browserClient = null;
  }

  if (typeof window === "undefined") {
    return createBrowserClient(url!, key!);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url!, key!);
    browserClientUrl = url ?? null;
    console.error("[life] createBrowserClient", { supabaseHost: safeLifeHost(url) });
  }
  return browserClient;
}

function safeLifeHost(url: string | undefined): string {
  if (!url) return "(missing)";
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function lifeSupabaseConfigured(): boolean {
  return isLifeSupabaseConfigured();
}
