import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/utils/supabase/env";

export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url!, key!);
}
