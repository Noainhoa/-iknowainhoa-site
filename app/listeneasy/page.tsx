import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlankPage from "@/components/BlankPage";
import AppProductPage from "@/components/product-apps/AppProductPage";
import { buildProductAppMetadata, getProductApp } from "@/lib/productApps";
import { publicPages } from "@/lib/site";

const SLUG = "listeneasy" as const;

export function generateMetadata(): Metadata {
  const app = getProductApp(SLUG);
  if (!app) return { title: "Not Found" };
  return buildProductAppMetadata(app, "product");
}

export default function ListenEasyProductPage() {
  if (!publicPages.listeneasy) return <BlankPage />;

  const app = getProductApp(SLUG);
  if (!app) return notFound();
  return <AppProductPage app={app} />;
}
