import Link from "next/link";
import type { ProductApp } from "@/lib/productApps";
import { productAppPaths } from "@/lib/productApps";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";

type AppPageNavKey = "product" | "support" | "privacy" | "accessibility";

type AppPageNavProps = {
  app: ProductApp;
  current: AppPageNavKey;
  locale?: Locale;
};

export default function AppPageNav({ app, current, locale = "en" }: AppPageNavProps) {
  const t = getDictionary(locale).apps;
  const paths = productAppPaths(app.slug);
  const labels: Record<AppPageNavKey, string> = {
    product: app.name,
    support: t.support,
    privacy: t.privacy,
    accessibility: t.accessibility,
  };
  const keys: AppPageNavKey[] = ["product", "support", "privacy"];
  if (app.pages.accessibility) {
    keys.push("accessibility");
  }
  const items = keys.map((key) => ({
    key,
    href: paths[key],
    label: labels[key],
  }));

  return (
    <nav aria-label={`${app.name} pages`} className="mb-8 text-sm">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 opacity-80">
        {items.map((item, index) => {
          const isCurrent = item.key === current;
          return (
            <li key={item.key} className="flex items-center gap-3">
              {index > 0 ? (
                <span aria-hidden="true" className="opacity-40">
                  /
                </span>
              ) : null}
              {isCurrent ? (
                <span aria-current="page" className="font-medium text-[var(--foreground)]">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="underline-offset-2 hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
