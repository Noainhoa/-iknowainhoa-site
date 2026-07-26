// lib/content.ts
//*This will: read nested folders like content/blog/2026/01-january/...
// ignore content/_templates
// hide drafts if either:
// frontmatter has draft: true, or
// filename starts with draft-

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { GrayMatterFile } from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

export type Collection = "blog" | "products" | "projects" | "landing" | "apps" | "offers";

export type ProductType = "physical" | "digital" | "app" | "service";
export type ProductStatus = "available" | "beta" | "sold-out" | "idea";

export type FeatureItem = string | { name: string; description: string };

type SharedContentFields = {
  title: string;
  description?: string;
  date?: string;
  slug: string;
  draft?: boolean;
  tags?: string[];
  coverImage?: string;
  cta?: { text: string; link: string };
  heroHeading?: string;
  heroSubheading?: string;
  // Product-specific fields (optional, for products collection)
  type?: ProductType;
  status?: ProductStatus;
  price?: string;
  ctaText?: string;
  ctaUrl?: string;
  waitlistUrl?: string;
  features?: FeatureItem[]; // backward compatible: stored in metadata
};

export type Frontmatter = Partial<SharedContentFields> & Record<string, unknown>;

export type ContentItem = SharedContentFields & {
  body: string; // raw markdown
  html: string; // rendered html
  filePath: string; // absolute path (useful for debugging)
  metadata?: Frontmatter; // all frontmatter data
};

export type ContentIndexItem = Omit<ContentItem, "body" | "html">;

const CONTENT_DIR = path.join(process.cwd(), "content");

// Only relevant if you ever walk from CONTENT_DIR; kept as a guard anyway.
const IGNORE_DIRS = new Set(["_templates"]);

function stripMd(p: string) {
  return p.replace(/\.md$/i, "");
}

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

type ParsedFrontmatter = GrayMatterFile<string> & { data: Frontmatter };

type StripePaymentLinks = Record<string, string>;

let stripePaymentLinksPromise: Promise<StripePaymentLinks> | null = null;

async function loadStripePaymentLinks(): Promise<StripePaymentLinks> {
  if (!stripePaymentLinksPromise) {
    stripePaymentLinksPromise = (async () => {
      const filePath = path.join(CONTENT_DIR, "stripe-payment-links.json");
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(raw) as Record<string, unknown>;

        const cleaned: StripePaymentLinks = {};
        for (const [slug, value] of Object.entries(parsed)) {
          if (typeof value === "string") {
            cleaned[slug] = value.trim();
          }
        }
        return cleaned;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("stripe-payment-links.json missing or invalid; skipping", error);
        }
        return {};
      }
    })();
  }
  return stripePaymentLinksPromise;
}

function isStripePaymentLink(url: string) {
  return url.startsWith("https://buy.stripe.com/");
}

