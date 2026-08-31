import type { TimelineGroupRow } from "@/lib/life/timeline-types";

type TimelineGroupProps = {
  row: TimelineGroupRow;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function TimelineGroup({ row, collapsed, onToggleCollapsed }: TimelineGroupProps) {
  return (
    <div
      className="flex h-7 items-end justify-between gap-2 border-b border-gray-200 pb-0.5"
      role="presentation"
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="flex min-w-0 items-center gap-1 text-left"
        aria-expanded={!collapsed}
        aria-controls={`life-view-group-${row.groupId}`}
      >
        <span aria-hidden className="text-[10px] text-gray-400">
          {collapsed ? "▸" : "▾"}
        </span>
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {row.groupName}
        </p>
      </button>
    </div>
  );
}
