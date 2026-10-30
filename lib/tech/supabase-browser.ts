"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getTechPublicEnv } from "@/lib/tech/env";

/** Browser auth client for Tech admin — Tech project only. */
export function createTechBrowserClient() {
  const env = getTechPublicEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.key);
}
