"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import EntryDetail from "@/components/life/detail/EntryDetail";
import LifeDetailPanel, { LifeDetailEmpty } from "@/components/life/detail/LifeDetailPanel";
import EntryForm, { type EntryFormPayload } from "@/components/life/EntryForm";
import GroupForm from "@/components/life/GroupForm";
import LifeLoginForm from "@/components/life/LifeLoginForm";
import LifeNavigator from "@/components/life/navigator/LifeNavigator";
import TrackForm from "@/components/life/TrackForm";
import {
  createLifeEntry,
  createLifeGroup,
  createLifeTrack,
  deleteLifeEntry,
  deleteLifeGroup,
  deleteLifeTrack,
  nextSortOrder,
  updateLifeEntry,
  updateLifeGroup,
  updateLifeTrack,
} from "@/lib/life/db";
import { formatLifeErrorForPanel } from "@/lib/life/errors";
import { resolveLifeLocationId } from "@/lib/life/locations";
import { bootstrapLifeData, getLifeClientDebugInfo } from "@/lib/life/startup";
import { getLifeSupabase, lifeSupabaseConfigured } from "@/lib/life/supabase";
import type { LifeEntry, LifeGroup } from "@/lib/life/types";

type Workspace =
  | { kind: "idle" }
  | { kind: "new-group" }
  | { kind: "edit-group"; groupId: string }
  | { kind: "new-track"; groupId: string }
  | { kind: "edit-track"; groupId: string; trackId: string }
  | { kind: "new-entry"; trackId: string; trackName: string }
  | { kind: "edit-entry"; entryId: string };

const SCHEMA_HINT =
  "If this is a schema/RLS issue, confirm supabase/life.sql was run in the ainhoa-life project.";

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

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function findEntryInGroups(groups: LifeGroup[], entryId: string): LifeEntry | undefined {
  for (const group of groups) {
    for (const track of group.tracks) {
      const entry = track.entries.find((item) => item.id === entryId);
      if (entry) return entry;
    }
  }
  return undefined;
}

function findTrackMeta(groups: LifeGroup[], trackId: string) {
  for (const group of groups) {
    const track = group.tracks.find((item) => item.id === trackId);
    if (track) return { group, track };
  }
  return undefined;
}

