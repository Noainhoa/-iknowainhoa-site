"use client";

import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildBulkImportPreview,
  executeBulkSkeletonImport,
  type BulkImportPreview,
} from "@/lib/life/bulk-skeleton-import";
import {
  createLifeEntry,
  createLifeGroup,
  createLifeTrack,
  fetchLifeTree,
} from "@/lib/life/db";
import { formatLifeEntrySummary } from "@/lib/life/format";
import type { LifeGroup } from "@/lib/life/types";

type BulkSkeletonImporterProps = {
  supabase: SupabaseClient;
  userId: string;
  groups: LifeGroup[];
  onImported: () => Promise<void>;
};

export default function BulkSkeletonImporter({
  supabase,
  userId,
  groups,
  onImported,
}: BulkSkeletonImporterProps) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<BulkImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const previewSummary = useMemo(() => {
    if (!preview) return null;
    return {
      create: preview.entriesToCreate.length,
      groups: preview.groupsToCreate.length,
      tracks: preview.tracksToCreate.length,
      duplicates: preview.duplicates.length,
      invalid: preview.invalid.length,
    };
  }, [preview]);

  function handlePreview() {
    setError(null);
    setResult(null);
    setPreview(buildBulkImportPreview(text, groups));
  }

  async function handleImport() {
    if (!preview) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const importResult = await executeBulkSkeletonImport({
        groups,
        preview,
        createGroup: async (name, order) => {
          const row = await createLifeGroup(supabase, userId, { name, order });
          return { id: row.id, name: row.name };
        },
        createTrack: async (groupId, name, order) => {
          const row = await createLifeTrack(supabase, userId, { groupId, name, order });
          return { id: row.id, name: row.name, groupId: row.group_id };
        },
        createEntry: async (input) => {
          await createLifeEntry(supabase, userId, {
            trackId: input.trackId,
            locationId: null,
            title: input.title,
            entryType: "event",
            startDate: input.startDate,
            startPrecision: input.startPrecision,
            endDate: null,
            endPrecision: null,
            isOngoing: false,
            notes: input.notes,
            entryStatus: "skeleton",
          });
        },
        getFreshGroups: () => fetchLifeTree(supabase, userId),
      });

      await onImported();
      setResult(
        `Imported ${importResult.entriesCreated} entries` +
          ` (${importResult.groupsCreated} groups, ${importResult.tracksCreated} tracks created;` +
          ` ${importResult.skippedDuplicates} duplicates skipped).`
      );
      setPreview(null);
      setText("");
    } catch (importError) {
      console.error("[life] bulk import failed", importError);
      setError(importError instanceof Error ? importError.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800"
        aria-expanded={expanded}
      >
        Bulk skeleton import
        <span className="text-gray-500">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-gray-200 px-4 py-4">
          <p className="text-sm text-gray-600">
            Paste rows as{" "}
            <code className="text-xs">
              DATE | PRECISION | GROUP | TRACK | TITLE | TYPE | STATUS | NOTES
            </code>
            . Preview before import. All imported entries are saved as{" "}
            <span className="italic text-gray-500">skeleton</span>.
          </p>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            placeholder="2019 | year | SKILLS | Piano | Started learning piano | event | skeleton |"
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePreview}
              disabled={!text.trim() || busy}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Preview
            </button>
            {preview ? (
              <button
                type="button"
                onClick={() => void handleImport()}
                disabled={busy || preview.entriesToCreate.length === 0}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "Importing…" : "Import"}
              </button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {result ? <p className="text-sm text-gray-700">{result}</p> : null}

          {preview && previewSummary ? (
            <div className="space-y-3 text-sm">
              <p className="text-gray-700">
                Preview: {previewSummary.create} to create · {previewSummary.groups} groups ·{" "}
                {previewSummary.tracks} tracks · {previewSummary.duplicates} duplicates ·{" "}
                {previewSummary.invalid} invalid
              </p>

              {preview.groupsToCreate.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Groups to create
                  </h3>
                  <ul className="mt-1 list-inside list-disc text-gray-700">
                    {preview.groupsToCreate.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {preview.tracksToCreate.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tracks to create
                  </h3>
                  <ul className="mt-1 space-y-1 text-gray-700">
                    {preview.tracksToCreate.map((track) => (
                      <li key={`${track.groupName}/${track.trackName}`}>
                        {track.groupName} → {track.trackName}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {preview.entriesToCreate.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Entries to create
                  </h3>
                  <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto text-gray-700">
                    {preview.entriesToCreate.map((entry) => (
                      <li key={`${entry.lineNumber}-${entry.title}`}>
                        {entry.rawDate} · {entry.groupName} / {entry.trackName} · {entry.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {preview.duplicates.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Duplicates to skip
                  </h3>
                  <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-gray-600">
                    {preview.duplicates.map((item) => (
                      <li key={`dup-${item.row.lineNumber}-${item.row.title}`}>
                        Line {item.row.lineNumber}: {item.row.title} — matches existing “
                        {item.existing.title}” ({formatLifeEntrySummary(item.existing)})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {preview.invalid.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Invalid rows
                  </h3>
                  <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-red-700">
                    {preview.invalid.map((item) => (
                      <li key={`invalid-${item.lineNumber}`}>
                        Line {item.lineNumber}: {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
