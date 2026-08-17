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
import {
  markdownToHtml,
  pickLocalizedField,
  pickLocalizedMarkdown,
} from "@/lib/contentLocale";
import type { Locale } from "@/lib/i18n/shared";
import { productApps } from "@/lib/productApps";
import { type WorkCategory, type WorkItem } from "@/lib/work-shared";

export {
  WORK_FILTERS,
  categoryLabel,
  groupWorkByCategory,
  type WorkCategory,
  type WorkFilterId,
  type WorkItem,
} from "@/lib/work-shared";

function tagsOf(item: ContentIndexItem | ContentItem): string[] {
  return item.tags || [];
}

function categorize(
  source: WorkItem["source"],
  tags: string[]
): WorkCategory {
  const normalized = tags.map((t) => t.toLowerCase());
  if (source === "apps" || source === "product-apps") return "apps";
  if (
    normalized.includes("website") ||
    normalized.includes("websites") ||
    normalized.includes("web design") ||
    normalized.includes("web-design")
  ) {
    return "websites";
  }
  if (normalized.includes("system") || normalized.includes("systems")) {
    return "systems";
  }
  if (
    normalized.includes("product-design") ||
    normalized.includes("product design") ||
    normalized.includes("design") ||
    normalized.includes("ui design") ||
    source === "products"
  ) {
    return "product-design";
  }
  if (normalized.includes("places") || normalized.includes("hospitality")) {
    return "systems";
  }
  return "product-design";
}

function readLogo(metadata?: Record<string, unknown>): string | undefined {
  const logo = metadata?.logo;
  if (typeof logo !== "string" || !logo.trim()) return undefined;
  const trimmed = logo.trim();
  return trimmed.startsWith("/") ? trimmed : undefined;
}

function toWorkItem(
  item: ContentIndexItem,
  source: "apps" | "projects" | "products",
  locale: Locale = "en"
): WorkItem {
  const tags = tagsOf(item);
  const category = categorize(source, tags);
  const meta = (item.metadata || {}) as Record<string, unknown>;
  const title =
    pickLocalizedField(meta, "title", locale, item.title) || item.title;
  const description = pickLocalizedField(meta, "description", locale, item.description);
  const summary =
    pickLocalizedField(meta, "summary", locale) ||
    description?.trim() ||
    title;

  const cta =
    meta.cta && typeof meta.cta === "object" && !Array.isArray(meta.cta)
      ? (meta.cta as Record<string, unknown>)
      : undefined;
  const externalHref =
    typeof cta?.link === "string"
      ? cta.link
      : typeof item.cta?.link === "string"
        ? item.cta.link
        : undefined;
  const externalCtaText =
    (cta ? pickLocalizedField(cta, "text", locale) : undefined) ||
    (typeof item.cta?.text === "string" ? item.cta.text : undefined);

  return {
    slug: item.slug,
    title,
    description,
    date: item.date,
    coverImage: item.coverImage,
    logo: readLogo(meta),
    category,
    summary,
    href: `/work/${item.slug}`,
    externalHref,
    externalCtaText,
    source,
    tags,
  };
}

function productAppWorkItems(): WorkItem[] {
  return productApps.map((app) => {
    const logo =
      app.slug === "listeneasy"
        ? "/images/projects/listeneasy/brand-mark.png"
        : undefined;
    return {
      slug: app.slug,
      title: app.name,
      description: app.summary,
      coverImage: logo,
      logo,
      category: "apps" as const,
      summary: app.tagline,
      href: app.slug === "listeneasy" ? "/listeneasy" : `/work/${app.slug}`,
      source: "product-apps" as const,
      tags: ["apps", app.status],
    };
  });
}

export async function getAllWork(locale: Locale = "en"): Promise<WorkItem[]> {
  const [apps, products, projects] = await Promise.all([
    getAllApps(),
    getAllProducts(),
    getAllProjects(),
  ]);

  const mapped: (WorkItem & { _dateKey: string })[] = [
    ...apps.map((item) => ({
      ...toWorkItem(item, "apps", locale),
      _dateKey: item.date || "",
    })),
    ...products.map((item) => ({
      ...toWorkItem(item, "products", locale),
      _dateKey: item.date || "",
    })),
    ...projects.map((item) => ({
      ...toWorkItem(item, "projects", locale),
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

export async function getWorkBySlug(
  slug: string,
  locale: Locale = "en"
): Promise<{
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

  const item = toWorkItem(hit.content, hit.source, locale);
  const localizedMarkdown = pickLocalizedMarkdown(hit.content.body || "", locale);
  const bodyHtml = localizedMarkdown
    ? await markdownToHtml(localizedMarkdown)
    : hit.content.html;

  return {
    item,
    bodyHtml,
    body: localizedMarkdown || hit.content.body,
  };
}

export async function getAllWorkSlugs(): Promise<string[]> {
  const work = await getAllWork();
  return work.map((w) => w.slug);
}
