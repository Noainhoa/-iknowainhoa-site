/**
 * Central commercial configuration for the Anicca reminder token.
 * Edit price, stock, Stripe Payment Links, shipping and dispatch here only.
 *
 * Stripe Payment Links: paste buy.stripe.com URLs below (or in
 * content/stripe-payment-links.json under the same ids). Prefer this file
 * for Anicca so product data stays in one place.
 *
 * Post-payment redirect in Stripe Dashboard: https://iknowainhoa.com/thanks
 */

export const ANICCA_ORIGIN = "https://iknowainhoa.com";
export const ANICCA_PATH = "/anicca";
export const ANICCA_CANONICAL = `${ANICCA_ORIGIN}${ANICCA_PATH}`;

/** Single source of truth for unit price (EUR). Delivery is charged separately. */
export const ANICCA_PRICE_EUR = 14;

export const ANICCA_CURRENCY = "EUR" as const;

export const ANICCA_CONTACT_EMAIL = "hola@iknowainhoa.com";

/** Owner-confirm before launch. */
export const ANICCA_DISPATCH_ESTIMATE =
  "If ordered before 12:00 CET Monday to Friday, posted the same day; otherwise the next working day.";

/** Shown in FAQ. Live rates appear in Stripe checkout. */
export const ANICCA_SHIPPING_MESSAGE =
  "Delivery availability and cost are shown during Stripe checkout, before you pay. Shipping is charged separately from the token price.";

export const ANICCA_FIRST_EDITION_TOTAL = 44;

export type AniccaVariantId = "anicca-en" | "yathabhutam-en" | "anicca-es";

export const ANICCA_DEFAULT_VARIANT_ID: AniccaVariantId = "anicca-en";

export type AniccaVariant = {
  id: AniccaVariantId;
  /** Product name for schema / receipts */
  label: string;
  /** Compact selector title */
  selectorLabel: string;
  /** Compact selector subtitle (front / back sense) */
  selectorDetail: string;
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
 * Default / hero product is Anicca — English (`ANICCA_DEFAULT_VARIANT_ID`).
 */
export const ANICCA_VARIANTS: AniccaVariant[] = [
  {
    id: "anicca-en",
    label: "Anicca — English",
    selectorLabel: "Anicca · English",
    selectorDetail: "Impermanence / This too shall pass · good or bad",
    name: "Anicca",
    language: "English",
    languageCode: "en",
    front: "Anicca · Impermanence",
    back: "This too shall pass · good or bad",
    priceEur: ANICCA_PRICE_EUR,
    stock: 19,
    active: true,
    stripePaymentUrl: "https://buy.stripe.com/00w6oHgzV1Sg9UP4EU3F602",
    images: {
      front: "/anicca/anicca-front.jpg",
      back: "/anicca/anicca-back.jpg",
    },
  },
  {
    id: "yathabhutam-en",
    label: "Yathābhūtaṃ — English",
    selectorLabel: "Yathābhūtaṃ · English",
    selectorDetail: "As it is / Not as you would like it to be",
    name: "Yathābhūtaṃ",
    language: "English",
    languageCode: "en",
    front: "Yathābhūtaṃ · As it is",
    back: "Not as you would like it to be",
    priceEur: ANICCA_PRICE_EUR,
    stock: 20,
    active: true,
    stripePaymentUrl: "https://buy.stripe.com/9B6fZh2J554s4Avdbq3F604",
    images: {
      front: "/anicca/yathabhutam-front.jpg",
      back: "/anicca/yathabhutam-back.jpg",
    },
  },
  {
    id: "anicca-es",
    label: "Anicca — Español",
    selectorLabel: "Anicca · Español",
    selectorDetail: "Esto también pasará, bueno o malo / Acéptalo así como es…",
    name: "Anicca",
    language: "Español",
    languageCode: "es",
    front: "Anicca · Esto también pasará, bueno o malo",
    back: "Acéptalo así como es, no como te gustaría que fuese",
    priceEur: ANICCA_PRICE_EUR,
    stock: 5,
    active: true,
    stripePaymentUrl: "https://buy.stripe.com/aFa3cv4Rd68w2sn8Va3F603",
    images: {
      front: "/anicca/spanish-front.jpg",
      back: "/anicca/spanish-back.jpg",
    },
  },
];

export const ANICCA_IMAGES = {
  /** Default hero uses the selected variant’s front/back. This is the English Anicca close-up. */
  hero: "/anicca/anicca-front.jpg",
  necklace: "/anicca/token-necklace.jpg",
  desk: "/anicca/token-desk.jpg",
  wallet: "/anicca/token-wallet.jpg",
  keyring: "/anicca/token-keyring.jpg",
  /** Alternate English Anicca close-up — used for Open Graph until a 1200×630 crop exists. */
  og: "/anicca/anicca-front-2.jpg",
  /** Existing ensō mark (transparent) */
  mark: "/images/projects/anicca/logo.png",
  /**
   * Placeholders — do not render on the public page until replaced with real photos.
   * pouch, note, flatLay, clustered hero.
   */
  pouch: "/anicca/velvet-pouch.jpg",
  note: "/anicca/note.jpg",
  flatLay: "/anicca/flat-lay.jpg",
  cluster: "/anicca/hero-token.jpg",
} as const;

/** Lifestyle photographs used in the editorial “kept close” composition. */
export const ANICCA_LIFE_IMAGES = [
  {
    src: ANICCA_IMAGES.necklace,
    alt: "Anicca token worn on a cord at the wrist",
  },
  {
    src: ANICCA_IMAGES.desk,
    alt: "Anicca token kept in a small bowl on a wooden desk",
  },
  {
    src: ANICCA_IMAGES.wallet,
    alt: "Anicca token carried in a small pouch beside everyday objects",
  },
  {
    src: ANICCA_IMAGES.keyring,
    alt: "Anicca token on a keyring",
  },
] as const;

export function formatAniccaPrice(amount = ANICCA_PRICE_EUR): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: ANICCA_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getAniccaVariant(id: AniccaVariantId | null): AniccaVariant | undefined {
  if (!id) return undefined;
  return ANICCA_VARIANTS.find((v) => v.id === id);
}

export function getDefaultAniccaVariant(): AniccaVariant {
  return getAniccaVariant(ANICCA_DEFAULT_VARIANT_ID) ?? ANICCA_VARIANTS[0];
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
