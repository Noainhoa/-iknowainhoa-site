/**
 * @deprecated Use `@/lib/productApps` instead.
 * Thin wrappers kept so older PhotoArc helpers still resolve during the migration.
 */
import {
  getProductAppPrivacyPage,
  getProductAppSupportPage,
  type ProductAppMarkdownPage,
} from "@/lib/productApps";

export type PhotoArcPage = ProductAppMarkdownPage;

export async function getPhotoArcSupportPage() {
  return getProductAppSupportPage("photoarc");
}

export async function getPhotoArcPrivacyPage() {
  return getProductAppPrivacyPage("photoarc");
}
