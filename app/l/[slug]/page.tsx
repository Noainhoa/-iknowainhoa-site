import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getLanding, getAllLandingSlugs } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllLandingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLanding(slug);

  if (!page) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: page.title || "Landing",
    description: page.description || undefined,
    openGraph: page.coverImage
      ? {
          images: [page.coverImage],
        }
      : undefined,
  };
}

export default async function LandingPage({
  params,
}: {
  // Next 16 can provide params as a Promise (Server Components).
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;      // ✅ unwrap
  const page = await getLanding(slug);
  if (!page) return notFound();

  return (
    <main style={{ fontFamily: "system-ui" }}>
      {/* Hero Section */}
      {page.coverImage ? (
        <div style={{ position: "relative", height: "clamp(400px, 100vh, 600px)", overflow: "hidden" }}>
          <Image
            src={page.coverImage}
            alt={page.title || ""}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: 32,
            }}
          >
            {page.title && (
              <h1
                style={{
                  fontSize: "clamp(2rem, 8vw, 3.5rem)",
                  fontWeight: 700,
                  color: "var(--primary-contrast)",
                  margin: "0 0 16px 0",
                  lineHeight: 1.2,
                }}
              >
                {page.title}
              </h1>
            )}
            {page.description && (
              <p
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  color: "rgba(255,255,255,0.9)",
                  margin: 0,
                  maxWidth: 600,
                }}
              >
                {page.description}
              </p>
            )}
            {page.cta && (
              <a
                href={page.cta.link}
                style={{
                  marginTop: 32,
                  display: "inline-block",
                  padding: "14px 32px",
                  backgroundColor: "var(--primary-contrast)",
                  color: "#0f1115",
                  textDecoration: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: "1rem",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                {page.cta.text}
              </a>
            )}
          </div>
        </div>
      ) : (
        /* Fallback if no cover image */
        <div
          style={{
            padding: "80px 32px",
            textAlign: "center",
            backgroundColor: "var(--muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {page.title && (
            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 16px 0" }}>
              {page.title}
            </h1>
          )}
          {page.description && (
            <p style={{ fontSize: "1.125rem", opacity: 0.7, maxWidth: 600, margin: "0 auto" }}>
              {page.description}
            </p>
          )}
          {page.cta && (
            <a
              href={page.cta.link}
              style={{
                marginTop: 24,
                display: "inline-block",
                padding: "14px 32px",
                backgroundColor: "var(--primary)",
                color: "var(--primary-contrast)",
                textDecoration: "none",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              {page.cta.text}
            </a>
          )}
        </div>
      )}

      {/* Body Content Section */}
      <div style={{ padding: "64px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div className="prose" style={{ lineHeight: 1.8, fontSize: "1rem" }} dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    </main>
  );
}
