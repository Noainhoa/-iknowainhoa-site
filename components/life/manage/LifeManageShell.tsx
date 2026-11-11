"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EntryDetail from "@/components/life/detail/EntryDetail";
import LifeDetailPanel, { LifeDetailEmpty } from "@/components/life/detail/LifeDetailPanel";
import EntryForm, { type EntryFormPayload } from "@/components/life/EntryForm";
import GroupForm from "@/components/life/GroupForm";
import LifeLoginForm from "@/components/life/LifeLoginForm";
import LifeSetPasswordForm from "@/components/life/LifeSetPasswordForm";
import LifeNavigator from "@/components/life/navigator/LifeNavigator";
import BulkSkeletonImporter from "@/components/life/manage/BulkSkeletonImporter";
import TrackForm from "@/components/life/TrackForm";
import { useLifeSession } from "@/components/life/useLifeSession";
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
import { resolveLifeLocationId } from "@/lib/life/locations";
import type { LifeEntry, LifeGroup } from "@/lib/life/types";

type Workspace =
  | { kind: "idle" }
  | { kind: "new-group" }
  | { kind: "edit-group"; groupId: string }
  | { kind: "new-track"; groupId: string }
  | { kind: "edit-track"; groupId: string; trackId: string }
  | { kind: "new-entry"; trackId: string; trackName: string }
  | { kind: "edit-entry"; entryId: string };

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

export default function LifeManageShell() {
  const searchParams = useSearchParams();
  const {
    configured,
    supabase,
    sessionEmail,
    userId,
    authBusy,
    authError,
    recoveryMode,
    finishRecovery,
    groups,
    loading,
    loadError,
    setLoadError,
    reload,
    handleLogin,
    handleSignOut,
    formatLoadError,
    schemaHint,
  } = useLifeSession();

  const [busy, setBusy] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>({ kind: "idle" });
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(() => new Set());
  const [entryDeepLinkHandled, setEntryDeepLinkHandled] = useState(false);

  useEffect(() => {
    if (entryDeepLinkHandled || groups.length === 0) return;
    const entryId = searchParams.get("entry");
    if (!entryId) {
      setEntryDeepLinkHandled(true);
      return;
    }
    if (findEntryInGroups(groups, entryId)) {
      setSelectedEntryId(entryId);
      setWorkspace({ kind: "idle" });
    }
    setEntryDeepLinkHandled(true);
  }, [entryDeepLinkHandled, groups, searchParams]);

  async function runMutation(task: () => Promise<void>): Promise<boolean> {
    if (!supabase) return false;
    setBusy(true);
    setLoadError(null);
    try {
      await task();
      await reload();
      return true;
    } catch (error) {
      console.error("[life] mutation failed", error);
      setLoadError(`${formatLoadError(error)}\n\n${schemaHint}`);
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
        entryStatus: payload.entryStatus,
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
      setLoadError(`${formatLoadError(error)}\n\n${schemaHint}`);
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

  if (recoveryMode) {
    return <LifeSetPasswordForm onDone={finishRecovery} />;
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
            <p className="mb-1 flex flex-wrap gap-3">
              <Link href="/life" className="text-sm text-gray-600 hover:text-gray-900">
                ← Timeline
              </Link>
              <Link href="/life/os" className="text-sm text-gray-600 hover:text-gray-900">
                OS
              </Link>
              <Link href="/life/noa" className="text-sm text-gray-600 hover:text-gray-900">
                NOA
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Life · Manage</h1>
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

      {userId && supabase ? (
        <BulkSkeletonImporter
          supabase={supabase}
          userId={userId}
          groups={groups}
          onImported={async () => {
            await reload();
          }}
        />
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
