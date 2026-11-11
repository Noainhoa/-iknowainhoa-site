"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useLifeRecovery } from "@/components/life/useLifeRecovery";
import { getLifeSupabase, lifeSupabaseConfigured } from "@/lib/life/supabase";

/** Auth-only Life session for OS/NOA — no timeline bootstrap. */
export function useLifeAuth() {
  const configured = lifeSupabaseConfigured();
  const supabase = getLifeSupabase();

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { recoveryMode, finishRecovery } = useLifeRecovery(supabase);

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
  }

  return {
    configured,
    supabase,
    sessionEmail,
    userId,
    authBusy,
    authError,
    recoveryMode,
    finishRecovery,
    handleLogin,
    handleSignOut,
  };
}
