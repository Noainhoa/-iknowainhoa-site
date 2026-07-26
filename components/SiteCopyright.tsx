import { site } from "@/lib/site";

/** Minimal copyright line shown on every page. */
export default function SiteCopyright({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const year = new Date().getFullYear();

  return (
    <p
      className={className}
      style={{
        margin: 0,
        fontSize: "0.75rem",
        color: "var(--foreground-muted, #666)",
        textAlign: "center",
        ...style,
      }}
    >
      © {year} {site.name}
    </p>
  );
}
