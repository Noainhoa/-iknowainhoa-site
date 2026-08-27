import type { Locale } from "@/lib/i18n/shared";
import { localeTag } from "@/lib/i18n/shared";

export type GalleryLocation = {
  label: string;
  mapsUrl: string;
};

export type GalleryItem = {
  id: string;
  /** ISO date YYYY-MM-DD for timeline sorting */
  date: string;
  title: string;
  location?: GalleryLocation;
  kind: "photo" | "video" | "instagram-post" | "instagram-reel";
  /** Local public path (spaces encoded by the UI) */
  src?: string;
  /** Cover still for Instagram reels/posts (hosted locally — image only, no IG chrome) */
  coverSrc?: string;
  instagramUrl?: string;
  width?: number;
  height?: number;
  caption?: string;
};

const maps = {
  kildangan: {
    label: "Kildangan, Kildare, Ireland",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kildangan%2C%20Kildare%2C%20Ireland",
  },
  henley: {
    label: "Henley-on-Thames, UK",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Henley-on-Thames%2C%20UK",
  },
  roselea: {
    label: "Roselea, Hoddesdon, UK",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hoddesdon%2C%20UK",
  },
  leeValley: {
    label: "Lee Valley Park, Hoddesdon, UK",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lee%20Valley%20Park%2C%20Hoddesdon%2C%20UK",
  },
} as const;

/**
 * Blue timeline — oldest → newest.
 * Instagram dates are approximate from post order + story context
 * (Instagram no longer returns public oEmbed dates without auth).
 * Local file dates come from filenames / EXIF where available.
 */
