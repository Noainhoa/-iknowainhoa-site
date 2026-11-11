"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

function recoveryInLocation(): boolean {
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return hash.get("type") === "recovery" || query.get("type") === "recovery";
}

/** Detects a Supabase password-recovery landing and clears it after a new password is saved. */
export function useLifeRecovery(supabase: SupabaseClient | null) {
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    if (recoveryInLocation()) setRecoveryMode(true);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  function finishRecovery() {
    setRecoveryMode(false);
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("type");
    url.searchParams.delete("code");
    const search = url.searchParams.toString();
    window.history.replaceState({}, "", url.pathname + (search ? `?${search}` : ""));
  }

  return { recoveryMode, finishRecovery };
}
