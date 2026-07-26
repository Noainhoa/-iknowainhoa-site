"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

type InstagramEmbedProps = {
  url: string;
  title?: string;
};

/**
 * Official Instagram embed: pick public posts/reels by permalink.
 * Instagram loads the visual card; we only pass the URL.
 */
export default function InstagramEmbed({ url, title }: InstagramEmbedProps) {
  const ref = useRef<HTMLQuoteElement>(null);
  const permalink = url.replace(/\?.*$/, "").replace(/\/$/, "") + "/";

  useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process();

    if (window.instgrm?.Embeds) {
      process();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-instagram-embed]');
    if (existing) {
      existing.addEventListener("load", process);
      return () => existing.removeEventListener("load", process);
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.dataset.instagramEmbed = "true";
    script.onload = process;
    document.body.appendChild(script);
  }, [permalink]);

  return (
    <div className="ig-embed-wrap" title={title}>
      <blockquote
        ref={ref}
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{
          background: "#fff",
          border: 0,
          borderRadius: 12,
          margin: 0,
          maxWidth: "100%",
          minWidth: 0,
          padding: 0,
          width: "100%",
        }}
      >
        <a href={permalink} target="_blank" rel="noopener noreferrer">
          View on Instagram
        </a>
      </blockquote>
      <style jsx>{`
        .ig-embed-wrap {
          width: 100%;
          overflow: hidden;
          border-radius: 14px;
          background: var(--card);
        }
        .ig-embed-wrap :global(iframe) {
          max-width: 100% !important;
        }
      `}</style>
    </div>
  );
}
