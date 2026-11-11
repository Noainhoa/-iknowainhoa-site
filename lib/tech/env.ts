/**
 * Tech Made Easy uses a dedicated Supabase project.
 * Never fall back to parking (`NEXT_PUBLIC_SUPABASE_*`) or Life (`NEXT_PUBLIC_LIFE_*`).
 *
 * Publishable helpers are safe for browser imports.
 * Service-role access lives only in `lib/tech/server.ts` (server-only).
 */

function hostOf(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    return new URL(url.trim()).host.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Fail closed when Tech URL is missing/invalid or coincides with parking (or Life).
 */
export function assertTechUrlIsolated(techUrl: string): boolean {
  const techHost = hostOf(techUrl);
  if (!techHost) return false;

  const parkingHost = hostOf(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (parkingHost && techHost === parkingHost) return false;

  const lifeHost = hostOf(process.env.NEXT_PUBLIC_LIFE_SUPABASE_URL);
  if (lifeHost && techHost === lifeHost) return false;

  return true;
}

/** Publishable/anon credentials for browser + SSR auth (never the service role). */
export function getTechPublicEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_TECH_SUPABASE_URL?.trim() || "";
  const key =
    process.env.NEXT_PUBLIC_TECH_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_TECH_SUPABASE_ANON_KEY?.trim() ||
    "";
  if (!url || !key) return null;
  if (!assertTechUrlIsolated(url)) return null;
  return { url, key };
}

export function isTechSupabaseConfigured(): boolean {
  return getTechPublicEnv() !== null;
}
