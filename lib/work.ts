import {
  getAllApps,
  getAllProducts,
  getAllProjects,
  getApp,
  getProduct,
  getProject,
  type ContentItem,
  type ContentIndexItem,
} from "@/lib/content";
import { productApps } from "@/lib/productApps";
import { type WorkCategory, type WorkItem } from "@/lib/work-shared";

export {
  WORK_FILTERS,
  categoryLabel,
  type WorkCategory,
  type WorkFilterId,
  type WorkItem,
} from "@/lib/work-shared";

function tagsOf(item: ContentIndexItem | ContentItem): string[] {
  return (item.tags || []).map((t) => t.toLowerCase());
}

function categorize(
  source: WorkItem["source"],
  tags: string[]
): WorkCategory {
  if (source === "apps" || source === "product-apps") return "apps";
  if (tags.includes("website") || tags.includes("websites")) return "websites";
  if (tags.includes("system") || tags.includes("systems")) return "systems";
  if (
    tags.includes("product-design") ||
    tags.includes("design") ||
    source === "products"
  ) {
    return "product-design";
  }
  if (tags.includes("places") || tags.includes("hospitality")) return "systems";
  return "product-design";
}

function toWorkItem(
  item: ContentIndexItem,
  source: "apps" | "projects" | "products"
): WorkItem {
  const tags = tagsOf(item);
  const category = categorize(source, tags);
  return {
    slug: item.slug,
    title: item.title,
    description: item.description,
    date: item.date,
    coverImage: item.coverImage,
    category,
    summary: item.description?.trim() || item.title,
    href: `/work/${item.slug}`,
    externalHref: typeof item.cta?.link === "string" ? item.cta.link : undefined,
    source,
    tags,
  };
}

function productAppWorkItems(): WorkItem[] {
  return productApps.map((app) => ({
    slug: app.slug,
    title: app.name,
    description: app.summary,
    coverImage: undefined,
    category: "apps" as const,
    summary: app.tagline,
    href: `/work/${app.slug}`,
    source: "product-apps" as const,
    tags: ["apps", app.status],
  }));
}

export async function getAllWork(): Promise<WorkItem[]> {
  const [apps, products, projects] = await Promise.all([
    getAllApps(),
    getAllProducts(),
    getAllProjects(),
  ]);

  const mapped: (WorkItem & { _dateKey: string })[] = [
    ...apps.map((item) => ({ ...toWorkItem(item, "apps"), _dateKey: item.date || "" })),
    ...products.map((item) => ({
      ...toWorkItem(item, "products"),
      _dateKey: item.date || "",
    })),
    ...projects.map((item) => ({
      ...toWorkItem(item, "projects"),
      _dateKey: item.date || "",
    })),
    ...productAppWorkItems().map((item) => ({
      ...item,
      _dateKey: item.date || "2026-07-01",
    })),
  ];

  const bySlug = new Map<string, WorkItem & { _dateKey: string }>();
  for (const item of mapped) {
    const existing = bySlug.get(item.slug);
    if (!existing || existing.source === "product-apps") {
      bySlug.set(item.slug, item);
    }
  }

  return [...bySlug.values()]
    .sort((a, b) => b._dateKey.localeCompare(a._dateKey))
    .map(({ _dateKey, ...rest }) => rest);
}

export async function getWorkBySlug(slug: string): Promise<{
  item: WorkItem;
  bodyHtml?: string;
  body?: string;
} | null> {
  const curated = productAppWorkItems().find((w) => w.slug === slug);
  if (curated) {
    return { item: curated };
  }

  const [app, project, product] = await Promise.all([
    getApp(slug),
    getProject(slug),
    getProduct(slug),
  ]);

  const hit =
    (app && { content: app, source: "apps" as const }) ||
    (project && { content: project, source: "projects" as const }) ||
    (product && { content: product, source: "products" as const }) ||
    null;

  if (!hit) return null;

  const item = toWorkItem(hit.content, hit.source);
  return {
    item,
    bodyHtml: hit.content.html,
    body: hit.content.body,
  };
}

export async function getAllWorkSlugs(): Promise<string[]> {
  const work = await getAllWork();
  return work.map((w) => w.slug);
}
