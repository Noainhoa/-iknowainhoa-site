import Link from "next/link";
import type { ProductApp } from "@/lib/productApps";
import { productAppPaths } from "@/lib/productApps";

type AppPageNavProps = {
  app: ProductApp;
  current: "product" | "support" | "privacy";
};

const LABELS = {
  product: "Product",
  support: "Support",
  privacy: "Privacy",
} as const;

export default function AppPageNav({ app, current }: AppPageNavProps) {
  const paths = productAppPaths(app.slug);
  const items = (["product", "support", "privacy"] as const).map((key) => ({
    key,
    href: paths[key],
    label: key === "product" ? app.name : LABELS[key],
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
