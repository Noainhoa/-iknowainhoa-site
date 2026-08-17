/**
 * Page copy for /anicca.
 * English ships first. Spanish can be added as `es: { … }` mirroring this shape
 * and selected via the site locale / a future ?lang= helper without changing JSX.
 */

import { ANICCA_CONTACT_EMAIL, ANICCA_DISPATCH_ESTIMATE, ANICCA_SHIPPING_MESSAGE } from "@/lib/anicca/config";

export type AniccaCopy = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    support: string;
    edition: string;
    ctaMeta: string;
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
  meanings: {
    headline: string;
    gloss: string;
    body: string;
    yathaLabel: string;
    yathaBody: string;
  };
  origin: { headline: string; paragraphs: string[]; pull: string };
  arrives: {
    headline: string;
    items: string[];
    material: string;
  };
  finalCta: { headline: string; support: string };
  faq: { headline: string; items: { q: string; a: string }[] };
  trust: {
    independent: string;
    contact: string;
    privacyNote: string;
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
      "A small, double-sided engraved token to keep close. Anicca · Impermanence. Limited first edition, €14 plus delivery.",
  },
  hero: {
    eyebrow: "Anicca · Reminder token",
    headline: "A reminder that this moment will pass.",
    support:
      "A small, double-sided engraved token to keep close — in difficult moments, good ones, and everything between.",
    edition: "Limited first edition",
    ctaMeta: "Velvet pouch + personal note included · Delivery calculated at checkout",
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
    body: "The people who first received them each found their own way to keep the token close.",
  },
  meanings: {
    headline: "Anicca",
    gloss: "Impermanence.",
    body: "Everything changes. The difficult passes, but so does the pleasant. The token is simply a physical reminder of that fact — something to see, touch or carry when perspective is harder to hold.",
    yathaLabel: "Also available: Yathābhūtaṃ · As it is",
    yathaBody:
      "To meet what is present, not as you would like it to be. Acceptance here does not mean approval — only beginning with what is actually here.",
  },
  origin: {
    headline: "Why I made it",
    paragraphs: [
      "The words returned to me during a ten-day Vipassana retreat, after a period in which cancer had changed the shape of my life.",
      "People around me sometimes minimised their own difficulties beside mine. I did not want that.",
      "I first made these tokens for people who had supported me — a physical reminder that whatever they were experiencing was real, but changing.",
    ],
    pull: "This moment is real. It may be difficult. It is also changing.",
  },
  arrives: {
    headline: "What arrives",
    items: [
      "One 2.45 cm double-sided engraved token",
      "Small velvet pouch",
      "Printed personal note",
      "Protective postal packaging",
    ],
    material: "Silver-plated metal · diamond engraved on both sides",
  },
  finalCta: {
    headline: "Choose the words you want to keep close.",
    support: "Pouch + personal note included · Delivery calculated at checkout",
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
        a: "No. Cord, chain and keyring are not included. The token can be carried, placed on a desk, attached to keys, or worn with your own cord or chain.",
      },
      {
        q: "How large is it?",
        a: "Approximately 2.45 cm in diameter.",
      },
      {
        q: "Is this an official Vipassana product?",
        a: "No. It is an independent object inspired by contemplative practice and lived experience. It is not affiliated with or endorsed by any Vipassana organisation, and it does not require religious belief.",
      },
      {
        q: "Can I give it to someone?",
        a: "Yes — when you understand the words and believe they will mean something to the recipient. It is not meant as a lesson prescribed to someone else.",
      },
      {
        q: "Where do you deliver?",
        a: ANICCA_SHIPPING_MESSAGE,
      },
      {
        q: "How soon will it be posted?",
        a: ANICCA_DISPATCH_ESTIMATE,
      },
      {
        q: "Can it be returned?",
        a: `Write to ${ANICCA_CONTACT_EMAIL} before ordering if you have a question about returns.`,
      },
    ],
  },
  trust: {
    independent:
      "Created independently. Not affiliated with or endorsed by any Vipassana organisation.",
    contact: "Questions before you buy",
    privacyNote:
      "Payment and shipping details are processed by Stripe. For privacy questions, use the contact email.",
  },
  a11y: {
    selectVariant: "Choose inscription",
    heroFrontAlt: (inscription) => `Front of the token: ${inscription}`,
    heroBackAlt: (inscription) => `Back of the token: ${inscription}`,
  },
};

/** Locale map — add `es` when Spanish UI copy is ready. Pali terms stay untranslated. */
export const aniccaCopyByLocale: Record<"en", AniccaCopy> = { en };

export function getAniccaCopy(locale: "en" | "es" = "en"): AniccaCopy {
  // Spanish UI copy can be added to aniccaCopyByLocale.es later.
  void locale;
  return aniccaCopyByLocale.en;
}
