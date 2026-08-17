import type { Locale } from "@/lib/i18n/shared";

/** Live brand destinations formerly on home — shown as a logo section on /work. */
export type WorkBrand = {
  id: "parking" | "begui" | "anicca" | "listeneasy";
  name: string;
  href: string;
  logo: string;
  /** Prefer wider logo treatment (wordmark). */
  wide?: boolean;
  /** Work index slug to omit from category grids (avoid double listing). */
  omitWorkSlug?: string;
  summary: Record<Locale, string>;
};

export const WORK_BRANDS: WorkBrand[] = [
  {
    id: "parking",
    name: "Guardamar Parking",
    href: "/parking-guardamar-centro",
    logo: "/images/parking/guardamar-parking-badge.png",
    summary: {
      en: "Private parking bookings in central Guardamar.",
      es: "Reservas de parking privado en el centro de Guardamar.",
      fr: "Private parking bookings in central Guardamar.",
    },
  },
  {
    id: "begui",
    name: "Muebles Begui",
    href: "https://mueblesbegui.es/",
    logo: "/images/projects/muebles-begui/logo.png",
    wide: true,
    omitWorkSlug: "muebles-begui",
    summary: {
      en: "Website for a furniture shop.",
      es: "Web para una tienda de muebles.",
      fr: "Website for a furniture shop.",
    },
  },
  {
    id: "anicca",
    name: "Anicca",
    href: "/anicca",
    logo: "/images/projects/anicca/logo.png",
    summary: {
      en: "Reminder tokens for impermanence.",
      es: "Tokens recordatorio de la impermanencia.",
      fr: "Reminder tokens for impermanence.",
    },
  },
  {
    id: "listeneasy",
    name: "ListenEasy",
    href: "/listeneasy",
    logo: "/images/projects/listeneasy/brand-mark.png",
    omitWorkSlug: "listeneasy",
    summary: {
      en: "Audiobook library for books you already own.",
      es: "Biblioteca de audiolibros que ya tienes.",
      fr: "Audiobook library for books you already own.",
    },
  },
];

export function workBrandOmitSlugs(): Set<string> {
  return new Set(
    WORK_BRANDS.map((b) => b.omitWorkSlug).filter(
      (slug): slug is string => Boolean(slug)
    )
  );
}
