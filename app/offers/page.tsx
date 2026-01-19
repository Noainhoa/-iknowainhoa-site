import Link from "next/link";
import Image from "next/image";
import { getAllOffers } from "@/lib/content";

export default async function OffersIndex() {
  const offers = await getAllOffers();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Offers</h1>

      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {offers.map((o) => (
          <Link
            key={o.slug}
            href={`/offers/${o.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #e5e5e5",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            {o.coverImage && (
              <div style={{ width: "100%", height: 160, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                <Image
                  src={o.coverImage}
                  alt={o.title}
                  width={280}
                  height={160}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div style={{ padding: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>{o.title}</h2>
              {o.description ? (
                <div style={{ opacity: 0.7, marginBottom: 8, fontSize: 14, lineHeight: 1.5 }}>{o.description}</div>
              ) : null}
              {o.date ? (
                <div style={{ opacity: 0.6, fontSize: 13 }}>{o.date}</div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