export const blueGalleryItems: GalleryItem[] = [
  // ——— 2015 ———
  {
    id: "ig-9VdMA0ifuj",
    date: "2015-10-01",
    title: "Blue arrives in Kildangan",
    location: maps.kildangan,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/9VdMA0ifuj/",
    caption: "Blue llega a Kildangan, Kildare, Ireland",
  },
  {
    id: "ig-9VeLtzCfvl",
    date: "2015-10-02",
    title: "He owns us",
    location: maps.kildangan,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/9VeLtzCfvl/",
  },
  {
    id: "local-blue-bowl-2015",
    date: "2015-10-06",
    title: "Puppy bowl",
    location: maps.kildangan,
    kind: "video",
    src: "/images/galleries/blue/videos/BLUE-peque-bowlcomida2015-10-06.mov",
    width: 9,
    height: 16,
  },
  {
    id: "ig-reel-9VvuiUifnH",
    date: "2015-10-08",
    title: "Early reel",
    location: maps.kildangan,
    kind: "instagram-reel",
    instagramUrl: "https://www.instagram.com/reel/9VvuiUifnH/",
    coverSrc: "/images/galleries/blue/stills/9VvuiUifnH.jpg",
    width: 640,
    height: 640,
  },
  {
    id: "ig-9kxzguCfks",
    date: "2015-10-20",
    title: "He owns our bed",
    location: maps.kildangan,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/9kxzguCfks/",
  },
  {
    id: "ig-9y5hOoifrs",
    date: "2015-11-15",
    title: "Family portrait",
    location: maps.kildangan,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/9y5hOoifrs/",
  },
  {
    id: "ig-_w03nUCfpq",
    date: "2015-12-25",
    title: "Xmas — barely 8 months old",
    location: maps.kildangan,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/_w03nUCfpq/",
  },

  // ——— 2016 ———
  {
    id: "local-2016-04-18-a",
    date: "2016-04-18",
    title: "April light",
    kind: "photo",
    src: "/images/galleries/blue/photos/2016-04-18 13.28.14.jpg",
    width: 6016,
    height: 4016,
  },
  {
    id: "local-2016-04-18-b",
    date: "2016-04-18",
    title: "April light",
    kind: "photo",
    src: "/images/galleries/blue/photos/2016-04-18 13.31.11.jpg",
    width: 6016,
    height: 4016,
  },
  {
    id: "local-2016-04-18-c",
    date: "2016-04-18",
    title: "April light",
    kind: "photo",
    src: "/images/galleries/blue/photos/2016-04-18 13.32.21.jpg",
    width: 6016,
    height: 4016,
  },
  {
    id: "ig-BH4UwHsjgP8",
    date: "2016-07-15",
    title: "New family addition, Gringo",
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/BH4UwHsjgP8/",
  },
  {
    id: "local-campo-2016",
    date: "2016-08-20",
    title: "Blue & Gringo in the field",
    kind: "video",
    src: "/images/galleries/blue/videos/BlueGringoCampoRulos2016-08-20.mov",
    width: 16,
    height: 9,
  },
  {
    id: "local-2016-12-02",
    date: "2016-12-02",
    title: "Winter portrait",
    kind: "photo",
    src: "/images/galleries/blue/photos/2016-12-02 13.24.33.jpg",
    width: 3024,
    height: 4032,
  },
  {
    id: "ig-BMPN_kfgWID",
    date: "2016-12-10",
    title: "Arrival in Henley-on-Thames",
    location: maps.henley,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/BMPN_kfgWID/",
    caption: "Llegada a Henley on Thames, UK",
  },

  // ——— 2017 ———
  {
    id: "ig-reel-BRN7U0xA5Eu",
    date: "2017-05-01",
    title: "Reel",
    kind: "instagram-reel",
    instagramUrl: "https://www.instagram.com/reel/BRN7U0xA5Eu/",
    coverSrc: "/images/galleries/blue/stills/BRN7U0xA5Eu.jpg",
    width: 720,
    height: 720,
  },

  // ——— 2018 ———
  {
    id: "ig-BanJtt3n9zH",
    date: "2018-01-10",
    title: "New home, Roselea",
    location: maps.roselea,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/BanJtt3n9zH/",
  },
  {
    id: "ig-reel-BanKxCjHUoq",
    date: "2018-01-11",
    title: "Roselea reel",
    location: maps.roselea,
    kind: "instagram-reel",
    instagramUrl: "https://www.instagram.com/reel/BanKxCjHUoq/",
    coverSrc: "/images/galleries/blue/stills/BanKxCjHUoq.jpg",
    width: 612,
    height: 612,
  },
  {
    id: "ig-BanLr7GH7tf",
    date: "2018-01-12",
    title: "Sunbathing at the back",
    location: maps.leeValley,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/BanLr7GH7tf/",
    caption: "Lee Valley Park, Hoddesdon, UK",
  },
  {
    id: "local-2018-02-24",
    date: "2018-02-24",
    title: "February evening",
    location: maps.roselea,
    kind: "video",
    src: "/images/galleries/blue/videos/2018-02-24 23.13.00.mov",
    width: 9,
    height: 16,
  },
  {
    id: "ig-Bbm2zVZnids",
    date: "2018-03-20",
    title: "Blue sleeping",
    location: maps.roselea,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/Bbm2zVZnids/",
  },
  {
    id: "ig-Bbm3eecHbxj",
    date: "2018-03-21",
    title: "Gringo sleeping",
    location: maps.roselea,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/Bbm3eecHbxj/",
  },
  {
    id: "ig-Bbm4QN8Hi6h",
    date: "2018-03-22",
    title: "Blue, man's flu",
    location: maps.roselea,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/Bbm4QN8Hi6h/",
  },
  {
    id: "ig-Bbm5QfMHAJU",
    date: "2018-03-23",
    title: "We all have man's flu",
    location: maps.roselea,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/Bbm5QfMHAJU/",
  },
  {
    id: "local-2018-06-16",
    date: "2018-06-16",
    title: "June afternoon",
    location: maps.roselea,
    kind: "video",
    src: "/images/galleries/blue/videos/2018-06-16 18.29.13.mov",
    width: 9,
    height: 16,
  },
  {
    id: "ig-Bn8iEjEFTpL",
    date: "2018-09-15",
    title: "Simply home",
    location: maps.roselea,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/Bn8iEjEFTpL/",
  },
  {
    id: "ig-BoE3V1LFeej",
    date: "2018-10-01",
    title: "Gringo, simply home",
    location: maps.roselea,
    kind: "instagram-post",
    instagramUrl: "https://www.instagram.com/p/BoE3V1LFeej/",
  },
  {
    id: "local-IMG_2409",
    date: "2018-11-24",
    title: "November",
    location: maps.roselea,
    kind: "photo",
    src: "/images/galleries/blue/photos/IMG_2409.jpg",
    width: 3024,
    height: 4032,
  },
  {
    id: "ig-reel-BrKowCGhRt-",
    date: "2018-12-10",
    title: "Reel",
    kind: "instagram-reel",
    instagramUrl: "https://www.instagram.com/reel/BrKowCGhRt-/",
    coverSrc: "/images/galleries/blue/stills/BrKowCGhRt-.jpg",
    width: 720,
    height: 407,
  },
  {
    id: "ig-reel-BsU6nvwhaRd",
    date: "2018-12-20",
    title: "Reel",
    kind: "instagram-reel",
    instagramUrl: "https://www.instagram.com/reel/BsU6nvwhaRd/",
    coverSrc: "/images/galleries/blue/stills/BsU6nvwhaRd.jpg",
    width: 612,
    height: 612,
  },
  {
    id: "ig-reel-BsVpv6dBV8r",
    date: "2018-12-22",
    title: "Reel",
    kind: "instagram-reel",
    instagramUrl: "https://www.instagram.com/reel/BsVpv6dBV8r/",
    coverSrc: "/images/galleries/blue/stills/BsVpv6dBV8r.jpg",
    width: 720,
    height: 720,
  },

  // Undated local still (download metadata only) — kept at the end of known years
  {
    id: "local-IMG_4247",
    date: "2018-12-31",
    title: "Blue",
    kind: "photo",
    src: "/images/galleries/blue/photos/IMG_4247.jpg",
    width: 1200,
    height: 1600,
    caption: "Date approximate — EXIF missing on this file",
  },
];

