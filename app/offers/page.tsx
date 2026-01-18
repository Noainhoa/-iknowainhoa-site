import Link from "next/link";
import { getAllOffers } from "@/lib/content";

export default async function OffersIndex() {
  const offers = await getAllOffers();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Offers</h1>

      <ul style={{ marginTop: 24 }}>
        {offers.map((o) => (
          <li key={o.slug} style={{ marginBottom: 16 }}>
            <Link href={`/offers/${o.slug}`} style={{ fontSize: 20 }}>
              {o.title}
            </Link>
            {o.description ? (
              <div style={{ opacity: 0.8, marginTop: 4 }}>{o.description}</div>
            ) : null}
            {o.date ? (
              <div style={{ opacity: 0.6, marginTop: 4 }}>{o.date}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
