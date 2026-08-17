/**
 * Page copy for /anicca.
 * English ships first. Pali terms stay untranslated.
 * Spanish strings for the Spanish variant use natural Spanish;
 * engraved wording is stored on the variant in config.ts and must not be paraphrased.
 */

import {
  ANICCA_CONTACT_EMAIL,
  ANICCA_SHIPPING_LINE,
  ANICCA_SHIPPING_RETURNS_PATH,
  ANICCA_SHIPPING_SUPPORT,
  ANICCA_SHIPPING_TRACKED,
  type AniccaVariantId,
} from "@/lib/anicca/config";

export type AniccaMeaning = {
  headline: string;
  gloss: string;
  body: string;
};

export type AniccaCopy = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    support: string;
    edition: string;
    ctaMeta: string;
    changeInscription: string;
    closeInscription: string;
  };
  choice: {
    headline: string;
    ctaBuy: (price: string) => string;
    soldOut: string;
    remaining: (n: number) => string;
    frontLabel: string;
    backLabel: string;
    paymentMissing: string;
  };
  life: { headline: string; body: string };
  meaningByVariant: Record<AniccaVariantId, AniccaMeaning>;
  origin: { headline: string; paragraphs: string[]; pull: string };
  arrives: {
    headline: string;
    items: string[];
    material: string;
  };
  finalCta: { headline: string; support: string; tracked: string };
  faq: {
    headline: string;
    items: { q: string; a: string; href?: string; hrefLabel?: string }[];
  };
  trust: {
    independent: string;
    contact: string;
    privacyNote: string;
    shippingLink: string;
  };
  a11y: {
    selectVariant: string;
    heroFrontAlt: (inscription: string) => string;
    heroBackAlt: (inscription: string) => string;
  };
};

const en: AniccaCopy = {
  meta: {
    title: "Anicca — a reminder that this moment will pass",
    description:
      "A small, double-sided engraved token to keep close. Anicca · Impermanence. €14, standard delivery in Spain included.",
  },
  hero: {
    eyebrow: "Anicca · Reminder token",
    headline: "A reminder that this moment will pass.",
    support: "A small, double-sided engraved token to keep close.",
    edition: "Limited first edition",
    ctaMeta: ANICCA_SHIPPING_LINE,
    changeInscription: "Change inscription",
    closeInscription: "Close",
  },
  choice: {
    headline: "Choose your words",
    ctaBuy: (price) => `Get this token — ${price}`,
    soldOut: "Sold out",
    remaining: (n) => (n === 1 ? "1 remaining" : `${n} remaining`),
    frontLabel: "Front",
    backLabel: "Back",
    paymentMissing: `This inscription isn’t available at checkout yet. Write to ${ANICCA_CONTACT_EMAIL} if you’d like it.`,
  },
  life: {
    headline: "The first ones never stayed in the box.",
    body: "Everyone found their own way to keep one close.",
  },
  meaningByVariant: {
    "anicca-en": {
      headline: "Anicca",
      gloss: "Impermanence.",
      body: "Everything changes. The difficult passes; the pleasant does too. A small reminder to keep close.",
    },
    "yathabhutam-en": {
      headline: "Yathābhūtaṃ",
      gloss: "As it is.",
      body: "To meet what is present as it is, not as we would like it to be.",
    },
    "anicca-es": {
      headline: "Anicca",
      gloss: "Impermanencia.",
      body: "Todo cambia. Lo difícil pasa; lo agradable también. Un pequeño recordatorio para llevar contigo.",
    },
  },
  origin: {
    headline: "Why I made it",
    paragraphs: [
      "These words stayed with me after a ten-day Vipassana retreat, during a period when cancer had changed the shape of my life.",
      "I first made the tokens for people who had supported me — a small reminder that whatever they were going through mattered too, and that it was changing.",
    ],
    pull: "This moment is real. It is also changing.",
  },
  arrives: {
    headline: "What arrives",
    items: [
      "One 2.45 cm double-sided engraved token",
      "Velvet pouch",
      "Personal note",
    ],
    material: "Silver-plated metal · diamond engraved",
  },
  finalCta: {
    headline: "Choose the words you want to keep close.",
    support: ANICCA_SHIPPING_SUPPORT,
    tracked: ANICCA_SHIPPING_TRACKED,
  },
  faq: {
    headline: "Questions",
    items: [
      {
        q: "What is the token made from?",
        a: "Silver-plated metal, diamond engraved on both sides. It is not solid silver or sterling silver.",
      },
      {
        q: "Is a chain or cord included?",
        a: "No. Cord, chain and keyring are not included.",
      },
      {
        q: "How large is it?",
        a: "Approximately 2.45 cm in diameter.",
      },
      {
        q: "Is this an official Vipassana product?",
        a: "No. It is an independent object, not affiliated with or endorsed by any Vipassana organisation, and it does not require religious belief.",
      },
      {
        q: "Can I give it to someone?",
        a: "Yes, when the words already mean something to you and you believe they will to them.",
      },
      {
        q: "Where do you deliver?",
        a: `${ANICCA_SHIPPING_LINE}. ${ANICCA_SHIPPING_TRACKED}. Delivery outside Spain is not currently advertised.`,
        href: ANICCA_SHIPPING_RETURNS_PATH,
        hrefLabel: "Shipping and returns",
      },
      {
        q: "How is it sent?",
        a: "From Spain, by Correos. Standard delivery within Spain is included; tracked delivery can be selected at checkout.",
        href: ANICCA_SHIPPING_RETURNS_PATH,
        hrefLabel: "Shipping and returns",
      },
      {
        q: "Can it be returned?",
        a: `EU consumers can withdraw from the purchase. Write to ${ANICCA_CONTACT_EMAIL}.`,
        href: ANICCA_SHIPPING_RETURNS_PATH,
        hrefLabel: "Shipping and returns",
      },
    ],
  },
  trust: {
    independent:
      "Created independently. Not affiliated with or endorsed by any Vipassana organisation.",
    contact: "Questions before you buy",
    privacyNote:
      "Payment and shipping details are processed by Stripe. For privacy questions, use the contact email.",
    shippingLink: "Shipping and returns",
  },
  a11y: {
    selectVariant: "Choose inscription",
    heroFrontAlt: (inscription) => `Front of the token: ${inscription}`,
    heroBackAlt: (inscription) => `Back of the token: ${inscription}`,
  },
};

export const aniccaCopyByLocale: Record<"en", AniccaCopy> = { en };

export function getAniccaCopy(locale: "en" | "es" = "en"): AniccaCopy {
  void locale;
  return aniccaCopyByLocale.en;
}
