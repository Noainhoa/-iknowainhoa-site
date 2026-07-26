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
  category: WorkCategory;
  /** Short one-liner under the title on index cards (Frank-style). */
  summary: string;
  href: string;
  externalHref?: string;
  source: "apps" | "projects" | "products" | "product-apps";
  tags: string[];
};

export function categoryLabel(category: WorkCategory): string {
  return WORK_FILTERS.find((f) => f.id === category)?.label ?? category;
}
