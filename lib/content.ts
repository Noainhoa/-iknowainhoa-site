// lib/content.ts
//*This will: read nested folders like content/blog/2026/January/...
// ignore content/_templates
// hide drafts if either:
// frontmatter has draft: true, or
// filename starts with draft-

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type Collection = "blog" | "offers" | "projects" | "landing";

export type ContentItem = {
  title: string;
  description?: string;
  date?: string;
  slug: string;
  draft?: boolean;
  tags?: string[];
  body: string; // raw markdown
  html: string; // rendered html
  filePath: string; // absolute path (useful for debugging)
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
function isDraft(fullPath: string, data: any) {
  const base = path.basename(fullPath).toLowerCase();
  return Boolean(data?.draft) || base.startsWith("draft-");
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
    const { data } = matter(raw);

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

  const files = await walkMarkdownFiles(collectionDir);

  const items: ContentIndexItem[] = [];
  for (const fullPath of files) {
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(raw);

    const draft = isDraft(fullPath, data);
    if (draft) continue;

    const slug = computeSlug(collectionDir, fullPath, data.slug);

    items.push({
      title: (data.title as string) || slug,
      description: data.description as string | undefined,
      date: data.date as string | undefined,
      slug,
      draft,
      tags: (data.tags as string[]) || [],
      filePath: fullPath,
    });
  }

  // sort by date (newest first) if available
  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return items;
}

/**
 * Get one published item by slug (recursive).
 * (Drafts return null)
 */
export async function getBySlug(
  collection: Collection,
  slug: string
): Promise<ContentItem | null> {
  const collectionDir = path.join(CONTENT_DIR, collection);
  if (!(await existsDir(collectionDir))) return null;

  const files = await walkMarkdownFiles(collectionDir);

  for (const fullPath of files) {
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(raw);

    const computed = computeSlug(collectionDir, fullPath, data.slug);
    if (computed !== slug) continue;

    if (isDraft(fullPath, data)) return null;

    const processed = await remark().use(html).process(content);
    const renderedHtml = processed.toString();

    return {
      title: (data.title as string) || slug,
      description: data.description as string | undefined,
      date: data.date as string | undefined,
      slug,
      draft: false,
      tags: (data.tags as string[]) || [],
      body: content,
      html: renderedHtml,
      filePath: fullPath,
    };
  }

  return null;
}

/**
 * Convenience wrappers (use whichever style your pages import).
 */
export const getAllBlogSlugs = () => listSlugs("blog");
export const getAllOfferSlugs = () => listSlugs("offers");
export const getAllProjectSlugs = () => listSlugs("projects");
export const getAllLandingSlugs = () => listSlugs("landing");

export const getBlogPost = (slug: string) => getBySlug("blog", slug);
export const getOffer = (slug: string) => getBySlug("offers", slug);
export const getProject = (slug: string) => getBySlug("projects", slug);
export const getLanding = (slug: string) => getBySlug("landing", slug);

export const getAllBlog = () => getAll("blog");
export const getAllOffers = () => getAll("offers");
export const getAllProjects = () => getAll("projects");
export const getAllLanding = () => getAll("landing");
