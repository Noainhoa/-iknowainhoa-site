import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertTechUrlIsolated } from "@/lib/tech/env";

function getTechServiceEnv(): { url: string; serviceRoleKey: string } | null {
  const url = process.env.NEXT_PUBLIC_TECH_SUPABASE_URL?.trim() || "";
  // Server-only secret. Do not expose to the browser. Do not reuse parking keys.
  const serviceRoleKey = process.env.TECH_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  if (!url || !serviceRoleKey) return null;
  if (!assertTechUrlIsolated(url)) return null;
  return { url, serviceRoleKey };
}

export function isTechServiceConfigured(): boolean {
  return getTechServiceEnv() !== null;
}

/** Service-role client for public booking APIs. Null = refuse (fail closed). */
export function getTechServiceClient(): SupabaseClient | null {
  const env = getTechServiceEnv();
  if (!env) return null;
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
