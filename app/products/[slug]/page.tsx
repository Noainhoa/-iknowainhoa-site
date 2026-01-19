import { notFound } from "next/navigation";
import Image from "next/image";
import { getProduct, getAllProductSlugs } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return notFound();

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
      {product.coverImage && (
        <div style={{ marginBottom: 24, overflow: "hidden", borderRadius: 8 }}>
          <Image
            src={product.coverImage}
            alt={product.title || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
      {product.date ? (
        <div style={{ opacity: 0.6, marginBottom: 16, fontSize: 14 }}>{product.date}</div>
      ) : null}
      <div
        style={{ marginTop: 24, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: product.html }}
      />
      {product.cta && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #e5e5e5" }}>
          <a
            href={product.cta.link}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#000",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {product.cta.text}
          </a>
        </div>
      )}
    </main>
  );
}