function sanitizeProductCtaUrl(
  slug: string,
  frontmatterUrl: string | undefined,
  stripeUrl: string | undefined
): string | undefined {
  const PLACEHOLDER_DOMAIN = ["example", "com"].join(".");
  // Drop placeholder/example links from content
  const cleanFrontmatter = frontmatterUrl && frontmatterUrl.includes(PLACEHOLDER_DOMAIN)
    ? undefined
    : frontmatterUrl?.trim();

  // Prefer Stripe payment link if present and valid
  if (stripeUrl) {
    if (isStripePaymentLink(stripeUrl)) {
      return stripeUrl;
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Invalid Stripe payment link for product "${slug}": ${stripeUrl}`);
    }
  }

  return cleanFrontmatter || undefined;
}

function parseFrontmatter(raw: string): ParsedFrontmatter {
  const parsed = matter(raw);
  return { ...parsed, data: parsed.data as Frontmatter };
}

// If no frontmatter slug exists, fallback to file path relative to the collection directory.
function fallbackSlugFromPath(collectionDir: string, fullPath: string) {
  const rel = path.relative(collectionDir, fullPath);
  return stripMd(toPosix(rel));
}

// Prefer frontmatter slug, else fallback to path-based slug.
function computeSlug(
  collectionDir: string,
  fullPath: string,
  frontmatterSlug?: unknown
) {
  const s =
    (typeof frontmatterSlug === "string" && frontmatterSlug.trim()) ||
    fallbackSlugFromPath(collectionDir, fullPath);

  // normalize
  return s.replace(/^\/+|\/+$/g, "");
}

// Draft rule: frontmatter draft:true OR filename starts with "draft-"
function isDraft(fullPath: string, data: Frontmatter) {
  const base = path.basename(fullPath).toLowerCase();
  return data?.draft === true || base.startsWith("draft-");
}

/** Drop cover paths that don't exist under /public (avoids Next/Image 404 noise). */
async function resolveCoverImage(cover?: unknown): Promise<string | undefined> {
  if (typeof cover !== "string" || !cover.trim()) return undefined;
  const trimmed = cover.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!trimmed.startsWith("/")) return undefined;

  const fullPath = path.join(process.cwd(), "public", trimmed.replace(/^\//, ""));
  try {
    await fs.access(fullPath);
    return trimmed;
  } catch {
    return undefined;
  }
}

function readTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

function readCta(value: unknown): { text: string; link: string } | undefined {
  if (!value || typeof value !== "object") return undefined;
  const maybe = value as { text?: unknown; link?: unknown };
  if (typeof maybe.text === "string" && typeof maybe.link === "string") {
    return { text: maybe.text, link: maybe.link };
  }
  return undefined;
}

function readFeatures(value: unknown): FeatureItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized: FeatureItem[] = [];

  for (const entry of value) {
    if (typeof entry === "string") {
      normalized.push(entry);
      continue;
    }

    if (
      entry &&
      typeof entry === "object" &&
      "name" in entry &&
      "description" in entry &&
      typeof (entry as { name: unknown }).name === "string" &&
      typeof (entry as { description: unknown }).description === "string"
    ) {
      normalized.push({
        name: (entry as { name: string }).name,
        description: (entry as { description: string }).description,
      });
    }
  }

  return normalized.length ? normalized : undefined;
}

async function existsDir(p: string) {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      out.push(...(await walkMarkdownFiles(full)));
      continue;
    }

    if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
      out.push(full);
    }
  }

  return out;
}

/**
 * List slugs for published content in a collection.
 * (Excludes drafts + excludes _templates)
 */
export async function listSlugs(collection: Collection) {
  const collectionDir = path.join(CONTENT_DIR, collection);
  if (!(await existsDir(collectionDir))) return [];

  const files = await walkMarkdownFiles(collectionDir);

  const slugs: string[] = [];
  for (const fullPath of files) {
    const raw = await fs.readFile(fullPath, "utf8");
    const { data } = parseFrontmatter(raw);

    if (isDraft(fullPath, data)) continue;

    slugs.push(computeSlug(collectionDir, fullPath, data.slug));
  }

  // stable order
  slugs.sort();
  return slugs;
}

/**
 * Get all published items in a collection (recursive).
 * (Excludes drafts)
 */
export async function getAll(collection: Collection): Promise<ContentIndexItem[]> {
  const collectionDir = path.join(CONTENT_DIR, collection);
  if (!(await existsDir(collectionDir))) return [];

  const stripeLinks = collection === "products" ? await loadStripePaymentLinks() : undefined;

  const files = await walkMarkdownFiles(collectionDir);

  const items: ContentIndexItem[] = [];
  for (const fullPath of files) {
    const raw = await fs.readFile(fullPath, "utf8");
    const { data } = parseFrontmatter(raw);

    const draft = isDraft(fullPath, data);
    if (draft && process.env.NODE_ENV === "production") continue;

    const slug = computeSlug(collectionDir, fullPath, data.slug);

    const ctaUrl = sanitizeProductCtaUrl(
      slug,
      data.ctaUrl as string | undefined,
      stripeLinks?.[slug]
    );

    items.push({
      title: (data.title as string) || slug,
      description: data.description as string | undefined,
      date: data.date as string | undefined,
      slug,
      draft,
      tags: readTags(data.tags),
      coverImage: await resolveCoverImage(data.coverImage),
      cta: readCta(data.cta),
      type: data.type as ProductType | undefined,
      status: data.status as ProductStatus | undefined,
      price: data.price as string | undefined,
      ctaText: data.ctaText as string | undefined,
      ctaUrl,
      waitlistUrl: data.waitlistUrl as string | undefined,
      features: readFeatures(data.features),
      filePath: fullPath,
      metadata: data,
    });
  }

  // Prefer non-draft, then newest date when multiple files share a slug
  const bySlug = new Map<string, ContentIndexItem>();
  for (const item of items) {
    const existing = bySlug.get(item.slug);
    if (!existing) {
      bySlug.set(item.slug, item);
      continue;
    }
    const itemDraft = item.draft ? 1 : 0;
    const existingDraft = existing.draft ? 1 : 0;
    if (itemDraft !== existingDraft) {
      if (itemDraft < existingDraft) bySlug.set(item.slug, item);
      continue;
    }
    if ((item.date || "").localeCompare(existing.date || "") > 0) {
      bySlug.set(item.slug, item);
    }
  }

  const unique = [...bySlug.values()];
  // sort by date (newest first) if available
  unique.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return unique;
}

/**
 * Get one published item by slug (recursive).
 * If several files share a slug, prefer non-draft, then newest date.
 * (Drafts return null in production)
 */
export async function getBySlug(
  collection: Collection,
  slug: string
): Promise<ContentItem | null> {
  const collectionDir = path.join(CONTENT_DIR, collection);
  if (!(await existsDir(collectionDir))) return null;

  const stripeLinks = collection === "products" ? await loadStripePaymentLinks() : undefined;

  const files = await walkMarkdownFiles(collectionDir);
  const matches: { fullPath: string; data: Frontmatter; content: string }[] = [];

  for (const fullPath of files) {
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, content } = parseFrontmatter(raw);

    const computed = computeSlug(collectionDir, fullPath, data.slug);
    if (computed !== slug) continue;
    matches.push({ fullPath, data, content });
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    const aDraft = isDraft(a.fullPath, a.data) ? 1 : 0;
    const bDraft = isDraft(b.fullPath, b.data) ? 1 : 0;
    if (aDraft !== bDraft) return aDraft - bDraft;
    return String(b.data.date || "").localeCompare(String(a.data.date || ""));
  });

  const best = matches[0];
  if (isDraft(best.fullPath, best.data) && process.env.NODE_ENV === "production") {
    return null;
  }

  const ctaUrl = sanitizeProductCtaUrl(
    slug,
    best.data.ctaUrl as string | undefined,
    stripeLinks?.[slug]
  );

  const processed = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(best.content);
  const renderedHtml = processed.toString();

  return {
    title: (best.data.title as string) || slug,
    description: best.data.description as string | undefined,
    date: best.data.date as string | undefined,
    slug,
    draft: isDraft(best.fullPath, best.data),
    tags: readTags(best.data.tags),
      coverImage: await resolveCoverImage(best.data.coverImage),
    cta: readCta(best.data.cta),
    type: best.data.type as ProductType | undefined,
    status: best.data.status as ProductStatus | undefined,
    price: best.data.price as string | undefined,
    ctaText: best.data.ctaText as string | undefined,
    ctaUrl,
    waitlistUrl: best.data.waitlistUrl as string | undefined,
    features: readFeatures(best.data.features),
    body: best.content,
    html: renderedHtml,
    filePath: best.fullPath,
    metadata: best.data,
  };
}

/**
 * Convenience wrappers (use whichever style your pages import).
 */
export const getAllBlogSlugs = () => listSlugs("blog");
export const getAllProductSlugs = () => listSlugs("products");
export const getAllProjectSlugs = () => listSlugs("projects");
export const getAllLandingSlugs = () => listSlugs("landing");
export const getAllAppsSlugs = () => listSlugs("apps");
export const getAllOffersSlugs = () => listSlugs("offers");

export const getBlogPost = (slug: string) => getBySlug("blog", slug);
export const getProduct = (slug: string) => getBySlug("products", slug);
export const getProject = (slug: string) => getBySlug("projects", slug);
export const getLanding = (slug: string) => getBySlug("landing", slug);
export const getApp = (slug: string) => getBySlug("apps", slug);
export const getOffer = (slug: string) => getBySlug("offers", slug);

export const getAllBlog = () => getAll("blog");
export const getAllProducts = () => getAll("products");
export const getAllProjects = () => getAll("projects");
export const getAllLanding = () => getAll("landing");
export const getAllApps = () => getAll("apps");
export const getAllOffers = () => getAll("offers");

export type WorkItem = {
  title: string;
  description?: string;
  date?: string;
  coverImage?: string;
  kind: "App" | "Product" | "Project" | "Website";
  href: string;
  externalHref?: string;
};

/** @deprecated Prefer `@/lib/work` — kept for any legacy imports. */
export async function getAllWork(): Promise<WorkItem[]> {
  const { getAllWork: getWork } = await import("@/lib/work");
  const items = await getWork();
  return items.map((item) => ({
    title: item.title,
    description: item.description,
    date: item.date,
    coverImage: item.coverImage,
    kind:
      item.category === "apps"
        ? "App"
        : item.category === "websites"
          ? "Website"
          : item.category === "product-design"
            ? "Product"
            : "Project",
    href: item.href,
    externalHref: item.externalHref,
  }));
}