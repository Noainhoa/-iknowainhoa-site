"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import TimelineAxis from "@/components/life/timeline/TimelineAxis";
import TimelineEntryDetail from "@/components/life/timeline/TimelineEntryDetail";
import TimelineGroup from "@/components/life/timeline/TimelineGroup";
import TimelineTrack from "@/components/life/timeline/TimelineTrack";
import TimelineZoomControls from "@/components/life/timeline/TimelineZoomControls";
import { buildVisibleTimelineTree, findTimelineEntryContext } from "@/lib/life/timeline-data";
import {
  computeTimelineScale,
  defaultScrollLeft,
  LIFE_START_YEAR,
  todayMs,
} from "@/lib/life/timeline-domain";
import { msToPx } from "@/lib/life/timeline-scale";
import type { LifeEntry, LifeGroup } from "@/lib/life/types";
import type { TimelineRow, TimelineZoom } from "@/lib/life/timeline-types";

const LABEL_WIDTH_PX = 176;
const TRACK_ROW_HEIGHT_PX = 40;
const GROUP_ROW_HEIGHT_PX = 28;
const AXIS_HEIGHT_PX = 36;

type LifeTimelineProps = {
  groups: LifeGroup[];
};

function filterRowsByCollapsed(rows: TimelineRow[], collapsedGroupIds: Set<string>): TimelineRow[] {
  const filtered: TimelineRow[] = [];
  let skipGroupId: string | null = null;

  for (const row of rows) {
    if (row.kind === "group") {
      skipGroupId = collapsedGroupIds.has(row.groupId) ? row.groupId : null;
      filtered.push(row);
      continue;
    }

    if (skipGroupId && row.groupId === skipGroupId) continue;
    filtered.push(row);
  }

  return filtered;
}

export default function LifeTimeline({ groups }: LifeTimelineProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<TimelineZoom>("life");
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(() => new Set());
  const [canvasWidth, setCanvasWidth] = useState(960);

  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const tree = useMemo(() => buildVisibleTimelineTree(groups), [groups]);
  const scale = useMemo(
    () => computeTimelineScale(zoom, canvasWidth, tree.entries),
    [zoom, canvasWidth, tree.entries]
  );

  const visibleRows = useMemo(
    () => filterRowsByCollapsed(tree.rows, collapsedGroupIds),
    [tree.rows, collapsedGroupIds]
  );

  const selectedContext = selectedEntryId
    ? findTimelineEntryContext(groups, selectedEntryId)
    : undefined;

  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 960;
      setCanvasWidth(Math.max(480, Math.floor(width)));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollLeft = defaultScrollLeft(scale, container.clientWidth);
  }, [scale]);

  function handleSelectEntry(entry: LifeEntry) {
    setSelectedEntryId((current) => (current === entry.id ? null : entry.id));
  }

  function toggleGroupCollapsed(groupId: string) {
    setCollapsedGroupIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  const hasTrackRows = visibleRows.some((row) => row.kind === "track");
  const todayLinePx = msToPx(todayMs(), scale);

  return (
    <div className="flex flex-col gap-3">
      <TimelineZoomControls zoom={zoom} onZoomChange={setZoom} />

      <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div
          className="sticky left-0 z-20 shrink-0 border-r border-gray-200 bg-gray-50"
          style={{ width: LABEL_WIDTH_PX }}
        >
          <div style={{ height: AXIS_HEIGHT_PX }} className="border-b border-gray-200" aria-hidden />
          {hasTrackRows ? (
            visibleRows.map((row) =>
              row.kind === "group" ? (
                <div key={row.key} className="px-3">
                  <TimelineGroup
                    row={row}
                    collapsed={collapsedGroupIds.has(row.groupId)}
                    onToggleCollapsed={() => toggleGroupCollapsed(row.groupId)}
                  />
                </div>
              ) : (
                <div
                  key={row.key}
                  className="flex items-center border-b border-gray-100 px-3"
                  style={{ height: TRACK_ROW_HEIGHT_PX }}
                >
                  <p className="truncate text-xs text-gray-700" title={row.trackName}>
                    {row.trackName}
                  </p>
                </div>
              )
            )
          ) : (
            <div className="px-3 py-6 text-xs text-gray-500">No visible tracks yet.</div>
          )}
        </div>

        <div ref={measureRef} className="min-w-0 flex-1">
          <div
            ref={scrollRef}
            className={zoom === "life" ? "overflow-x-hidden" : "overflow-x-auto"}
          >
            <div
              className="relative"
              style={{
                width: scale.widthPx,
                minWidth: zoom === "life" ? "100%" : undefined,
              }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 z-0 w-px bg-gray-300/60"
                style={{ left: todayLinePx }}
                aria-hidden
              />
              <TimelineAxis scale={scale} />
              {hasTrackRows ? (
                visibleRows.map((row) =>
                  row.kind === "group" ? (
                    <div
                      key={row.key}
                      id={`life-view-group-${row.groupId}`}
                      className="border-b border-gray-200 bg-gray-50"
                      style={{ height: GROUP_ROW_HEIGHT_PX }}
                      aria-hidden
                    />
                  ) : (
                    <TimelineTrack
                      key={row.key}
                      row={row}
                      scale={scale}
                      selectedEntryId={selectedEntryId}
                      onSelectEntry={handleSelectEntry}
                      rowHeight={TRACK_ROW_HEIGHT_PX}
                    />
                  )
                )
              ) : (
                <div
                  className="flex items-center justify-center text-sm text-gray-500"
                  style={{ height: 120 }}
                >
                  <span>
                    {tree.entries.length === 0 ? (
                      <>
                        Life timeline ({LIFE_START_YEAR}–today).{" "}
                        <Link href="/life/manage" className="text-gray-700 hover:text-gray-900">
                          Manage →
                        </Link>
                      </>
                    ) : (
                      "Expand a group to see tracks."
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedContext ? (
        <TimelineEntryDetail
          context={selectedContext}
          onClose={() => setSelectedEntryId(null)}
        />
      ) : null}
    </div>
  );
}
