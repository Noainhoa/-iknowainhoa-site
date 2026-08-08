import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata } from "next";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import { site } from "@/lib/site";

export type ProductAppStatus = "available" | "in-development";

export type ProductAppFeature = {
  title: string;
  description: string;
};

export type ProductAppScreenshot = {
  src?: string;
  alt: string;
  label?: string;
};

export type ProductAppPricing = {
  free: string;
  pro?: string;
};

export type ProductAppPageMeta = {
  title: string;
  description: string;
};

export type ProductApp = {
  slug: "photoarc" | "listeneasy";
  name: string;
  status: ProductAppStatus;
  statusLabel: string;
  tagline: string;
  summary: string;
  platform?: string;
  version?: string;
  lastUpdated?: string;
  contactEmail: string;
  appStoreUrl?: string | null;
  features: ProductAppFeature[];
  howItWorks: string[];
  pricing?: ProductAppPricing;
  screenshots: ProductAppScreenshot[];
  notes?: string[];
  pages: {
    product: ProductAppPageMeta;
    support: ProductAppPageMeta;
    privacy: ProductAppPageMeta;
  };
};

export type ProductAppMarkdownPage = {
  title: string;
  description?: string;
  date?: string;
  html: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "product-apps");

export const productApps: ProductApp[] = [
  {
    slug: "photoarc",
    name: "PhotoArc",
    status: "available",
    statusLabel: "Available for iPhone",
    tagline:
      "Turn selected photos into a clean progression video and watch change unfold over time.",
    summary:
      "PhotoArc is a native iOS utility that turns photos you deliberately choose into a silent progression video you can preview, share, or save. You pick the frames—PhotoArc does not scan or import your entire photo library.",
    platform: "iPhone, iOS 17 and later",
    version: "1.0",
    lastUpdated: "July 2026",
    contactEmail: site.email,
    appStoreUrl: null,
    features: [
      {
        title: "Select what matters",
        description:
          "Choose photos deliberately with Apple’s PhotosPicker. PhotoArc only receives the images you pick—not your full library.",
      },
      {
        title: "On-device processing",
        description:
          "Selected media is processed on your iPhone to build a silent progression video. Photos stay on device.",
      },
      {
        title: "Preview, share, or save",
        description:
          "Review the result, share it through the system share sheet, or save it to Photos with add-only access.",
      },
      {
        title: "Three free progressions",
        description:
          "Create up to three progression videos for free, then unlock PhotoArc Pro for unlimited use with a one-time purchase.",
      },
    ],
    howItWorks: [
      "Open PhotoArc and choose the photos you want to include.",
      "Create a silent progression video from those selected frames.",
      "Preview the result, then share it or save it to Photos.",
    ],
    pricing: {
      free: "Three free progressions to try the full create → preview → share or save flow.",
      pro: "One-time PhotoArc Pro purchase for unlimited progressions.",
    },
    screenshots: [
      { alt: "PhotoArc screenshot placeholder: selecting photos", label: "Select photos" },
      { alt: "PhotoArc screenshot placeholder: creating a progression", label: "Create" },
      { alt: "PhotoArc screenshot placeholder: previewing the video", label: "Preview" },
    ],
    notes: [
      "Compatible with iPhone on iOS 17 and later.",
      "Uses Apple’s PhotosPicker so you deliberately select photos.",
      "Does not require unrestricted access to the full photo library.",
    ],
    pages: {
      product: {
        title: "PhotoArc",
        description:
          "Turn selected photos into a clean progression video and watch change unfold over time. On-device iOS app for iPhone.",
      },
      support: {
        title: "PhotoArc Support",
        description: "Help, FAQ, and contact for the PhotoArc iOS app.",
      },
      privacy: {
        title: "PhotoArc Privacy Policy",
        description: "How PhotoArc handles photos and data on your device.",
      },
    },
  },
  {
    slug: "listeneasy",
    name: "ListenEasy",
    status: "in-development",
    statusLabel: "Open beta",
    tagline: "For the audiobooks you already own.",
    summary:
      "Stop managing folders of tracks. ListenEasy turns audiobooks you already own into a real library on iPhone · multi-file sets stay one book, and you never lose your place.",
    platform: "iPhone",
    contactEmail: site.email,
    appStoreUrl: null,
    features: [
      {
        title: "Stop living in folders of tracks",
        description:
          "Multi-file and CD/disc sets become one book · not dozens of separate files.",
      },
      {
        title: "A library for books you already own",
        description:
          "Import from Files. No audiobook store, subscription, or account.",
      },
      {
        title: "Never lose your place",
        description:
          "Position saved for every book. Resume exactly where you stopped.",
      },
    ],
    howItWorks: [],
    screenshots: [],
    notes: [
      "Open beta via TestFlight: https://testflight.apple.com/join/5uYmScxX",
    ],
    pages: {
      product: {
        title: "ListenEasy",
        description:
          "For the audiobooks you already own. Multi-file books stay together, and you never lose your place. Join the ListenEasy open beta on TestFlight.",
      },
      support: {
        title: "ListenEasy Support",
        description: "Support information for the ListenEasy beta.",
      },
      privacy: {
        title: "ListenEasy Privacy Policy",
        description:
          "Preliminary privacy information for ListenEasy. The full policy will be published before App Store release.",
      },
    },
  },
];

export function getProductApp(slug: string): ProductApp | undefined {
  return productApps.find((app) => app.slug === slug);
}

export function getAllProductApps(): ProductApp[] {
  return productApps;
}

export function productAppPaths(slug: ProductApp["slug"]) {
  return {
    product: `/${slug}`,
    support: `/${slug}/support`,
    privacy: `/${slug}/privacy`,
  } as const;
}

export function buildProductAppMetadata(
  app: ProductApp,
  page: keyof ProductApp["pages"]
): Metadata {
  const meta = app.pages[page];
  const paths = productAppPaths(app.slug);
  const canonicalPath = paths[page];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalPath,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: meta.title,
      description: meta.description,
    },
  };
}

async function loadMarkdown(
  slug: ProductApp["slug"],
  fileName: "support.md" | "privacy.md"
): Promise<ProductAppMarkdownPage | null> {
  const filePath = path.join(CONTENT_DIR, slug, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const rendered = await remark().use(remarkGfm).use(html).process(content);
    return {
      title: typeof data.title === "string" ? data.title : slug,
      description: typeof data.description === "string" ? data.description : undefined,
      date: typeof data.date === "string" ? data.date : undefined,
      html: String(rendered),
    };
  } catch {
    return null;
  }
}

export async function getProductAppSupportPage(slug: ProductApp["slug"]) {
  return loadMarkdown(slug, "support.md");
}

export async function getProductAppPrivacyPage(slug: ProductApp["slug"]) {
  return loadMarkdown(slug, "privacy.md");
}
