import type { Metadata } from "next";
import BluePatchworkGallery from "@/components/gallery/BluePatchworkGallery";
import { blueGalleryItems, localizeGalleryItems } from "@/lib/galleries/blue";
import { publicPages, site } from "@/lib/site";
import BlankPage from "@/components/BlankPage";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return {
    title: `${t.gallery.title} — ${t.gallery.kicker}`,
    description: t.gallery.intro,
    alternates: { canonical: `${site.url}/gallery/blue` },
  };
}

export default async function BlueGalleryPage() {
  if (!publicPages.gallery) return <BlankPage />;

  const locale = await getLocale();
  const t = getDictionary(locale);
  const items = localizeGalleryItems(blueGalleryItems, locale);

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
          {t.gallery.kicker}
        </p>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 750, lineHeight: 1.1 }}>
          {t.gallery.title}
        </h1>
        <p style={{ margin: "14px 0 0", fontSize: 17, lineHeight: 1.65, opacity: 0.8 }}>
          {t.gallery.intro}
        </p>
      </header>

      <BluePatchworkGallery items={items} locale={locale} />
    </main>
  );
}
