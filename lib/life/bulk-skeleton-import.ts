import { normalizeLifeDate } from "@/lib/life/dates";
import { entryDuplicateKey, normalizeEntryTitle } from "@/lib/life/entry-status";
import type {
  LifeDatePrecision,
  LifeEntry,
  LifeEntryStatus,
  LifeEntryType,
  LifeGroup,
} from "@/lib/life/types";

export type ParsedBulkRow = {
  lineNumber: number;
  rawDate: string;
  startPrecision: LifeDatePrecision;
  startDate: string;
  groupName: string;
  trackName: string;
  title: string;
  entryType: LifeEntryType;
  parsedStatus: LifeEntryStatus;
  notes: string | null;
};

export type InvalidBulkRow = {
  lineNumber: number;
  lineText: string;
  reason: string;
};

export type BulkImportEntryPlan = ParsedBulkRow & {
  trackId: string;
  duplicateOf?: LifeEntry;
};

export type BulkImportPreview = {
  entriesToCreate: BulkImportEntryPlan[];
  groupsToCreate: string[];
  tracksToCreate: { groupName: string; trackName: string }[];
  duplicates: Array<{
    row: ParsedBulkRow;
    existing: LifeEntry;
    groupName: string;
    trackName: string;
  }>;
  invalid: InvalidBulkRow[];
};

const VALID_PRECISIONS = new Set<LifeDatePrecision>(["exact", "month", "year", "approximate"]);
const VALID_TYPES = new Set<LifeEntryType>(["event", "period"]);
const VALID_STATUSES = new Set<LifeEntryStatus>(["skeleton", "complete"]);

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function findGroupByName(groups: LifeGroup[], name: string): LifeGroup | undefined {
  const needle = normalizeName(name);
  return groups.find((group) => normalizeName(group.name) === needle);
}

function findTrackByName(group: LifeGroup, name: string) {
  const needle = normalizeName(name);
  return group.tracks.find((track) => normalizeName(track.name) === needle);
}

function inferPrecisionFromDate(rawDate: string): LifeDatePrecision | null {
  if (/^\d{4}$/.test(rawDate)) return "year";
  if (/^\d{4}-\d{2}$/.test(rawDate)) return "month";
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return "exact";
  return null;
}

function parseBulkLine(lineText: string, lineNumber: number): ParsedBulkRow | InvalidBulkRow {
  const trimmed = lineText.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return { lineNumber, lineText, reason: "Empty or comment line." };
  }

  const parts = trimmed.split("|").map((part) => part.trim());
  if (parts.length < 7) {
    return {
      lineNumber,
      lineText,
      reason: "Expected at least 7 pipe-separated fields (DATE | PRECISION | GROUP | TRACK | TITLE | TYPE | STATUS).",
    };
  }

  const [rawDate, precisionRaw, groupName, trackName, title, entryTypeRaw, statusRaw] = parts;
  const notes = parts.length > 7 ? parts.slice(7).join(" | ").trim() || null : null;

  if (!groupName || !trackName || !title) {
    return { lineNumber, lineText, reason: "GROUP, TRACK, and TITLE are required." };
  }

  const precisionLower = precisionRaw.toLowerCase() as LifeDatePrecision;
  if (!VALID_PRECISIONS.has(precisionLower)) {
    return { lineNumber, lineText, reason: `Invalid precision: ${precisionRaw}` };
  }

  const inferred = inferPrecisionFromDate(rawDate);
  if (!inferred) {
    return {
      lineNumber,
      lineText,
      reason: "DATE must be YYYY, YYYY-MM, or YYYY-MM-DD.",
    };
  }

  if (inferred !== precisionLower && !(precisionLower === "approximate" && inferred === "exact")) {
    return {
      lineNumber,
      lineText,
      reason: `DATE form (${rawDate}) does not match PRECISION (${precisionRaw}).`,
    };
  }

  const startDate = normalizeLifeDate(precisionLower, rawDate);
  if (!startDate) {
    return { lineNumber, lineText, reason: "Could not normalize DATE for the given PRECISION." };
  }

  const entryType = entryTypeRaw.toLowerCase() as LifeEntryType;
  if (!VALID_TYPES.has(entryType)) {
    return { lineNumber, lineText, reason: `Invalid TYPE: ${entryTypeRaw}` };
  }

  if (entryType === "period") {
    return {
      lineNumber,
      lineText,
      reason: "Bulk skeleton import supports event rows only in V1.",
    };
  }

  const parsedStatus = statusRaw.toLowerCase() as LifeEntryStatus;
  if (!VALID_STATUSES.has(parsedStatus)) {
    return { lineNumber, lineText, reason: `Invalid STATUS: ${statusRaw}` };
  }

  return {
    lineNumber,
    rawDate,
    startPrecision: precisionLower,
    startDate,
    groupName,
    trackName,
    title,
    entryType,
    parsedStatus,
    notes,
  };
}

