import type { SupabaseClient } from "@supabase/supabase-js";
import { LIFE_DEFAULT_TEMPLATE } from "@/lib/life/default-template";
import { failLifeOperation, LifeOperationError, logLifeOperation } from "@/lib/life/errors";
import { getLifeSupabaseEnv } from "@/lib/life/env";
import type { DbLifeGroup, LifeGroup } from "@/lib/life/types";
import { fetchLifeTree } from "@/lib/life/db";

function lifeSupabaseHost(): string {
  const { url } = getLifeSupabaseEnv();
  if (!url) return "(missing NEXT_PUBLIC_LIFE_SUPABASE_URL)";
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** Step 1 — count existing groups visible to the authenticated user (RLS). */
export async function readLifeGroupsCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const supabaseUrl = lifeSupabaseHost();
  const result = await supabase.from("life_groups").select("id", { count: "exact", head: true });

  if (result.error) {
    failLifeOperation("read_life_groups", result.error, result.data, result.status);
  }

  logLifeOperation("read_life_groups", {
    ok: true,
    userId,
    supabaseUrl,
    count: result.count,
    data: result.data,
    status: result.status,
  });

  return result.count ?? 0;
}

/** Steps 3–4 — seed default groups/tracks when count is zero. */
export async function initializeLifeIfEmpty(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const supabaseUrl = lifeSupabaseHost();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    failLifeOperation("auth_get_user", authError, authData, authError.status);
  }

  const authUserId = authData.user?.id ?? null;
  if (!authUserId) {
    const failure = {
      message: "No authenticated Life user in session.",
      code: "life_no_auth_user",
      status: 401,
    };
    logLifeOperation("auth_get_user", { ok: false, userId, supabaseUrl, error: failure, data: authData });
    throw new LifeOperationError("auth_get_user", failure, authData);
  }

  if (authUserId !== userId) {
    const failure = {
      message: "React state userId does not match Life Supabase auth session user id.",
      code: "life_user_id_mismatch",
    };
    logLifeOperation("auth_user_id_mismatch", {
      ok: false,
      userId,
      supabaseUrl,
      error: failure,
      data: { stateUserId: userId, authUserId },
    });
    throw new LifeOperationError("auth_user_id_mismatch", failure, { stateUserId: userId, authUserId });
  }

  logLifeOperation("initializeLifeIfEmpty", {
    ok: true,
    userId: authUserId,
    supabaseUrl,
    extra: { phase: "auth_verified", authEmail: authData.user?.email ?? null },
  });

  const count = await readLifeGroupsCount(supabase, authUserId);
  if (count > 0) {
    logLifeOperation("initializeLifeIfEmpty", {
      ok: true,
      userId: authUserId,
      supabaseUrl,
      count,
      extra: { phase: "skipped_existing_groups" },
    });
    return;
  }

  for (const groupTemplate of LIFE_DEFAULT_TEMPLATE) {
    const operation = `insert_life_group:${groupTemplate.name}`;
    const insertResult = await supabase
      .from("life_groups")
      .insert({
        user_id: authUserId,
        name: groupTemplate.name,
        sort_order: groupTemplate.order,
        is_visible: true,
      })
      .select("*")
      .single();

    if (insertResult.error) {
      failLifeOperation(operation, insertResult.error, insertResult.data, insertResult.status);
    }

    const group = insertResult.data as DbLifeGroup;
    logLifeOperation(operation, {
      ok: true,
      userId: authUserId,
      supabaseUrl,
      data: { groupId: group.id, groupUserId: group.user_id },
      status: insertResult.status,
      extra: {
        seededUserId: authUserId,
        returnedUserId: group.user_id,
        userIdMatch: group.user_id === authUserId,
      },
    });

    if (group.user_id !== authUserId) {
      const failure = {
        message: "Inserted life_group user_id does not match authenticated user.",
        code: "life_group_user_id_mismatch",
      };
      logLifeOperation(`${operation}:user_id_check`, {
        ok: false,
        userId: authUserId,
        supabaseUrl,
        error: failure,
        data: group,
      });
      throw new LifeOperationError(`${operation}:user_id_check`, failure, group);
    }

    if (groupTemplate.tracks.length === 0) continue;

    const trackRows = groupTemplate.tracks.map((track) => ({
      user_id: authUserId,
      group_id: group.id,
      name: track.name,
      sort_order: track.order,
      is_visible: true,
    }));

    const tracksOperation = `insert_life_tracks:${groupTemplate.name}`;
    const tracksResult = await supabase.from("life_tracks").insert(trackRows).select("id, user_id, group_id");

    if (tracksResult.error) {
      failLifeOperation(tracksOperation, tracksResult.error, tracksResult.data, tracksResult.status);
    }

    logLifeOperation(tracksOperation, {
      ok: true,
      userId: authUserId,
      supabaseUrl,
      data: tracksResult.data,
      status: tracksResult.status,
      extra: {
        groupId: group.id,
        trackCount: trackRows.length,
        allTracksOwnedByUser: (tracksResult.data ?? []).every(
          (row: { user_id?: string; group_id?: string }) =>
            row.user_id === authUserId && row.group_id === group.id
        ),
      },
    });
  }

  logLifeOperation("initializeLifeIfEmpty", {
    ok: true,
    userId: authUserId,
    supabaseUrl,
    extra: { phase: "seed_complete" },
  });
}

/** Full startup path: verify auth → init if empty → fetch tree. */
export async function bootstrapLifeData(
  supabase: SupabaseClient,
  userId: string
): Promise<LifeGroup[]> {
  const supabaseUrl = lifeSupabaseHost();
  logLifeOperation("bootstrapLifeData", {
    ok: true,
    userId,
    supabaseUrl,
    extra: { phase: "start" },
  });

  await initializeLifeIfEmpty(supabase, userId);

  try {
    const tree = await fetchLifeTree(supabase, userId);
    logLifeOperation("bootstrapLifeData", {
      ok: true,
      userId,
      supabaseUrl,
      count: tree.length,
      extra: { phase: "complete" },
    });
    return tree;
  } catch (error) {
    logLifeOperation("bootstrapLifeData", {
      ok: false,
      userId,
      supabaseUrl,
      error,
      extra: { phase: "fetchLifeTree_failed" },
    });
    throw error;
  }
}

export function getLifeClientDebugInfo(): { supabaseHost: string; configured: boolean } {
  const { url, key } = getLifeSupabaseEnv();
  return {
    configured: Boolean(url && key),
    supabaseHost: lifeSupabaseHost(),
  };
}
