export const WORK_FILTERS = [
  { id: "all", label: "All" },
  { id: "apps", label: "Apps" },
  { id: "websites", label: "Websites" },
  { id: "systems", label: "Systems" },
  { id: "product-design", label: "Product Design" },
] as const;

export type WorkFilterId = (typeof WORK_FILTERS)[number]["id"];
export type WorkCategory = Exclude<WorkFilterId, "all">;

export type WorkItem = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  coverImage?: string;
  /** Compact brand mark on the case page (not a full-bleed hero). */
  logo?: string;
  category: WorkCategory;
  /** Short one-liner under the title on index cards (Frank-style). */
  summary: string;
  href: string;
  externalHref?: string;
  externalCtaText?: string;
  source: "apps" | "projects" | "products" | "product-apps";
  tags: string[];
};

export function groupWorkByCategory(
  items: WorkItem[]
): { category: WorkCategory; items: WorkItem[] }[] {
  const order: WorkCategory[] = ["apps", "websites", "systems", "product-design"];
  const buckets = new Map<WorkCategory, WorkItem[]>();
  for (const category of order) buckets.set(category, []);
  for (const item of items) {
    const list = buckets.get(item.category) ?? [];
    list.push(item);
    buckets.set(item.category, list);
  }
  return order
    .map((category) => ({ category, items: buckets.get(category) ?? [] }))
    .filter((section) => section.items.length > 0);
}

export function categoryLabel(category: WorkCategory): string {
  return WORK_FILTERS.find((f) => f.id === category)?.label ?? category;
}
