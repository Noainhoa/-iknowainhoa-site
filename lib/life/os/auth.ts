import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { getLifeSupabaseEnv, isLifeSupabaseConfigured } from "@/lib/life/env";

export type LifeAuthedContext = {
  supabase: SupabaseClient;
  user: User;
  accessToken: string;
};

export async function getLifeAuthedContext(
  request: Request
): Promise<LifeAuthedContext | null> {
  if (!isLifeSupabaseConfigured()) return null;

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;

  const accessToken = match[1]!.trim();
  if (!accessToken) return null;

  const { url, key } = getLifeSupabaseEnv();
  const supabase = createClient(url!, key!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(accessToken).catch(() => ({ data: { user: null }, error: true }));
  if (error || !data.user) return null;

  return { supabase, user: data.user, accessToken };
}

export async function getLifeAccessToken(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) return null;
  return data.session.access_token;
}
