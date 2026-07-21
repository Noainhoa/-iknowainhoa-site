import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppProductPage from "@/components/product-apps/AppProductPage";
import { buildProductAppMetadata, getProductApp } from "@/lib/productApps";

const SLUG = "photoarc" as const;

export function generateMetadata(): Metadata {
  const app = getProductApp(SLUG);
  if (!app) return { title: "Not Found" };
  return buildProductAppMetadata(app, "product");
}

export default function PhotoArcProductPage() {
  const app = getProductApp(SLUG);
  if (!app) return notFound();
  return <AppProductPage app={app} />;
}
