/**
 * Page copy for /anicca.
 * English ships first. Spanish can be added as `es: { … }` mirroring this shape
 * and selected via the site locale / a future ?lang= helper without changing JSX.
 */

export type AniccaCopy = {
  meta: { title: string; description: string };
  hero: {
    headline: string;
    support: string;
    cta: string;
    ctaMeta: string;
  };
  recognition: { headline: string; body: string };
  choice: {
    eyebrow: string;
    headline: string;
    selectPrompt: string;
    ctaDisabled: string;
    ctaBuy: (price: string) => string;
    soldOut: string;
    remaining: (n: number) => string;
    frontLabel: string;
    backLabel: string;
    languageLabel: string;
    priceLabel: string;
    paymentMissing: string;
  };
  meanings: {
    eyebrow: string;
    headline: string;
    aniccaTitle: string;
    aniccaGloss: string;
    aniccaBody: string;
    yathaTitle: string;
    yathaGloss: string;
    yathaBody: string;
    note: string;
  };
  keepClose: {
    headline: string;
    intro: string;
    uses: string[];
    notIncluded: string;
  };
  origin: { headline: string; paragraphs: string[] };
  arrives: {
    headline: string;
    items: string[];
    variation: string;
  };
  social: { headline: string; body: string };
  limited: { headline: string; body: string; stockLabel: string };
  finalCta: { headline: string; cta: string; support: string };
  faq: { headline: string; items: { q: string; a: string }[] };
  trust: {
    independent: string;
    contact: string;
    privacyNote: string;
    returnsNote: string;
  };
  a11y: {
    selectVariant: string;
    heroAlt: string;
  };
};

