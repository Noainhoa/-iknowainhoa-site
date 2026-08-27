import Link from "next/link";
import type { ProductApp, ProductAppMarkdownPage } from "@/lib/productApps";
import { productAppPaths } from "@/lib/productApps";
import AppPageNav from "@/components/product-apps/AppPageNav";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";

type AppMarkdownDocumentProps = {
  app: ProductApp;
  page: ProductAppMarkdownPage;
  current: "support" | "privacy";
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
        {current === "support" ? (
          <p>
            <Link href={paths.privacy} className="underline-offset-2 hover:underline">
              {t.privacyPolicy(app.name)}
            </Link>
          </p>
        ) : (
          <p>
            <Link href={paths.support} className="underline-offset-2 hover:underline">
              {t.supportPage(app.name)}
            </Link>
          </p>
        )}
      </footer>
    </main>
  );
}
