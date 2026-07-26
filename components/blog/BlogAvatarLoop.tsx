"use client";

import { useEffect, useState } from "react";

const INTERVAL_MS = 2800;

export default function BlogAvatarLoop({ sources }: { sources: string[] }) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion || sources.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % sources.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, sources.length]);

  if (sources.length === 0) {
    return <span className="blog-avatar-fallback">A</span>;
  }

  const active = reducedMotion ? 0 : index;

  return (
    <>
      {sources.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          className={`blog-avatar-media${i === active ? " is-active" : ""}`}
          src={src}
          alt=""
          draggable={false}
        />
      ))}
    </>
  );
}