const en: AniccaCopy = {
  meta: {
    title: "Anicca Reminder Token | A Physical Reminder of Impermanence",
    description:
      "A small, double-sided engraved token to keep close during difficult moments and after them. Choose Anicca or Yathābhūtaṃ. Limited first edition.",
  },
  hero: {
    headline: "A reminder for when this moment feels permanent.",
    support:
      "A small, double-sided token to keep close during difficult periods—and after them, so you do not forget what you learned.",
    cta: "Choose your reminder",
    ctaMeta: "Limited first edition · €14 + delivery",
  },
  recognition: {
    headline: "Sometimes perspective is hardest to hold when you need it most.",
    body: "A difficult moment can feel final while you are inside it. Even after it has passed, ordinary life can make you forget what you learned while moving through it.\n\nThis token is a small physical interruption—a phrase to see, touch or carry when your mind needs help remembering that experience is always changing.",
  },
  choice: {
    eyebrow: "Choose",
    headline: "Three inscriptions. One quiet object.",
    selectPrompt: "Select a token to continue.",
    ctaDisabled: "Select a token",
    ctaBuy: (price) => `Buy this token — ${price}`,
    soldOut: "Sold out",
    remaining: (n) => (n === 1 ? "1 remaining" : `${n} remaining`),
    frontLabel: "Front",
    backLabel: "Back",
    languageLabel: "Language",
    priceLabel: "Price",
    paymentMissing:
      "Checkout is not connected yet. Add the Stripe Payment Link for this variant in lib/anicca/config.ts.",
  },
  meanings: {
    eyebrow: "Two meanings",
    headline: "Words chosen carefully.",
    aniccaTitle: "Anicca",
    aniccaGloss: "Impermanence",
    aniccaBody:
      "Everything changes. The difficult passes, but so does the pleasant. Remembering this can help us meet both without clinging to one or believing the other will last forever.",
    yathaTitle: "Yathābhūtaṃ",
    yathaGloss: "As it is",
    yathaBody:
      "To meet reality as it is—not as we wish it were. Acceptance here does not mean approval or passivity. It means beginning with what is actually present.",
    note: "These words come from contemplative traditions, but the token is not a religious requirement or a claim of spiritual authority. Choose it only when the words already feel meaningful to you.",
  },
  keepClose: {
    headline: "How to keep it close",
    intro: "Keep it in the way that naturally fits your life.",
    uses: [
      "Carry it in a wallet or pocket",
      "Keep it on a desk or beside a bed",
      "Add it to a keyring",
      "Wear it with your own cord or fine chain",
    ],
    notIncluded: "Cord, chain and keyring are not included.",
  },
  origin: {
    headline: "Why I made it",
    paragraphs: [
      "The words came back to me during a ten-day Vipassana retreat, after a period in which cancer had changed the shape of my life.",
      "During that retreat, I felt an immense amount of compassion—towards myself, towards the people who had supported me, and towards anyone facing something that felt too large to carry.",
      "People sometimes told me they felt ashamed to speak about their problems beside mine. I never wanted that. Pain does not become unimportant because someone else is facing something different. What feels overwhelming depends on the person, the moment and what they have had to hold before.",
      "I first made these tokens as a thank-you to the people who had stood beside me. I wanted them to have something small that could say what I could not always say perfectly:",
      "This moment is real. It may be difficult. It is also changing.",
      "I hope the token gives you perspective when life feels hardest, and companionship when you remember what you have already endured.",
    ],
  },
  arrives: {
    headline: "What you receive",
    items: [
      "One 2.45 cm double-sided engraved token",
      "One small velvet pouch",
      "One printed personal note",
      "Protective postal packaging",
    ],
    variation:
      "Each piece is individually engraved and may contain very slight variations in finish or lettering.",
  },
  social: {
    headline: "How the first tokens found their place",
    body: "The first people I gave these to immediately found their own way to keep them close. Some placed them on fine chains or string, some attached them to keys, and others kept them in a wallet or on a desk. Many kept the note and packaging with the token.",
  },
  limited: {
    headline: "Limited first edition",
    body: "This first edition contains 44 tokens. They were originally produced as personal gifts, and only a small number of each inscription is available.",
    stockLabel: "Current stock",
  },
  finalCta: {
    headline: "Choose the words you want to keep close.",
    cta: "Choose your reminder",
    support: "€14 + delivery · Velvet pouch and printed note included",
  },
  faq: {
    headline: "Questions",
    items: [
      {
        q: "What is the token made from?",
        a: "Silver-plated metal. It is not solid silver, sterling silver or stainless steel.",
      },
      {
        q: "Is it jewellery?",
        a: "It is designed primarily as a portable reminder. It can be worn with your own cord or chain, but it can also be carried, placed on a desk or attached to keys.",
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
        q: "Is it engraved on both sides?",
        a: "Yes. The lettering is diamond engraved rather than laser printed.",
      },
      {
        q: "Is this an official Vipassana product?",
        a: "No. It is an independent personal project inspired by lived experience and practice. It is not affiliated with or endorsed by any Vipassana organisation.",
      },
      {
        q: "Can I give it to someone?",
        a: "Yes—but it is most meaningful when you understand the words and believe they will resonate with the recipient. It should not be framed as prescribing a lesson to another person.",
      },
      {
        q: "Where do you deliver?",
        a: "", // filled from config at render time
      },
      {
        q: "How soon will it be posted?",
        a: "", // filled from config
      },
      {
        q: "Can it be returned?",
        a: "A site-wide returns policy is not published yet. Please write to the contact email before ordering if you need clarity; a formal returns page will be linked here once available.",
      },
    ],
  },
  trust: {
    independent:
      "Created independently from personal experience. Not affiliated with or endorsed by any Vipassana organisation.",
    contact: "Questions before you buy",
    privacyNote:
      "Payment and shipping details are processed by Stripe. For privacy questions, use the contact email.",
    returnsNote:
      "Returns policy: not yet published on this site — confirm with the owner before launch.",
  },
  a11y: {
    selectVariant: "Token inscription",
    heroAlt: "Close-up of the silver-plated reminder token showing diamond-engraved lettering",
  },
};

/** Locale map — add `es` when Spanish UI copy is ready. Pali terms stay untranslated. */
export const aniccaCopyByLocale: Record<"en", AniccaCopy> = { en };

export function getAniccaCopy(locale: "en" | "es" = "en"): AniccaCopy {
  // Spanish UI copy can be added to aniccaCopyByLocale.es later.
  void locale;
  return aniccaCopyByLocale.en;
}
