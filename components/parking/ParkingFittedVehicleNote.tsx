"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import {
  PARKING_FITTED_VEHICLE_IMAGE_ALT,
  PARKING_FITTED_VEHICLE_IMAGE_SRC,
} from "@/lib/parking/fittedVehicle";

type Props = {
  before: string;
  name: string;
  after: string;
  previewAria: string;
};

function finePointerHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export default function ParkingFittedVehicleNote({
  before,
  name,
  after,
  previewAria,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  /** Click/keyboard open stays until dismiss — mouseLeave must not close it. */
  const pinnedRef = useRef(false);
  const previewId = useId();

  function close() {
    pinnedRef.current = false;
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function dismiss() {
      pinnedRef.current = false;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    function onPointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      dismiss();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <p className="pk-fit-note">
      {before}
      <span
        ref={rootRef}
        className={`pk-fit-car${open ? " is-open" : ""}`}
        onMouseEnter={() => {
          if (finePointerHover()) setOpen(true);
        }}
        onMouseLeave={() => {
          if (pinnedRef.current) return;
          if (finePointerHover()) setOpen(false);
        }}
      >
        <button
          type="button"
          className="pk-fit-car-trigger"
          aria-expanded={open}
          aria-controls={previewId}
          aria-label={previewAria}
          onClick={() => {
            if (open && pinnedRef.current) {
              close();
              return;
            }
            pinnedRef.current = true;
            setOpen(true);
          }}
        >
          {name}
        </button>
        <span
          id={previewId}
          className="pk-fit-car-preview"
          role="img"
          aria-hidden={!open}
        >
          <Image
            src={PARKING_FITTED_VEHICLE_IMAGE_SRC}
            alt={PARKING_FITTED_VEHICLE_IMAGE_ALT}
            width={320}
            height={240}
            sizes="320px"
            className="pk-fit-car-img"
          />
        </span>
      </span>
      {after}
    </p>
  );
}
