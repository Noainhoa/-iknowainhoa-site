import Link from "next/link";
import Image from "next/image";
import BlankPage from "@/components/BlankPage";
import { getAllOffers } from "@/lib/content";
import { publicPages } from "@/lib/site";

export default async function OffersPage() {
  if (!publicPages.offers) return <BlankPage />;

  const offers = await getAllOffers();

  return (
    <main style={{ padding: 32, maxWidth: 980, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ fontSize: "2.25rem", marginBottom: 24 }}>Offers</h1>

      {offers.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No offers available yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {offers.map((offer) => (
            <Link
              key={offer.slug}
              href={`/offers/${offer.slug}`}
              style={{
                display: "block",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                textDecoration: "none",
                color: "inherit",
                background: "#fff",
                padding: 20,
              }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {offer.coverImage ? (
                  <Image
                    src={offer.coverImage}
                    alt={offer.title}
                    width={90}
                    height={90}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                ) : null}
                <div>
                  <h2 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>{offer.title}</h2>
                  <p style={{ margin: 0, opacity: 0.75 }}>{offer.description}</p>
                  {offer.price && <p style={{ margin: "8px 0 0", fontWeight: 700 }}>{offer.price}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
