"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

export type GalleryImage = {
  src: string;
  alt?: string;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  columns?: 2 | 3;
  thumbSize?: number;
};

export default function ProductGallery({
  images,
  columns = 3,
  thumbSize = 320,
}: ProductGalleryProps) {
  const [active, setActive] = useState<GalleryImage | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full">
      <div
        className={clsx(
          "grid gap-4",
          columns === 2 ? "grid-cols-2 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {images.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900"
            onClick={() => setActive(img)}
          >
            <Image
              src={img.src}
              alt={img.alt || "Product image"}
              width={thumbSize}
              height={thumbSize}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt || "Product image"}
              width={1200}
              height={1200}
              className="h-auto max-h-[80vh] w-auto max-w-full rounded-xl shadow-2xl"
            />
            <button
              type="button"
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow focus:outline-none focus:ring-2 focus:ring-slate-400"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
