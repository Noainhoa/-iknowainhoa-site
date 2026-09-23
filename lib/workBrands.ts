import type { Locale } from "@/lib/i18n/shared";
import type { WorkCategory, WorkItem } from "@/lib/work-shared";

/** Live destinations shown as cards inside Work categories. */
export type WorkBrand = {
  id: "parking" | "begui" | "anicca" | "listeneasy";
  name: string;
  href: string;
  logo: string;
  category: WorkCategory;
  /** Existing work slug to merge with instead of adding a second card. */
  omitWorkSlug?: string;
  summary: Record<Locale, string>;
};

export const WORK_BRANDS: WorkBrand[] = [
  {
    id: "listeneasy",
    name: "ListenEasy",
    href: "/listeneasy",
    logo: "/images/projects/listeneasy/brand-mark.png",
    category: "apps",
    omitWorkSlug: "listeneasy",
    summary: {
      en: "Audiobook library for books you already own.",
      es: "Biblioteca de audiolibros que ya tienes.",
      fr: "Audiobook library for books you already own.",
    },
  },
  {
    id: "begui",
    name: "Muebles Begui",
    href: "https://mueblesbegui.es/",
    logo: "/images/projects/muebles-begui/logo.png",
    category: "websites",
    omitWorkSlug: "muebles-begui",
    summary: {
      en: "Website for a furniture shop.",
      es: "Web para una tienda de muebles.",
      fr: "Website for a furniture shop.",
    },
  },
  {
    id: "parking",
    name: "Guardamar Parking",
    href: "/parking-guardamar-centro",
    logo: "/images/parking/guardamar-parking-badge.png",
    category: "systems",
    summary: {
      en: "Private parking bookings in central Guardamar.",
      es: "Reservas de parking privado en el centro de Guardamar.",
      fr: "Private parking bookings in central Guardamar.",
    },
  },
  {
    id: "anicca",
    name: "Anicca",
    href: "/anicca",
    logo: "/images/projects/anicca/logo.png",
    category: "product-design",
    summary: {
      en: "Reminder tokens for impermanence.",
      es: "Tokens recordatorio de la impermanencia.",
      fr: "Reminder tokens for impermanence.",
    },
  },
];

/** Hidden from /work (and “more work”), case pages stay reachable. */
export const WORK_INDEX_HIDDEN_SLUGS = new Set([
  "places",
  "rent-your-parking-space",
  "whatnow-app",
  "portfolio-site",
  "watnow.pwa-snippet",
]);

const INDEX_ORDER = WORK_BRANDS.map((brand) => brand.omitWorkSlug ?? brand.id);

function brandSlug(brand: WorkBrand): string {
  return brand.omitWorkSlug ?? brand.id;
}

function brandToWorkItem(brand: WorkBrand, locale: Locale): WorkItem {
  return {
    slug: brandSlug(brand),
    title: brand.name,
    description: brand.summary[locale],
    coverImage: brand.logo,
    logo: brand.logo,
    category: brand.category,
    summary: brand.summary[locale],
    href: brand.href,
    source: "projects",
    tags: [],
  };
}

export function listedWorkItems(items: WorkItem[], locale: Locale): WorkItem[] {
  const filtered = items.filter((item) => !WORK_INDEX_HIDDEN_SLUGS.has(item.slug));
  const bySlug = new Map(filtered.map((item) => [item.slug, item]));

  for (const brand of WORK_BRANDS) {
    const slug = brandSlug(brand);
    const existing = bySlug.get(slug);
    if (existing) {
      bySlug.set(slug, {
        ...existing,
        category: brand.category,
        summary: brand.summary[locale],
        href: brand.href,
      });
      continue;
    }
    bySlug.set(slug, brandToWorkItem(brand, locale));
  }

  const rank = new Map(INDEX_ORDER.map((slug, index) => [slug, index]));
  return [...bySlug.values()].sort((a, b) => {
    const ra = rank.get(a.slug) ?? 100;
    const rb = rank.get(b.slug) ?? 100;
    if (ra !== rb) return ra - rb;
    return 0;
  });
}
