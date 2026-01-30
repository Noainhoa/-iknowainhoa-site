import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getProduct, getAllProductSlugs } from "@/lib/content";

const statusLabels: Record<string, string> = {
  available: "Available",
  beta: "Beta",
  "sold-out": "Sold Out",
  idea: "Coming Soon",
};

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Not Found" };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: product.coverImage
      ? { images: [product.coverImage] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return notFound();

  // Determine CTA button state
  const isSoldOut = product.status === "sold-out";
  const isIdea = product.status === "idea";
  
  // Determine CTA URL and text
  let ctaUrl = product.ctaUrl || product.cta?.link;
  let ctaText = product.ctaText || product.cta?.text || "Get Started";
  
  if (isIdea && product.waitlistUrl) {
    ctaUrl = product.waitlistUrl;
    ctaText = "Join Waitlist";
  }

  return (
    <main style={{ padding: "32px 24px", fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start", marginBottom: 48 }}>
        {/* Image Column */}
        {product.coverImage && (
          <div style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 8, position: "sticky", top: 80 }}>
            <Image
              src={product.coverImage}
              alt={product.title || ""}
              width={400}
              height={400}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Content Column */}
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 8px 0", lineHeight: 1.2 }}>
            {product.title}
          </h1>
          
          {/* Type and Status Badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {product.type && (
              <span style={{
                backgroundColor: "#e5e7eb",
                color: "#374151",
                padding: "4px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                textTransform: "capitalize",
              }}>
                {product.type}
              </span>
            )}
            {product.status && (
              <span style={{
                backgroundColor: product.status === "sold-out" ? "#fee2e2" : product.status === "idea" ? "#f3f4f6" : "#dcfce7",
                color: product.status === "sold-out" ? "#991b1b" : product.status === "idea" ? "#374151" : "#166534",
                padding: "4px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
              }}>
                {statusLabels[product.status]}
              </span>
            )}
          </div>

          {/* Price */}
          {product.price && (
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 16 }}>
              {product.price}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p style={{ fontSize: "1.125rem", opacity: 0.7, marginBottom: 32, lineHeight: 1.6 }}>
              {product.description}
            </p>
          )}

          {/* Body Content */}
          <div
            className="prose"
            style={{ marginBottom: 32, lineHeight: 1.8, fontSize: "1rem" }}
            dangerouslySetInnerHTML={{ __html: product.html }}
          />

          {/* CTA Button - Prominent with smart logic */}
          {isSoldOut ? (
            <div
              style={{
                display: "inline-block",
                padding: "16px 32px",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                textDecoration: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "1rem",
                border: "2px solid #d1d5db",
                cursor: "not-allowed",
              }}
            >
              Sold Out
            </div>
          ) : isIdea ? (
            <a
              href={ctaUrl || "#"}
              style={{
                display: "inline-block",
                padding: "16px 32px",
                backgroundColor: "#6b7280",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "1rem",
                transition: "background-color 0.2s",
                border: "2px solid #6b7280",
              }}
              className="hover:opacity-80"
            >
              {ctaText}
            </a>
          ) : ctaUrl ? (
            <a
              href={ctaUrl}
              target={ctaUrl.startsWith("http") ? "_blank" : undefined}
              rel={ctaUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                display: "inline-block",
                padding: "16px 32px",
                backgroundColor: "#000",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "1rem",
                transition: "background-color 0.2s",
                border: "2px solid #000",
              }}
              className="hover:opacity-80"
            >
              {ctaText}
            </a>
          ) : null}
        </div>
      </div>

      {/* Features Section - if features exists */}
      {product.features && Array.isArray(product.features) && product.features.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 24 }}>Features</h2>
          <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, listStyle: "none", padding: 0 }}>
            {product.features.map((feature, idx) => (
              <li key={idx} style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
                {typeof feature === "object" && feature !== null && "name" in feature ? (
                  <>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px 0" }}>{feature.name}</h3>
                    <p style={{ fontSize: "0.9rem", opacity: 0.7, margin: 0 }}>{feature.description}</p>
                  </>
                ) : (
                  <p style={{ fontSize: "1rem", margin: 0 }}>✓ {feature}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
