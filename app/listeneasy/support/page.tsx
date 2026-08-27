import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppMarkdownDocument from "@/components/product-apps/AppMarkdownDocument";
import {
  buildProductAppMetadata,
  getProductApp,
  getProductAppSupportPage,
} from "@/lib/productApps";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";

const SLUG = "listeneasy" as const;

export async function generateMetadata(): Promise<Metadata> {
  const app = getProductApp(SLUG);
  if (!app) return { title: "Not Found" };
  const locale = await getLocale();
  const t = getDictionary(locale);
  const base = buildProductAppMetadata(app, "support");
  const title = t.apps.supportPage(app.name);
  return {
    ...base,
    title,
    openGraph: { ...base.openGraph, title },
    twitter: { ...base.twitter, title },
  };
}

export default async function ListenEasySupportPage() {
  const app = getProductApp(SLUG);
  if (!app) return notFound();

  const locale = await getLocale();
  const page = await getProductAppSupportPage(SLUG, locale);
  if (!page) return notFound();

  return <AppMarkdownDocument app={app} page={page} current="support" locale={locale} />;
}