export function groupBlueGalleryByYear(items: GalleryItem[] = blueGalleryItems) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const groups = new Map<string, GalleryItem[]>();
  for (const item of sorted) {
    const year = item.date.slice(0, 4);
    const list = groups.get(year) ?? [];
    list.push(item);
    groups.set(year, list);
  }
  return [...groups.entries()].map(([year, yearItems]) => ({ year, items: yearItems }));
}

export function formatGalleryDate(iso: string, locale: Locale = "en") {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(localeTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const galleryTitleEs: Record<string, string> = {
  "ig-9VdMA0ifuj": "Blue llega a Kildangan",
  "ig-9VeLtzCfvl": "Nos tiene cogidos",
  "local-blue-bowl-2015": "Cuenco de cachorro",
  "ig-reel-9VvuiUifnH": "Reel de los primeros días",
  "ig-9kxzguCfks": "Se queda con la cama",
  "ig-9y5hOoifrs": "Retrato de familia",
  "ig-_w03nUCfpq": "Navidad — con apenas 8 meses",
  "local-2016-04-18-a": "Luz de abril",
  "local-2016-04-18-b": "Luz de abril",
  "local-2016-04-18-c": "Luz de abril",
  "ig-BH4UwHsjgP8": "Llega Gringo a la familia",
  "local-campo-2016": "Blue y Gringo en el campo",
  "local-2016-12-02": "Retrato de invierno",
  "ig-BMPN_kfgWID": "Llegada a Henley-on-Thames",
  "ig-reel-BRN7U0xA5Eu": "Reel",
  "ig-BanJtt3n9zH": "Casa nueva, Roselea",
  "ig-reel-BanKxCjHUoq": "Reel de Roselea",
  "ig-BanLr7GH7tf": "Tomando el sol detrás",
  "local-2018-02-24": "Tarde de febrero",
  "ig-Bbm2zVZnids": "Blue durmiendo",
  "ig-Bbm3eecHbxj": "Gringo durmiendo",
  "ig-Bbm4QN8Hi6h": "Blue, gripe de hombre",
  "ig-Bbm5QfMHAJU": "Gripe de hombre para todos",
  "local-2018-06-16": "Tarde de junio",
  "ig-Bn8iEjEFTpL": "Simplemente en casa",
  "ig-BoE3V1LFeej": "Gringo, simplemente en casa",
  "local-IMG_2409": "Noviembre",
  "ig-reel-BrKowCGhRt-": "Reel",
  "ig-reel-BsU6nvwhaRd": "Reel",
  "ig-reel-BsVpv6dBV8r": "Reel",
  "local-IMG_4247": "Blue",
};

const galleryCaptionEs: Record<string, string> = {
  "ig-9VdMA0ifuj": "Blue llega a Kildangan, Kildare, Irlanda",
  "ig-BMPN_kfgWID": "Llegada a Henley-on-Thames, Reino Unido",
  "local-IMG_4247": "Fecha aproximada: este archivo no tiene EXIF",
};

export function localizeGalleryItem(item: GalleryItem, locale: Locale): GalleryItem {
  if (locale !== "es") return item;
  return {
    ...item,
    title: galleryTitleEs[item.id] || item.title,
    caption: galleryCaptionEs[item.id] || item.caption,
  };
}

export function localizeGalleryItems(items: GalleryItem[], locale: Locale): GalleryItem[] {
  return items.map((item) => localizeGalleryItem(item, locale));
}

/** Curated local photos for the blog post side strip (not the full timeline). */
const blueAsideIds = [
  "local-2016-04-18-a",
  "local-2016-04-18-c",
  "local-2016-12-02",
  "local-IMG_2409",
  "local-IMG_4247",
  "local-2016-04-18-b",
] as const;

export function getAsideGallery(
  id: string,
  locale: Locale = "en"
): {
  title: string;
  href: string;
  items: GalleryItem[];
} | null {
  if (id === "blue") {
    const byId = new Map(blueGalleryItems.map((item) => [item.id, item]));
    const items = blueAsideIds
      .map((itemId) => byId.get(itemId))
      .filter((item): item is GalleryItem => Boolean(item?.src));
    return {
      title: locale === "es" ? "Blue" : "Blue",
      href: "/gallery/blue",
      items: localizeGalleryItems(items, locale),
    };
  }
  return null;
}

