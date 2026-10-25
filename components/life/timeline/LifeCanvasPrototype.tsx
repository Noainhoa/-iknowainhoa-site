"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DEMO_CANVAS_RULES,
  VERIFIED_DEMO_MARKS,
  type DemoImportance,
  type VerifiedDemoMark,
} from "@/lib/life/verified-demo-events";

const MS_DAY = 86_400_000;
const AXIS_H = 56;
const PLAYER_PAD = 72;

type ZoomPreset = "fit" | "20y" | "10y" | "5y" | "2y";

const ZOOM_PX_PER_DAY: Record<Exclude<ZoomPreset, "fit">, number> = {
  "20y": 0.55,
  "10y": 1.1,
  "5y": 2.2,
  "2y": 5.5,
};

const PRESET_ORDER: ZoomPreset[] = ["fit", "20y", "10y", "5y", "2y"];

function parseMarkMs(date: string): number {
  const [y, m = "1", d = "1"] = date.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
}

function startOfTodayMs(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function lifeStartMs(): number {
  return parseMarkMs(DEMO_CANVAS_RULES.birthDate);
}

function markRadius(importance: DemoImportance): number {
  if (importance === "major") return 7;
  if (importance === "medium") return 5;
  return 4;
}

function buildYearTicks(
  startMs: number,
  endMs: number,
  widthPx: number,
  preset: ZoomPreset
): Array<{ year: number; ms: number; major: boolean }> {
  const startY = new Date(startMs).getFullYear();
  const endY = new Date(endMs).getFullYear();
  const minGap =
    preset === "fit" ? 64 : preset === "20y" ? 48 : preset === "10y" ? 40 : 36;

  let step = 10;
  if (preset === "fit") step = 10;
  else if (preset === "20y") step = 5;
  else if (preset === "10y") step = 2;
  else if (preset === "5y") step = 1;
  else step = 1;

  const candidates: Array<{ year: number; ms: number; major: boolean }> = [];
  for (let y = startY; y <= endY; y += 1) {
    const ms = new Date(y, 0, 1).getTime();
    const isEndpoint = y === startY || y === endY;
    const onStep = (y - startY) % step === 0;
    if (!isEndpoint && !onStep) continue;
    candidates.push({
      year: y,
      ms,
      major: isEndpoint || y % 10 === 0 || step >= 5,
    });
  }

  const placed: typeof candidates = [];
  for (const tick of candidates) {
    const x = ((tick.ms - startMs) / (endMs - startMs)) * widthPx;
    const last = placed[placed.length - 1];
    if (last) {
      const lastX = ((last.ms - startMs) / (endMs - startMs)) * widthPx;
      if (x - lastX < minGap && !tick.major) continue;
      if (x - lastX < minGap * 0.55) continue;
    }
    placed.push(tick);
  }

  // Always keep birth year + current year visible when possible
  const ensure = [startY, endY];
  for (const y of ensure) {
    if (placed.some((t) => t.year === y)) continue;
    placed.push({ year: y, ms: new Date(y, 0, 1).getTime(), major: true });
  }
  placed.sort((a, b) => a.ms - b.ms);
  return placed;
}

function xForStatic(ms: number, start: number, end: number, width: number): number {
  return ((ms - start) / (end - start)) * width;
}

function HouseMark({
  size,
  filled,
}: {
  size: number;
  filled: boolean;
}) {
  const s = size * 2;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden className="-translate-x-1/2 -translate-y-1/2">
      <path
        d="M8 2.2 L14 7.2 V14 H10 V10 H6 V14 H2 V7.2 Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LifeCanvasPrototype() {
  const [preset, setPreset] = useState<ZoomPreset>("fit");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewportW, setViewportW] = useState(960);
  const [legendOpen, setLegendOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const domainStart = lifeStartMs();
  const domainEnd = startOfTodayMs() + MS_DAY - 1;
  const spanDays = (domainEnd - domainStart) / MS_DAY;

  const widthPx = useMemo(() => {
    if (preset === "fit") return Math.max(640, viewportW);
    return Math.max(640, Math.ceil(spanDays * ZOOM_PX_PER_DAY[preset]));
  }, [preset, spanDays, viewportW]);

  const ticks = useMemo(
    () => buildYearTicks(domainStart, domainEnd, widthPx, preset),
    [domainStart, domainEnd, widthPx, preset]
  );

  const selected = VERIFIED_DEMO_MARKS.find((m) => m.id === selectedId) ?? null;

  /** Stack marks that share (nearly) the same date so they stay selectable. */
  const markLayout = useMemo(() => {
    const sorted = [...VERIFIED_DEMO_MARKS].sort(
      (a, b) => parseMarkMs(a.date) - parseMarkMs(b.date)
    );
    const layout = new Map<string, { left: number; stack: number }>();
    let cluster: VerifiedDemoMark[] = [];
    let clusterMs = -Infinity;

    function flush() {
      cluster.forEach((mark, index) => {
        layout.set(mark.id, {
          left: xForStatic(parseMarkMs(mark.date), domainStart, domainEnd, widthPx),
          stack: index - (cluster.length - 1) / 2,
        });
      });
      cluster = [];
    }

    for (const mark of sorted) {
      const ms = parseMarkMs(mark.date);
      if (cluster.length && Math.abs(ms - clusterMs) > MS_DAY * 20) flush();
      if (!cluster.length) clusterMs = ms;
      cluster.push(mark);
      clusterMs = (clusterMs * (cluster.length - 1) + ms) / cluster.length;
    }
    flush();
    return layout;
  }, [domainStart, domainEnd, widthPx]);

  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      setViewportW(Math.max(320, Math.floor(entries[0]?.contentRect.width ?? 960)));
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (preset === "fit") {
      el.scrollLeft = 0;
      return;
    }
    // Prefer recent life when zooming in
    const todayX = ((domainEnd - domainStart) / (domainEnd - domainStart)) * widthPx;
    el.scrollLeft = Math.max(0, todayX - el.clientWidth * 0.72);
  }, [preset, widthPx, domainStart, domainEnd]);

  useEffect(() => {
    function onFs() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function xFor(ms: number): number {
    return ((ms - domainStart) / (domainEnd - domainStart)) * widthPx;
  }

  function zoomIn() {
    const i = PRESET_ORDER.indexOf(preset);
    if (i < PRESET_ORDER.length - 1) setPreset(PRESET_ORDER[i + 1]);
  }

  function zoomOut() {
    const i = PRESET_ORDER.indexOf(preset);
    if (i > 0) setPreset(PRESET_ORDER[i - 1]);
  }

  async function toggleFullscreen() {
    const node = rootRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await node.requestFullscreen();
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-[70vh] flex-col bg-[var(--background,#f7f5f1)] text-[var(--foreground,#1c1917)]"
    >
      <div className="flex items-baseline justify-between gap-4 px-4 pb-2 pt-4 sm:px-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Life · canvas prototype</p>
          <h1 className="mt-1 font-serif text-2xl tracking-tight text-stone-900 sm:text-3xl">
            {DEMO_CANVAS_RULES.birthYear} → present
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setLegendOpen((v) => !v)}
          className="rounded-md border border-stone-300 bg-white/70 px-2.5 py-1 text-xs text-stone-700 backdrop-blur hover:bg-white"
        >
          {legendOpen ? "Hide legend" : "Legend"}
        </button>
      </div>

      {legendOpen ? (
        <div className="mx-4 mb-2 grid gap-2 rounded-lg border border-stone-200 bg-white/80 px-4 py-3 text-xs text-stone-600 sm:mx-6 sm:grid-cols-2">
          <p>
            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-stone-900 align-middle" />
            Major — large filled
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-stone-700 align-middle" />
            Medium — medium filled
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-stone-600 bg-transparent align-middle" />
            Light — empty ring
          </p>
          <p className="flex items-center gap-2">
            <span className="text-stone-800">
              <HouseMark size={6} filled />
            </span>
            Home — one mark per move
          </p>
          <p className="sm:col-span-2 text-stone-500">
            Spacing is real time. Quiet decades stay empty on purpose.
          </p>
        </div>
      ) : null}

      <div ref={measureRef} className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          className={`h-full ${preset === "fit" ? "overflow-x-hidden" : "overflow-x-auto"} overflow-y-hidden`}
        >
          <div className="relative h-full min-h-[420px]" style={{ width: widthPx }}>
            {/* Midline */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-[46%] h-px bg-stone-300/90"
              aria-hidden
            />

            {/* Marks */}
            {VERIFIED_DEMO_MARKS.map((mark) => {
              const layout = markLayout.get(mark.id);
              if (!layout) return null;
              return (
                <MarkButton
                  key={mark.id}
                  mark={mark}
                  left={layout.left}
                  stack={layout.stack}
                  selected={selectedId === mark.id}
                  onSelect={() =>
                    setSelectedId((id) => (id === mark.id ? null : mark.id))
                  }
                />
              );
            })}

            {/* Year axis (bottom of canvas) */}
            <div
              className="absolute bottom-0 left-0 border-t border-stone-300/80"
              style={{ width: widthPx, height: AXIS_H }}
              aria-hidden
            >
              {ticks.map((tick) => (
                <div
                  key={tick.year}
                  className="absolute bottom-0 flex flex-col items-center"
                  style={{ left: xFor(tick.ms) }}
                >
                  <div
                    className={`w-px ${tick.major ? "h-3 bg-stone-400" : "h-2 bg-stone-300"}`}
                  />
                  <span
                    className={`-translate-x-1/2 pt-1 tabular-nums ${
                      tick.major
                        ? "text-[11px] font-medium text-stone-700"
                        : "text-[10px] text-stone-400"
                    }`}
                  >
                    {tick.year}
                  </span>
                </div>
              ))}
              <span className="absolute bottom-2 right-3 text-[10px] uppercase tracking-wide text-stone-400">
                Present
              </span>
            </div>
          </div>
        </div>

        {/* Player controls */}
        <div
          className="absolute bottom-[calc(theme(spacing.2)+var(--axis,0px))] right-3 z-20 flex flex-col gap-1 sm:right-5"
          style={{ bottom: AXIS_H + 12 }}
        >
          <div className="flex flex-col overflow-hidden rounded-lg border border-stone-300 bg-white/90 shadow-sm backdrop-blur">
            <ControlButton label="Fit life" onClick={() => setPreset("fit")} active={preset === "fit"}>
              <FitIcon />
            </ControlButton>
            <ControlButton label="Fullscreen" onClick={() => void toggleFullscreen()} active={isFullscreen}>
              <FullIcon />
            </ControlButton>
            <ControlButton label="Zoom in" onClick={zoomIn} disabled={preset === "2y"}>
              <span className="text-lg leading-none">+</span>
            </ControlButton>
            <ControlButton label="Zoom out" onClick={zoomOut} disabled={preset === "fit"}>
              <span className="text-lg leading-none">−</span>
            </ControlButton>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-stone-300 bg-white/90 shadow-sm backdrop-blur">
            {(["20y", "10y", "5y", "2y"] as const).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={preset === id}
                onClick={() => setPreset(id)}
                className={`px-2 py-1.5 text-[10px] font-medium tabular-nums ${
                  preset === id
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail */}
      <div
        className="border-t border-stone-200 bg-white/60 px-4 py-3 backdrop-blur sm:px-6"
        style={{ paddingRight: PLAYER_PAD }}
      >
        {selected ? (
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">
              {selected.kind === "home" ? "Home" : selected.subject} · {selected.date}
              {selected.importance === "major" ? " · major" : null}
            </p>
            <p className="mt-1 font-serif text-lg text-stone-900">{selected.title}</p>
            {selected.place ? (
              <p className="mt-1 text-sm text-stone-600">{selected.place}</p>
            ) : null}
            {selected.notes ? (
              <p className="mt-1 text-sm text-stone-500">{selected.notes}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-stone-500">
            Select a mark. Verified demo only — quiet years stay empty on purpose.
          </p>
        )}
      </div>
    </div>
  );
}

function MarkButton({
  mark,
  left,
  stack,
  selected,
  onSelect,
}: {
  mark: VerifiedDemoMark;
  left: number;
  stack: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const r = markRadius(mark.importance);
  const filled = mark.importance !== "light";
  const yNudge = stack * 18;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${mark.title} (${mark.date})`}
      aria-label={`${mark.title}, ${mark.date}`}
      aria-pressed={selected}
      className={`absolute top-[46%] -translate-y-1/2 text-stone-800 transition ${
        selected ? "z-10 scale-125 text-stone-950" : "z-[1] hover:scale-110"
      }`}
      style={{ left, marginTop: yNudge }}
    >
      {mark.kind === "home" ? (
        <span className="block text-stone-700">
          <HouseMark size={r} filled={filled || mark.importance === "medium"} />
        </span>
      ) : (
        <span
          className="block -translate-x-1/2 rounded-full border-[1.5px] border-current"
          style={{
            width: r * 2,
            height: r * 2,
            backgroundColor: filled ? "currentColor" : "transparent",
          }}
        />
      )}
    </button>
  );
}

function ControlButton({
  label,
  onClick,
  children,
  active,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center text-stone-700 disabled:opacity-30 ${
        active ? "bg-stone-900 text-white" : "hover:bg-stone-100"
      }`}
    >
      {children}
    </button>
  );
}

function FitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FullIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
