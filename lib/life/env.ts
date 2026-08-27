/** Life feature Supabase project (ainhoa-life) — separate from Parking. */
export function getLifeSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_LIFE_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_LIFE_SUPABASE_PUBLISHABLE_KEY;
  return { url, key };
}

export function isLifeSupabaseConfigured(): boolean {
  const { url, key } = getLifeSupabaseEnv();
  return Boolean(url && key);
}
