import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppMarkdownDocument from "@/components/product-apps/AppMarkdownDocument";
import {
  buildProductAppMetadata,
  getProductApp,
  getProductAppAccessibilityPage,
} from "@/lib/productApps";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";

const SLUG = "listeneasy" as const;

export async function generateMetadata(): Promise<Metadata> {
  const app = getProductApp(SLUG);
  if (!app?.pages.accessibility) return { title: "Not Found" };
  const locale = await getLocale();
  const t = getDictionary(locale);
  const base = buildProductAppMetadata(app, "accessibility");
  const title = t.apps.accessibilityPage(app.name);
  return {
    ...base,
    title,
    openGraph: { ...base.openGraph, title },
    twitter: { ...base.twitter, title },
  };
}

export default async function ListenEasyAccessibilityPage() {
  const app = getProductApp(SLUG);
  if (!app?.pages.accessibility) return notFound();

  const locale = await getLocale();
  const page = await getProductAppAccessibilityPage(SLUG, locale);
  if (!page) return notFound();

  return (
    <AppMarkdownDocument app={app} page={page} current="accessibility" locale={locale} />
  );
}
