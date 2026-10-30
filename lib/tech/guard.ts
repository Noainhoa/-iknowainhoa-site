import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RATE_MAX_PER_IP, RATE_MAX_PER_PHONE, RATE_WINDOW_SECONDS } from "@/lib/tech/constants";

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

export function rateBucket(action: string, value: string): string {
  return createHash("sha256").update(`${action}:${value}`).digest("hex").slice(0, 40);
}

export async function allowRate(
  client: SupabaseClient,
  bucket: string,
  max: number
): Promise<boolean> {
  const { data, error } = await client.rpc("tech_bump_rate", {
    p_bucket: bucket,
    p_max: max,
    p_window_seconds: RATE_WINDOW_SECONDS,
  });
  if (error) throw error;
  return data === true;
}

export async function allowPublicWrite(
  client: SupabaseClient,
  request: Request,
  phoneKey: string,
  action: string
): Promise<boolean> {
  const ipOk = await allowRate(
    client,
    rateBucket(`${action}-ip`, clientAddress(request)),
    RATE_MAX_PER_IP
  );
  if (!ipOk) return false;
  return allowRate(client, rateBucket(`${action}-phone`, phoneKey), RATE_MAX_PER_PHONE);
}
