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
    </main>
  );
}
