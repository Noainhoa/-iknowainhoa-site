import type { Metadata } from "next";
import BluePatchworkGallery from "@/components/gallery/BluePatchworkGallery";
import { blueGalleryItems } from "@/lib/galleries/blue";
import { publicPages, site } from "@/lib/site";
import BlankPage from "@/components/BlankPage";

export const metadata: Metadata = {
  title: "Blue — Gallery",
  description: "A timeline patchwork of Blue: local photos, videos, and Instagram moments with place and date.",
  alternates: { canonical: `${site.url}/gallery/blue` },
};

export default function BlueGalleryPage() {
  if (!publicPages.gallery) return <BlankPage />;

  return (
    <main
      style={{
        padding: "32px 20px 64px",
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <header style={{ marginBottom: 36, maxWidth: 640 }}>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            letterSpacing: 0.16,
            textTransform: "uppercase",
            opacity: 0.55,
          }}
        >
          Gallery
        </p>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 750, lineHeight: 1.1 }}>Blue</h1>
        <p style={{ margin: "14px 0 0", fontSize: 17, lineHeight: 1.65, opacity: 0.8 }}>
          A patchwork timeline — not an equal grid. Local photos and clips sit beside public Instagram
          posts and reels. Each piece is stamped with when it happened; places open in Google Maps.
        </p>
      </header>

      <BluePatchworkGallery items={blueGalleryItems} />
    </main>
  );
}
