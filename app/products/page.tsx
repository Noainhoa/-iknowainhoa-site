import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/content";

const typeColors: Record<string, string> = {
  physical: "#8b5cf6",
  digital: "#3b82f6",
  app: "#10b981",
  service: "#f59e0b",
};

const statusColors: Record<string, string> = {
  available: "#10b981",
  beta: "#3b82f6",
  "sold-out": "#ef4444",
  idea: "#6b7280",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  beta: "Beta",
  "sold-out": "Sold Out",
  idea: "Coming Soon",
};

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
            {/* Always render a placeholder block */}
            <div style={{ width: "100%", height: 160, overflow: "hidden", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {o.coverImage ? (
                <Image
                  src={o.coverImage}
                  alt={o.title}
                  width={280}
                  height={160}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => null}
                />
              ) : (
                <div style={{ fontSize: 12, opacity: 0.4, textAlign: "center" }}>No image</div>
              )}
              {/* Badges overlay */}
              <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {o.type && (
                  <span style={{
                    backgroundColor: typeColors[o.type] || "#6b7280",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}>
                    {o.type}
                  </span>
                )}
                {o.status && (
                  <span style={{
                    backgroundColor: statusColors[o.status] || "#6b7280",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                    {statusLabels[o.status]}
                  </span>
                )}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>{o.title}</h2>
              {o.price && (
                <div style={{ fontSize: 14, fontWeight: 600, color: "#000", marginBottom: 8 }}>
                  {o.price}
                </div>
              )}
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
