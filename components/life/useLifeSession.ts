"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { formatLifeErrorForPanel } from "@/lib/life/errors";
import { bootstrapLifeData, getLifeClientDebugInfo } from "@/lib/life/startup";
import { getLifeSupabase, lifeSupabaseConfigured } from "@/lib/life/supabase";
import type { LifeGroup } from "@/lib/life/types";

const SCHEMA_HINT =
  "If this is a schema/RLS issue, confirm supabase/life.sql was run in the ainhoa-life project.";

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function formatLoadError(error: unknown, userId: string | null): string {
  const client = getLifeClientDebugInfo();
  return formatLifeErrorForPanel(error, {
    lifeSupabaseHost: client.supabaseHost,
    lifeSupabaseConfigured: String(client.configured),
    authUserId: userId ?? "(none)",
    parkingSupabaseHost: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? safeHost(process.env.NEXT_PUBLIC_SUPABASE_URL)
      : "(not in client bundle for comparison)",
  });
}

export function useLifeSession() {
  const configured = lifeSupabaseConfigured();
  const supabase = getLifeSupabase();

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [groups, setGroups] = useState<LifeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<LifeGroup[]> => {
    if (!supabase || !userId) return [];
    setLoading(true);
    setLoadError(null);
    try {
      const tree = await bootstrapLifeData(supabase, userId);
      setGroups(tree);
      return tree;
    } catch (error) {
      console.error("[life] reload failed", error);
      setLoadError(`${formatLoadError(error, userId)}\n\n${SCHEMA_HINT}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
      setUserId(data.session?.user.id ?? null);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSessionEmail(session?.user.email ?? null);
        setUserId(session?.user.id ?? null);
      }
    );
    return () => subscription.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (userId) void reload();
  }, [userId, reload]);

  async function handleLogin(email: string, password: string) {
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (error) setAuthError(error.message);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setGroups([]);
  }

  return {
    configured,
    supabase,
    sessionEmail,
    userId,
    authBusy,
    authError,
    groups,
    loading,
    loadError,
    setLoadError,
    reload,
    handleLogin,
    handleSignOut,
    formatLoadError: (error: unknown) => formatLoadError(error, userId),
    schemaHint: SCHEMA_HINT,
  };
}
