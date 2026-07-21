import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppMarkdownDocument from "@/components/product-apps/AppMarkdownDocument";
import {
  buildProductAppMetadata,
  getProductApp,
  getProductAppPrivacyPage,
} from "@/lib/productApps";

const SLUG = "listeneasy" as const;

export async function generateMetadata(): Promise<Metadata> {
  const app = getProductApp(SLUG);
  if (!app) return { title: "Not Found" };
  return buildProductAppMetadata(app, "privacy");
}

export default async function ListenEasyPrivacyPage() {
  const app = getProductApp(SLUG);
  if (!app) return notFound();

  const page = await getProductAppPrivacyPage(SLUG);
  if (!page) return notFound();

  return <AppMarkdownDocument app={app} page={page} current="privacy" />;
}