export default function LifeShell() {
  const configured = lifeSupabaseConfigured();
  const supabase = getLifeSupabase();

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [groups, setGroups] = useState<LifeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>({ kind: "idle" });
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(() => new Set());

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
    setWorkspace({ kind: "idle" });
    setSelectedEntryId(null);
  }

  async function runMutation(task: () => Promise<void>): Promise<boolean> {
    setBusy(true);
    setLoadError(null);
    try {
      await task();
      await reload();
      return true;
    } catch (error) {
      console.error("[life] mutation failed", error);
      setLoadError(`${formatLoadError(error, userId)}\n\n${SCHEMA_HINT}`);
      return false;
    } finally {
      setBusy(false);
    }
  }

  function findGroup(groupId: string) {
    return groups.find((group) => group.id === groupId);
  }

  const selectedEntry = selectedEntryId
    ? findEntryInGroups(groups, selectedEntryId)
    : undefined;
  const selectedTrackMeta = selectedEntry
    ? findTrackMeta(groups, selectedEntry.trackId)
    : undefined;

  async function saveEntry(
    trackId: string,
    payload: EntryFormPayload,
    existingEntryId?: string
  ) {
    if (!supabase || !userId) return;
    setBusy(true);
    setLoadError(null);
    try {
      const locationId =
        payload.location === null
          ? null
          : await resolveLifeLocationId(supabase, userId, payload.location);
      const input = {
        trackId,
        locationId,
        title: payload.title,
        entryType: payload.entryType,
        startDate: payload.startDate,
        startPrecision: payload.startPrecision,
        endDate: payload.endDate,
        endPrecision: payload.endPrecision,
        isOngoing: payload.isOngoing,
        notes: payload.notes,
      };

      let nextEntryId = existingEntryId ?? null;
      if (existingEntryId) {
        await updateLifeEntry(supabase, existingEntryId, input);
      } else {
        const created = await createLifeEntry(supabase, userId, input);
        nextEntryId = created.id;
      }

      const tree = await reload();
      if (nextEntryId && findEntryInGroups(tree, nextEntryId)) {
        setSelectedEntryId(nextEntryId);
      }
      setWorkspace({ kind: "idle" });
    } catch (error) {
      console.error("[life] mutation failed", error);
      setLoadError(`${formatLoadError(error, userId)}\n\n${SCHEMA_HINT}`);
    } finally {
      setBusy(false);
    }
  }

  if (!configured || !supabase) {
    return (
      <p className="text-sm text-gray-600">
        Configure <code className="text-xs">NEXT_PUBLIC_LIFE_SUPABASE_URL</code> and{" "}
        <code className="text-xs">NEXT_PUBLIC_LIFE_SUPABASE_PUBLISHABLE_KEY</code>, then run{" "}
        <code className="text-xs">supabase/life.sql</code> in the ainhoa-life project.
      </p>
    );
  }

  if (!sessionEmail) {
    return <LifeLoginForm onSubmit={handleLogin} busy={authBusy} error={authError} />;
  }

  const editingEntry =
    workspace.kind === "edit-entry"
      ? findEntryInGroups(groups, workspace.entryId)
      : undefined;
  const editingEntryTrack =
    editingEntry ? findTrackMeta(groups, editingEntry.trackId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Life</h1>
            <p className="text-gray-600">Signed in as {sessionEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      {loadError ? (
        <p className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      {loading && groups.length === 0 ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:items-start">
          <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]">
            <LifeNavigator
              groups={groups}
              collapsedGroupIds={collapsedGroupIds}
              selectedEntryId={selectedEntryId}
              onToggleGroupCollapsed={(groupId) => {
                setCollapsedGroupIds((current) => {
                  const next = new Set(current);
                  if (next.has(groupId)) next.delete(groupId);
                  else next.add(groupId);
                  return next;
                });
              }}
              onNewGroup={() => setWorkspace({ kind: "new-group" })}
              onGroupVisibilityChange={(groupId, isVisible) => {
                void runMutation(async () => {
                  await updateLifeGroup(supabase, groupId, { isVisible });
                });
              }}
              onTrackVisibilityChange={(trackId, isVisible) => {
                void runMutation(async () => {
                  await updateLifeTrack(supabase, trackId, { isVisible });
                });
              }}
              onAddEntry={(trackId, trackName) => {
                setSelectedEntryId(null);
                setWorkspace({ kind: "new-entry", trackId, trackName });
              }}
              onEditGroup={(groupId) => setWorkspace({ kind: "edit-group", groupId })}
              onDeleteGroup={(groupId) => {
                if (!window.confirm("Delete this group and all its tracks and entries?")) {
                  return;
                }
                const removedEntryIds = new Set(
                  findGroup(groupId)?.tracks.flatMap((track) =>
                    track.entries.map((entry) => entry.id)
                  ) ?? []
                );
                void runMutation(async () => {
                  await deleteLifeGroup(supabase, groupId);
                  setSelectedEntryId((current) =>
                    current && removedEntryIds.has(current) ? null : current
                  );
                  setWorkspace({ kind: "idle" });
                });
              }}
              onNewTrack={(groupId) => setWorkspace({ kind: "new-track", groupId })}
              onEditTrack={(trackId, groupId) =>
                setWorkspace({ kind: "edit-track", trackId, groupId })
              }
              onDeleteTrack={(trackId) => {
                if (!window.confirm("Delete this track and all its entries?")) return;
                void runMutation(async () => {
                  await deleteLifeTrack(supabase, trackId);
                  if (selectedEntry?.trackId === trackId) {
                    setSelectedEntryId(null);
                  }
                  setWorkspace({ kind: "idle" });
                });
              }}
              onSelectEntry={(entry) => {
                setSelectedEntryId(entry.id);
                setWorkspace({ kind: "idle" });
              }}
            />
          </div>

          <LifeDetailPanel>
            {workspace.kind === "new-group" ? (
              <GroupForm
                submitLabel="Create group"
                busy={busy}
                onCancel={() => setWorkspace({ kind: "idle" })}
                onSubmit={async (name) => {
                  if (!userId) return;
                  const ok = await runMutation(async () => {
                    await createLifeGroup(supabase, userId, {
                      name,
                      order: nextSortOrder(groups),
                    });
                  });
                  if (ok) setWorkspace({ kind: "idle" });
                }}
              />
            ) : null}

            {workspace.kind === "edit-group" ? (
              <GroupForm
                initialName={findGroup(workspace.groupId)?.name}
                submitLabel="Save group"
                busy={busy}
                onCancel={() => setWorkspace({ kind: "idle" })}
                onSubmit={async (name) => {
                  const ok = await runMutation(async () => {
                    await updateLifeGroup(supabase, workspace.groupId, { name });
                  });
                  if (ok) setWorkspace({ kind: "idle" });
                }}
              />
            ) : null}

            {workspace.kind === "new-track" ? (
              <TrackForm
                submitLabel="Create track"
                busy={busy}
                onCancel={() => setWorkspace({ kind: "idle" })}
                onSubmit={async (name) => {
                  if (!userId) return;
                  const group = findGroup(workspace.groupId);
                  const ok = await runMutation(async () => {
                    await createLifeTrack(supabase, userId, {
                      groupId: workspace.groupId,
                      name,
                      order: nextSortOrder(group?.tracks ?? []),
                    });
                  });
                  if (ok) setWorkspace({ kind: "idle" });
                }}
              />
            ) : null}

            {workspace.kind === "edit-track" ? (
              <TrackForm
                initialName={findTrackMeta(groups, workspace.trackId)?.track.name}
                submitLabel="Save track"
                busy={busy}
                onCancel={() => setWorkspace({ kind: "idle" })}
                onSubmit={async (name) => {
                  const ok = await runMutation(async () => {
                    await updateLifeTrack(supabase, workspace.trackId, { name });
                  });
                  if (ok) setWorkspace({ kind: "idle" });
                }}
              />
            ) : null}

            {workspace.kind === "new-entry" ? (
              <EntryForm
                trackName={workspace.trackName}
                busy={busy}
                onCancel={() => setWorkspace({ kind: "idle" })}
                onSubmit={async (payload) => {
                  await saveEntry(workspace.trackId, payload);
                }}
              />
            ) : null}

            {workspace.kind === "edit-entry" && editingEntry && editingEntryTrack ? (
              <EntryForm
                trackName={editingEntryTrack.track.name}
                initial={editingEntry}
                busy={busy}
                onCancel={() => setWorkspace({ kind: "idle" })}
                onSubmit={async (payload) => {
                  await saveEntry(editingEntry.trackId, payload, editingEntry.id);
                }}
              />
            ) : null}

            {workspace.kind === "idle" && selectedEntry && selectedTrackMeta ? (
              <EntryDetail
                entry={selectedEntry}
                trackName={selectedTrackMeta.track.name}
                groupName={selectedTrackMeta.group.name}
                onEdit={() =>
                  setWorkspace({ kind: "edit-entry", entryId: selectedEntry.id })
                }
                onDelete={() => {
                  if (!window.confirm("Delete this entry?")) return;
                  void runMutation(async () => {
                    await deleteLifeEntry(supabase, selectedEntry.id);
                    setSelectedEntryId(null);
                    setWorkspace({ kind: "idle" });
                  });
                }}
              />
            ) : null}

            {workspace.kind === "idle" && !selectedEntry ? <LifeDetailEmpty /> : null}
          </LifeDetailPanel>
        </div>
      )}
    </div>
  );
}
