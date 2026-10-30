import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getTechPublicEnv } from "@/lib/tech/env";

/** SSR auth client for Tech admin routes — Tech project only (publishable key). */
export async function createTechServerClient() {
  const env = getTechPublicEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component — middleware may refresh sessions.
        }
      },
    },
  });
}
