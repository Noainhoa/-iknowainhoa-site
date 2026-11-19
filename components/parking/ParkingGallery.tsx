"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import ParkingChevron from "@/components/parking/ParkingChevron";

const PHOTOS = [
  {
    src: "/images/parking/plaza-1.jpg",
    width: 900,
    height: 509,
    priority: true,
  },
  {
    src: "/images/parking/plaza-2.jpg",
    width: 659,
    height: 900,
    priority: false,
  },
  {
    src: "/images/parking/plaza-3.jpg",
    width: 900,
    height: 673,
    priority: false,
  },
] as const;

const SWIPE_THRESHOLD_PX = 48;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;
const ZOOM_DOUBLE_TAP = 2.5;

type ParkingGalleryProps = {
  galleryLabel: string;
  photoAlts: [string, string, string] | string[];
  lengthLabel: string;
  widthLabel: string;
  openAria: string;
  closeAria: string;
  prevAria: string;
  nextAria: string;
};

type ZoomState = { scale: number; x: number; y: number };

const ZOOM_RESET: ZoomState = { scale: 1, x: 0, y: 0 };

function clampZoom(scale: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale));
}

export default function ParkingGallery({
  galleryLabel,
  photoAlts,
  lengthLabel,
  widthLabel,
  openAria,
  closeAria,
  prevAria,
  nextAria,
}: ParkingGalleryProps) {
  const titleId = useId();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState<ZoomState>(ZOOM_RESET);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const pinchRef = useRef<{
    startDistance: number;
    startScale: number;
  } | null>(null);
  const lastTapRef = useRef(0);

  zoomRef.current = zoom;

  const open = lightboxIndex !== null;
  const activeIndex = lightboxIndex ?? 0;
  const activePhoto = PHOTOS[activeIndex];
  /* Lightbox dims: plaza-1 (0) and plaza-2 (1); plaza-3 has no painted bay lines */
  const showDims = open && (activeIndex === 0 || activeIndex === 1);
  const dimsSlideClass =
    activeIndex === 0
      ? "pk-lightbox-dims--plaza-1"
      : activeIndex === 1
        ? "pk-lightbox-dims--plaza-2"
        : "";
  const isZoomed = zoom.scale > 1.01;

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setZoom(ZOOM_RESET);
  }, []);

  const go = useCallback((dir: -1 | 1) => {
    setZoom(ZOOM_RESET);
    setLightboxIndex((i) => {
      if (i === null) return i;
      return (i + dir + PHOTOS.length) % PHOTOS.length;
    });
  }, []);

  const openAt = useCallback((index: number, from: HTMLElement) => {
    restoreFocusRef.current = from;
    setZoom(ZOOM_RESET);
    setLightboxIndex(index);
  }, []);

  const applyZoomAt = useCallback(
    (nextScale: number, clientX?: number, clientY?: number) => {
      const stage = stageRef.current;
      setZoom((prev) => {
        const scale = clampZoom(nextScale);
        if (scale <= ZOOM_MIN) return ZOOM_RESET;
        if (!stage || clientX === undefined || clientY === undefined) {
          return { scale, x: prev.x, y: prev.y };
        }
        const rect = stage.getBoundingClientRect();
        const cx = clientX - rect.left - rect.width / 2;
        const cy = clientY - rect.top - rect.height / 2;
        const ratio = scale / prev.scale;
        return {
          scale,
          x: cx - (cx - prev.x) * ratio,
          y: cy - (cy - prev.y) * ratio,
        };
      });
    },
    []
  );

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (zoomRef.current.scale > 1.01) {
          setZoom(ZOOM_RESET);
          return;
        }
        closeLightbox();
        return;
      }

      /* Zoom the preview, not the page */
      const meta = event.metaKey || event.ctrlKey;
      if (meta && (event.key === "=" || event.key === "+")) {
        event.preventDefault();
        applyZoomAt(zoomRef.current.scale + ZOOM_STEP);
        return;
      }
      if (meta && event.key === "-") {
        event.preventDefault();
        applyZoomAt(zoomRef.current.scale - ZOOM_STEP);
        return;
      }
      if (meta && event.key === "0") {
        event.preventDefault();
        setZoom(ZOOM_RESET);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function onWheel(event: WheelEvent) {
      const stage = stageRef.current;
      if (!stage || !stage.contains(event.target as Node)) return;
      /* Trackpad pinch sends wheel + ctrlKey; also accept plain wheel over preview */
      event.preventDefault();
      const delta = -event.deltaY;
      const factor = event.ctrlKey || event.metaKey ? 0.01 : 0.0025;
      applyZoomAt(
        zoomRef.current.scale * (1 + delta * factor),
        event.clientX,
        event.clientY
      );
    }

    window.addEventListener("keydown", onKey);
    document.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", onWheel);
      restoreFocusRef.current?.focus();
    };
  }, [open, closeLightbox, go, applyZoomAt]);

  function onTouchStart(event: ReactTouchEvent) {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = {
        startDistance: distance,
        startScale: zoomRef.current.scale,
      };
      touchStartX.current = null;
      return;
    }
    if (isZoomed) {
      touchStartX.current = null;
      return;
    }
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchMove(event: ReactTouchEvent) {
    if (event.touches.length !== 2 || !pinchRef.current) return;
    event.preventDefault();
    const [a, b] = [event.touches[0], event.touches[1]];
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const midX = (a.clientX + b.clientX) / 2;
    const midY = (a.clientY + b.clientY) / 2;
    const next =
      pinchRef.current.startScale *
      (distance / Math.max(1, pinchRef.current.startDistance));
    applyZoomAt(next, midX, midY);
  }

  function onTouchEnd(event: ReactTouchEvent) {
    if (event.touches.length < 2) pinchRef.current = null;
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null || isZoomed) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? 1 : -1);
  }

  function onPointerDown(event: ReactPointerEvent) {
    if (event.pointerType === "touch") return;
    if (event.button !== 0) return;

    if (isZoomed) {
      event.currentTarget.setPointerCapture(event.pointerId);
      panRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: zoomRef.current.x,
        originY: zoomRef.current.y,
      };
      pointerStartX.current = null;
      return;
    }

    pointerStartX.current = event.clientX;
  }

  function onPointerMove(event: ReactPointerEvent) {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    setZoom((prev) => ({
      ...prev,
      x: pan.originX + (event.clientX - pan.startX),
      y: pan.originY + (event.clientY - pan.startY),
    }));
  }

  function onPointerUp(event: ReactPointerEvent) {
    if (panRef.current?.pointerId === event.pointerId) {
      panRef.current = null;
      return;
    }
    if (event.pointerType === "touch") return;
    const start = pointerStartX.current;
    pointerStartX.current = null;
    if (start === null || isZoomed) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? 1 : -1);
  }

  function toggleZoomAt(clientX: number, clientY: number) {
    if (zoomRef.current.scale > 1.01) {
      setZoom(ZOOM_RESET);
      return;
    }
    applyZoomAt(ZOOM_DOUBLE_TAP, clientX, clientY);
  }

  function onDoubleClick(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    toggleZoomAt(event.clientX, event.clientY);
  }

  function onStagePointerUp(event: ReactPointerEvent) {
    onPointerUp(event);
    if (event.pointerType !== "touch" || event.button !== 0) return;
    if (pinchRef.current) return;
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      lastTapRef.current = 0;
      toggleZoomAt(event.clientX, event.clientY);
      return;
    }
    lastTapRef.current = now;
  }

  const lightbox =
    mounted && open && activePhoto ? (
      <div
        ref={dialogRef}
        className="pk-lightbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={closeLightbox}
      >
        <p id={titleId} className="pk-lightbox-title">
          {galleryLabel} · {activeIndex + 1}/{PHOTOS.length}
        </p>

        <button
          ref={closeBtnRef}
          type="button"
          className="pk-lightbox-close"
          aria-label={closeAria}
          onClick={closeLightbox}
        >
          <span aria-hidden="true">×</span>
        </button>

        <button
          type="button"
          className="pk-lightbox-nav pk-lightbox-nav--prev"
          aria-label={prevAria}
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
        >
          <ParkingChevron direction="left" className="pk-lightbox-nav-icon" />
        </button>

        <div
          ref={stageRef}
          className={`pk-lightbox-stage${isZoomed ? " is-zoomed" : ""}`}
          onClick={(event) => event.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onStagePointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
        >
          <figure
            className="pk-lightbox-frame"
            style={
              {
                "--pk-lw": activePhoto.width,
                "--pk-lh": activePhoto.height,
                transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
              } as CSSProperties
            }
          >
            <Image
              src={activePhoto.src}
              alt={photoAlts[activeIndex] ?? ""}
              width={activePhoto.width}
              height={activePhoto.height}
              sizes="100vw"
              priority
              quality={90}
              className="pk-lightbox-img"
              draggable={false}
            />
            {showDims ? (
              <div
                className={`pk-lightbox-dims ${dimsSlideClass}`}
                aria-hidden="true"
              >
                <span className="pk-dim pk-lightbox-dim-length">
                  {lengthLabel}
                </span>
                <span className="pk-dim pk-lightbox-dim-width">
                  {widthLabel}
                </span>
              </div>
            ) : null}
          </figure>
        </div>

        <button
          type="button"
          className="pk-lightbox-nav pk-lightbox-nav--next"
          aria-label={nextAria}
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
        >
          <ParkingChevron direction="right" className="pk-lightbox-nav-icon" />
        </button>
      </div>
    ) : null;

  return (
    <section className="pk-space" aria-label={galleryLabel}>
      <div className="pk-gallery" role="group" aria-label={galleryLabel}>
        {PHOTOS.map((photo, i) => {
          const isHero = i === 0;
          return (
            <figure
              key={photo.src}
              className={
                isHero
                  ? "pk-gallery-item pk-gallery-item--dims"
                  : "pk-gallery-item"
              }
            >
              <Image
                src={photo.src}
                alt={photoAlts[i] ?? ""}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 560px) 100vw, 520px"
                priority={photo.priority}
                loading={photo.priority ? "eager" : "lazy"}
                fetchPriority={photo.priority ? "high" : "low"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                className="pk-gallery-open"
                aria-label={`${openAria}: ${photoAlts[i] ?? ""}`}
                onClick={(event) => openAt(i, event.currentTarget)}
              />
              {isHero ? (
                <div className="pk-dims" aria-hidden="true">
                  <span className="pk-dim pk-dim-length">{lengthLabel}</span>
                </div>
              ) : null}
            </figure>
          );
        })}
      </div>
      {lightbox ? createPortal(lightbox, document.body) : null}
    </section>
  );
}
