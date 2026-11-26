import Link from "next/link";
import type { ProductApp, ProductAppMarkdownPage } from "@/lib/productApps";
import { productAppPaths } from "@/lib/productApps";
import AppPageNav from "@/components/product-apps/AppPageNav";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";

type AppDocKey = "support" | "privacy" | "accessibility";

type AppMarkdownDocumentProps = {
  app: ProductApp;
  page: ProductAppMarkdownPage;
  current: AppDocKey;
  locale?: Locale;
};

export default function AppMarkdownDocument({
  app,
  page,
  current,
  locale = "en",
}: AppMarkdownDocumentProps) {
  const paths = productAppPaths(app.slug);
  const t = getDictionary(locale).apps;
  const footerLinks: { href: string; label: string }[] = [];

  if (current !== "support") {
    footerLinks.push({ href: paths.support, label: t.supportPage(app.name) });
  }
  if (current !== "privacy") {
    footerLinks.push({ href: paths.privacy, label: t.privacyPolicy(app.name) });
  }
  if (app.pages.accessibility && current !== "accessibility") {
    footerLinks.push({
      href: paths.accessibility,
      label: t.accessibilityPage(app.name),
    });
  }

  return (
    <main className="mx-auto max-w-[720px] px-8 py-10 font-sans">
      <AppPageNav app={app} current={current} locale={locale} />
      <article
        className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      <footer className="mt-10 border-t border-[var(--border)] pt-6 text-sm opacity-80">
        <p className="mb-3">
          <Link href={paths.product} className="underline-offset-2 hover:underline">
            {t.backTo(app.name)}
          </Link>
        </p>
        {footerLinks.map((link) => (
          <p key={link.href} className="mb-2 last:mb-0">
            <Link href={link.href} className="underline-offset-2 hover:underline">
              {link.label}
            </Link>
          </p>
        ))}
      </footer>
    </main>
  );
}