function collectExistingDuplicateKeys(groups: LifeGroup[]): Map<string, LifeEntry> {
  const map = new Map<string, LifeEntry>();
  for (const group of groups) {
    for (const track of group.tracks) {
      for (const entry of track.entries) {
        map.set(
          entryDuplicateKey({
            trackId: track.id,
            title: entry.title,
            startDate: entry.startDate,
            startPrecision: entry.startPrecision,
          }),
          entry
        );
      }
    }
  }
  return map;
}

export function buildBulkImportPreview(text: string, groups: LifeGroup[]): BulkImportPreview {
  const lines = text.split(/\r?\n/);
  const parsedRows: ParsedBulkRow[] = [];
  const invalid: InvalidBulkRow[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const result = parseBulkLine(lines[index], index + 1);
    if ("reason" in result) {
      if (result.reason === "Empty or comment line.") continue;
      invalid.push(result);
    } else {
      parsedRows.push(result);
    }
  }

  const existingDuplicateKeys = collectExistingDuplicateKeys(groups);
  const previewDuplicateKeys = new Set<string>();

  const groupsToCreateSet = new Set<string>();
  const tracksToCreateMap = new Map<string, { groupName: string; trackName: string }>();
  const entriesToCreate: BulkImportEntryPlan[] = [];
  const duplicates: BulkImportPreview["duplicates"] = [];

  for (const row of parsedRows) {
    let group = findGroupByName(groups, row.groupName);
    if (!group) {
      groupsToCreateSet.add(row.groupName.trim());
    } else {
      group = { ...group };
    }

    const resolvedGroupName = row.groupName.trim();
    const resolvedTrackName = row.trackName.trim();
    const trackKey = `${normalizeName(resolvedGroupName)}\0${normalizeName(resolvedTrackName)}`;

    let trackId: string | null = null;
    if (group) {
      const track = findTrackByName(group, row.trackName);
      if (track) trackId = track.id;
    }

    if (!trackId) {
      tracksToCreateMap.set(trackKey, {
        groupName: resolvedGroupName,
        trackName: resolvedTrackName,
      });
    }

    const effectiveTrackId = trackId ?? `pending:${trackKey}`;

    const dupKey = entryDuplicateKey({
      trackId: effectiveTrackId,
      title: row.title,
      startDate: row.startDate,
      startPrecision: row.startPrecision,
    });

    const existing = trackId ? existingDuplicateKeys.get(dupKey) : undefined;
    if (existing) {
      duplicates.push({
        row,
        existing,
        groupName: resolvedGroupName,
        trackName: resolvedTrackName,
      });
      continue;
    }

    if (previewDuplicateKeys.has(dupKey)) {
      duplicates.push({
        row,
        existing: {
          id: "pending-duplicate",
          trackId: effectiveTrackId,
          locationId: null,
          location: null,
          title: row.title,
          entryType: row.entryType,
          startDate: row.startDate,
          startPrecision: row.startPrecision,
          endDate: null,
          endPrecision: null,
          isOngoing: false,
          notes: row.notes,
          entryStatus: "skeleton",
        },
        groupName: resolvedGroupName,
        trackName: resolvedTrackName,
      });
      continue;
    }

    previewDuplicateKeys.add(dupKey);
    entriesToCreate.push({ ...row, trackId: effectiveTrackId });
  }

  return {
    entriesToCreate,
    groupsToCreate: [...groupsToCreateSet].sort((a, b) => a.localeCompare(b)),
    tracksToCreate: [...tracksToCreateMap.values()].sort((a, b) =>
      `${a.groupName}/${a.trackName}`.localeCompare(`${b.groupName}/${b.trackName}`)
    ),
    duplicates,
    invalid,
  };
}

