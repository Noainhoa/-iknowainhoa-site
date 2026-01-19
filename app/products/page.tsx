import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/content";

export default async function ProductsIndex() {
  const products = await getAllProducts();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Products</h1>

      {products.length === 0 ? (
        <div style={{ marginTop: 64, textAlign: "center", opacity: 0.6 }}>
          <p style={{ fontSize: 18 }}>No products yet</p>
        </div>
      ) : (
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {products.map((o) => (
          <Link
            key={o.slug}
            href={`/products/${o.slug}`}
            className="block rounded-lg overflow-hidden border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              textDecoration: "none",
              color: "inherit",
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
      )}
    </main>
  );
}
