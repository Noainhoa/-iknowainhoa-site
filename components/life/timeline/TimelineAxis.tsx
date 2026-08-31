import {
  buildAxisTicks,
  todayMs,
} from "@/lib/life/timeline-domain";
import { msToPx } from "@/lib/life/timeline-scale";
import type { TimelineScale } from "@/lib/life/timeline-types";

type TimelineAxisProps = {
  scale: TimelineScale;
};

export default function TimelineAxis({ scale }: TimelineAxisProps) {
  const ticks = buildAxisTicks(scale);
  const todayX = msToPx(todayMs(), scale);

  return (
    <div
      className="relative h-9 border-b border-gray-200"
      style={{ width: scale.widthPx }}
      aria-hidden
    >
      {ticks.map((tick) => (
        <div
          key={`${tick.ms}-${tick.label}`}
          className="absolute top-0 flex h-full flex-col justify-end"
          style={{ left: msToPx(tick.ms, scale) }}
        >
          <span
            className={`-translate-x-1/2 pb-1 tabular-nums ${
              tick.major ? "text-[10px] text-gray-500" : "text-[9px] text-gray-400"
            }`}
          >
            {tick.label}
          </span>
          <div className={`w-px ${tick.major ? "h-2 bg-gray-300" : "h-1 bg-gray-200"}`} />
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-gray-400/70"
        style={{ left: todayX }}
        aria-hidden
      >
        <span className="absolute -top-0.5 left-1 text-[9px] uppercase tracking-wide text-gray-400">
          Today
        </span>
      </div>
    </div>
  );
}
