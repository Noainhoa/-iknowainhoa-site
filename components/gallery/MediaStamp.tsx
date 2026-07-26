import type { GalleryLocation } from "@/lib/galleries/blue";
import { formatGalleryDate } from "@/lib/galleries/blue";

type MediaStampProps = {
  date: string;
  location?: GalleryLocation;
  compact?: boolean;
};

/** Visual date + place stamp (place links to Google Maps). */
export default function MediaStamp({ date, location, compact }: MediaStampProps) {
  return (
    <div
      className="media-stamp"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: compact ? 2 : 4,
        padding: compact ? "6px 10px" : "8px 12px",
        borderRadius: 10,
        background: "rgba(15, 17, 21, 0.78)",
        color: "#f8f7f4",
        backdropFilter: "blur(8px)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: compact ? 11 : 12,
        letterSpacing: 0.3,
        lineHeight: 1.35,
        maxWidth: "100%",
      }}
    >
      <time dateTime={date} style={{ opacity: 0.95 }}>
        {formatGalleryDate(date)}
      </time>
      {location ? (
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#f8f7f4",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            opacity: 0.9,
          }}
        >
          {location.label}
        </a>
      ) : null}
    </div>
  );
}
