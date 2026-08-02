import Image from "next/image";
import Link from "next/link";

/** Home stays sparse — content is added piece by piece. */
export default function Home() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <Link
          href="/parking-guardamar-centro"
          aria-label="Guardamar Parking"
          style={{
            display: "block",
            lineHeight: 0,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <Image
            src="/images/parking/guardamar-parking-badge.png"
            alt="Guardamar Parking"
            width={160}
            height={160}
            priority
            style={{ display: "block", width: 160, height: 160 }}
          />
        </Link>

        <a
          href="https://mueblesbegui.es/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Muebles Begui"
          style={{
            display: "block",
            lineHeight: 0,
            borderRadius: 12,
            overflow: "hidden",
            background: "#000",
          }}
        >
          <Image
            src="/images/projects/muebles-begui/logo.png"
            alt="Muebles Begui"
            width={220}
            height={125}
            priority
            style={{ display: "block", width: 220, height: "auto" }}
          />
        </a>
      </div>
    </main>
  );
}
