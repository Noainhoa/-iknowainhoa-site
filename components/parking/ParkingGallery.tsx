"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const go = useCallback((dir: -1 | 1) => {
    setLightboxIndex((i) => {
      if (i === null) return i;
      return (i + dir + PHOTOS.length) % PHOTOS.length;
    });
  }, []);

  const openAt = useCallback((index: number, from: HTMLElement) => {
    restoreFocusRef.current = from;
    setLightboxIndex(index);
  }, []);

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
        closeLightbox();
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

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus();
    };
  }, [open, closeLightbox, go]);

  function onTouchStart(event: ReactTouchEvent) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: ReactTouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? 1 : -1);
  }

  function onPointerDown(event: ReactPointerEvent) {
    if (event.pointerType === "touch") return;
    if (event.button !== 0) return;
    pointerStartX.current = event.clientX;
  }

  function onPointerUp(event: ReactPointerEvent) {
    if (event.pointerType === "touch") return;
    const start = pointerStartX.current;
    pointerStartX.current = null;
    if (start === null) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? 1 : -1);
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
          <span aria-hidden="true">‹</span>
        </button>

        <div
          className="pk-lightbox-stage"
          onClick={(event) => event.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <figure className="pk-lightbox-frame">
            <Image
              src={activePhoto.src}
              alt={photoAlts[activeIndex] ?? ""}
              width={activePhoto.width}
              height={activePhoto.height}
              sizes="100vw"
              priority
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
          <span aria-hidden="true">›</span>
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