export type BulkImportResult = {
  groupsCreated: number;
  tracksCreated: number;
  entriesCreated: number;
  skippedDuplicates: number;
};

export async function executeBulkSkeletonImport(options: {
  groups: LifeGroup[];
  preview: BulkImportPreview;
  createGroup: (name: string, order: number) => Promise<{ id: string; name: string }>;
  createTrack: (
    groupId: string,
    name: string,
    order: number
  ) => Promise<{ id: string; name: string; groupId: string }>;
  createEntry: (input: {
    trackId: string;
    title: string;
    startDate: string;
    startPrecision: LifeDatePrecision;
    notes: string | null;
  }) => Promise<void>;
  getFreshGroups: () => Promise<LifeGroup[]>;
}): Promise<BulkImportResult> {
  let groups = options.groups;
  let groupsCreated = 0;
  let tracksCreated = 0;
  let entriesCreated = 0;
  const skippedDuplicates = options.preview.duplicates.length;

  for (const groupName of options.preview.groupsToCreate) {
    await options.createGroup(groupName, nextSortOrderFromGroups(groups));
    groupsCreated += 1;
    groups = await options.getFreshGroups();
  }

  for (const trackPlan of options.preview.tracksToCreate) {
    const group = findGroupByName(groups, trackPlan.groupName);
    if (!group) {
      throw new Error(`Group not found after create: ${trackPlan.groupName}`);
    }
    const existing = findTrackByName(group, trackPlan.trackName);
    if (!existing) {
      await options.createTrack(group.id, trackPlan.trackName, nextSortOrderFromTracks(group));
      tracksCreated += 1;
      groups = await options.getFreshGroups();
    }
  }

  const existingDuplicateKeys = collectExistingDuplicateKeys(groups);

  for (const entryPlan of options.preview.entriesToCreate) {
    let trackId = entryPlan.trackId;
    if (trackId.startsWith("pending:")) {
      const [, groupNorm, trackNorm] = trackId.replace("pending:", "").split("\0");
      const group = groups.find((item) => normalizeName(item.name) === groupNorm);
      const track = group?.tracks.find((item) => normalizeName(item.name) === trackNorm);
      if (!group || !track) {
        throw new Error(`Could not resolve track for ${entryPlan.groupName} / ${entryPlan.trackName}`);
      }
      trackId = track.id;
    }

    const dupKey = entryDuplicateKey({
      trackId,
      title: entryPlan.title,
      startDate: entryPlan.startDate,
      startPrecision: entryPlan.startPrecision,
    });

    if (existingDuplicateKeys.has(dupKey)) continue;

    await options.createEntry({
      trackId,
      title: entryPlan.title,
      startDate: entryPlan.startDate,
      startPrecision: entryPlan.startPrecision,
      notes: entryPlan.notes,
    });

    existingDuplicateKeys.set(dupKey, {
      id: "imported",
      trackId,
      locationId: null,
      location: null,
      title: entryPlan.title,
      entryType: "event",
      startDate: entryPlan.startDate,
      startPrecision: entryPlan.startPrecision,
      endDate: null,
      endPrecision: null,
      isOngoing: false,
      notes: entryPlan.notes,
      entryStatus: "skeleton",
    });
    entriesCreated += 1;
  }

  return { groupsCreated, tracksCreated, entriesCreated, skippedDuplicates };
}

function nextSortOrderFromGroups(groups: LifeGroup[]): number {
  if (groups.length === 0) return 1;
  return Math.max(...groups.map((group) => group.order)) + 1;
}

function nextSortOrderFromTracks(group: LifeGroup): number {
  if (group.tracks.length === 0) return 1;
  return Math.max(...group.tracks.map((track) => track.order)) + 1;
}

export { normalizeEntryTitle, normalizeName as normalizeBulkName };
