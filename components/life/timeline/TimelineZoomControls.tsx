import type { TimelineZoom } from "@/lib/life/timeline-types";
import { TIMELINE_ZOOM_OPTIONS } from "@/lib/life/timeline-domain";

type TimelineZoomControlsProps = {
  zoom: TimelineZoom;
  onZoomChange: (zoom: TimelineZoom) => void;
};

export default function TimelineZoomControls({
  zoom,
  onZoomChange,
}: TimelineZoomControlsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-1"
      role="group"
      aria-label="Timeline zoom"
    >
      {TIMELINE_ZOOM_OPTIONS.map((option) => {
        const active = option.id === zoom;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onZoomChange(option.id)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
              active
                ? "border-gray-800 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
