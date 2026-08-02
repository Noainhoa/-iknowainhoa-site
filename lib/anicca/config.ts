/**
 * Central commercial configuration for the Anicca reminder token.
 * Edit price, stock, Stripe Payment Links, shipping and dispatch here only.
 *
 * Stripe Payment Links: paste buy.stripe.com URLs below (or in
 * content/stripe-payment-links.json under the same ids). Prefer this file
 * for Anicca so product data stays in one place.
 *
 * Post-payment redirect in Stripe Dashboard: https://iknowainhoa.com/thanks
 * (enable publicPages.thanks when going live).
 */

export const ANICCA_ORIGIN = "https://iknowainhoa.com";
export const ANICCA_PATH = "/anicca";
export const ANICCA_CANONICAL = `${ANICCA_ORIGIN}${ANICCA_PATH}`;

/** Single source of truth for unit price (EUR). */
export const ANICCA_PRICE_EUR = 14;

export const ANICCA_CURRENCY = "EUR" as const;

export const ANICCA_CONTACT_EMAIL = "hola@iknowainhoa.com";

/** Owner-confirm before launch. */
export const ANICCA_DISPATCH_ESTIMATE =
  "Usually dispatched within 2–3 working days";

/** Owner-confirm: shown in FAQ until checkout shows live rates. */
export const ANICCA_SHIPPING_MESSAGE =
  "Delivery availability and cost are shown during Stripe checkout before you pay. Shipping is charged separately from the €14 token price.";

export const ANICCA_FIRST_EDITION_TOTAL = 44;

export type AniccaVariantId =
  | "yathabhutam-en"
  | "anicca-en"
  | "anicca-es";

export type AniccaVariant = {
  id: AniccaVariantId;
  /** Short selectable label */
  label: string;
  name: string;
  language: "English" | "Español";
  languageCode: "en" | "es";
  front: string;
  back: string;
  priceEur: number;
  stock: number;
  active: boolean;
  /** Stripe Payment Link — leave empty until created */
  stripePaymentUrl: string;
  images: {
    front: string;
    back: string;
  };
};

/**
 * Variants — update `stock` as pieces sell; set `active: false` to hide.
 * When stock is 0 the UI marks Sold out regardless of `active`.
 */
export const ANICCA_VARIANTS: AniccaVariant[] = [
  {
    id: "yathabhutam-en",
    label: "Yathābhūtaṃ — English",
    name: "Yathābhūtaṃ",
    language: "English",
    languageCode: "en",
    front: "Yathābhūtaṃ · As it is",
    back: "Not as you would like it to be",
    priceEur: ANICCA_PRICE_EUR,
    stock: 20,
    active: true,
    stripePaymentUrl: "", // TODO: Stripe Payment Link
    images: {
      front: "/anicca/yathabhutam-front.jpg",
      back: "/anicca/yathabhutam-back.jpg",
    },
  },
  {
    id: "anicca-en",
    label: "Anicca — English",
    name: "Anicca",
    language: "English",
    languageCode: "en",
    front: "Anicca · Impermanence",
    back: "This too shall pass · good or bad",
    priceEur: ANICCA_PRICE_EUR,
    stock: 19,
    active: true,
    stripePaymentUrl: "", // TODO: Stripe Payment Link
    images: {
      front: "/anicca/anicca-front.jpg",
      back: "/anicca/anicca-back.jpg",
    },
  },
  {
    id: "anicca-es",
    label: "Anicca — Español",
    name: "Anicca",
    language: "Español",
    languageCode: "es",
    front: "Anicca · Esto también pasará, bueno o malo",
    back: "Acéptalo así como es, no como te gustaría que fuese",
    priceEur: ANICCA_PRICE_EUR,
    stock: 5,
    active: true,
    stripePaymentUrl: "", // TODO: Stripe Payment Link
    images: {
      front: "/anicca/spanish-front.jpg",
      back: "/anicca/spanish-back.jpg",
    },
  },
];

export const ANICCA_IMAGES = {
  hero: "/anicca/hero-token.jpg",
  pouch: "/anicca/velvet-pouch.jpg",
  note: "/anicca/note.jpg",
  flatLay: "/anicca/flat-lay.jpg",
  necklace: "/anicca/token-necklace.jpg",
  keyring: "/anicca/token-keyring.jpg",
  wallet: "/anicca/token-wallet.jpg",
  desk: "/anicca/token-desk.jpg",
  og: "/anicca/og-social.jpg",
  /** Existing ensō mark (transparent) */
  mark: "/images/projects/anicca/logo.png",
} as const;

export function getAniccaVariant(id: AniccaVariantId | null): AniccaVariant | undefined {
  if (!id) return undefined;
  return ANICCA_VARIANTS.find((v) => v.id === id);
}

export function isVariantPurchasable(variant: AniccaVariant): boolean {
  return variant.active && variant.stock > 0;
}

export function hasValidStripeUrl(url: string): boolean {
  return /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_\-]+/.test(url.trim());
}

export function totalStockRemaining(): number {
  return ANICCA_VARIANTS.reduce((sum, v) => sum + Math.max(0, v.stock), 0);
}
