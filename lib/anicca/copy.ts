/**
 * Page copy for /anicca.
 * English and Spanish are written natively. Pali terms stay untranslated.
 * Engraved wording lives on the variant in config.ts and must not be paraphrased.
 */

import {
  ANICCA_CONTACT_EMAIL,
  ANICCA_SHIPPING_RETURNS_PATH,
  type AniccaVariantId,
} from "@/lib/anicca/config";
import type { Locale } from "@/lib/i18n/shared";

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
  life: { headline: string; body: string; imageAlts: string[] };
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
    contactPage: string;
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
    support:
      "A small token to keep close when life feels difficult — and when it feels beautiful. A physical reminder that everything changes.",
    edition: "Limited first edition",
    ctaMeta: "Standard delivery in Spain included",
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
    imageAlts: [
      "Anicca token worn on a cord at the wrist",
      "Anicca token kept in a small bowl on a wooden desk",
      "Anicca token carried in a small pouch beside everyday objects",
      "Anicca token on a keyring",
    ],
  },
  meaningByVariant: {
    "anicca-en": {
      headline: "Anicca",
      gloss: "Impermanence.",
      body: "Everything changes. The difficult passes; the pleasant does too.",
    },
    "yathabhutam-en": {
      headline: "Yathābhūtaṃ",
      gloss: "As it is.",
      body: "To see what is here as it is, not as we would like it to be.",
    },
    "anicca-es": {
      headline: "Anicca",
      gloss: "Impermanencia.",
      body: "Todo cambia. Lo difícil pasa; lo agradable también.",
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
    support: "Pouch + personal note included · Standard delivery in Spain included",
    tracked: "You can choose tracked delivery at checkout",
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
        q: "Is this an official Vipassana product?",
        a: "No. It is an independent object, not affiliated with or endorsed by any Vipassana organisation, and it does not require religious belief.",
      },
      {
        q: "Can I give it to someone?",
        a: "Yes. In fact, the first ones were made to give.",
      },
      {
        q: "Where do you deliver?",
        a: "Standard delivery in Spain is included. You can choose tracked delivery at checkout. I don’t currently offer delivery outside Spain.",
        href: ANICCA_SHIPPING_RETURNS_PATH,
        hrefLabel: "Shipping and returns",
      },
      {
        q: "Can it be returned?",
        a: `If you buy in the EU as a private customer, you can withdraw within 14 days. Write to ${ANICCA_CONTACT_EMAIL}.`,
        href: ANICCA_SHIPPING_RETURNS_PATH,
        hrefLabel: "Shipping and returns",
      },
    ],
  },
  trust: {
    independent:
      "Created independently. Not affiliated with or endorsed by any Vipassana organisation.",
    contact: "Questions before you buy",
    contactPage: "Contact",
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

const es: AniccaCopy = {
  meta: {
    title: "Anicca — un recordatorio de que este momento también pasará",
    description:
      "Una pequeña ficha grabada por ambas caras para llevar contigo. Anicca · Impermanencia. 14 €, envío estándar en España incluido.",
  },
  hero: {
    eyebrow: "Anicca · Token recordatorio",
    headline: "Un recordatorio de que este momento también pasará.",
    support:
      "Un pequeño token para tener cerca cuando la vida se hace difícil — y también cuando es hermosa. Un recordatorio físico de que todo cambia.",
    edition: "Primera edición limitada",
    ctaMeta: "Envío estándar en España incluido",
    changeInscription: "Cambiar inscripción",
    closeInscription: "Cerrar",
  },
  choice: {
    headline: "Elige tus palabras",
    ctaBuy: (price) => `Quiero este token — ${price}`,
    soldOut: "Agotada",
    remaining: (n) => (n === 1 ? "1 restante" : `${n} restantes`),
    frontLabel: "Anverso",
    backLabel: "Reverso",
    paymentMissing: `Esta inscripción aún no está disponible al pagar. Escríbeme a ${ANICCA_CONTACT_EMAIL} si te interesa.`,
  },
  life: {
    headline: "Las primeras nunca se quedaron guardadas.",
    body: "Cada persona encontró su forma de llevarla consigo.",
    imageAlts: [
      "Ficha Anicca llevada en un cordón en la muñeca",
      "Ficha Anicca en un cuenco pequeño sobre un escritorio de madera",
      "Ficha Anicca junto a objetos de cada día",
      "Ficha Anicca en un llavero",
    ],
  },
  meaningByVariant: {
    "anicca-en": {
      headline: "Anicca",
      gloss: "Impermanencia.",
      body: "Todo cambia. Lo difícil pasa; lo agradable también.",
    },
    "yathabhutam-en": {
      headline: "Yathābhūtaṃ",
      gloss: "Tal como es.",
      body: "Ver lo que hay tal como es, no como nos gustaría que fuese.",
    },
    "anicca-es": {
      headline: "Anicca",
      gloss: "Impermanencia.",
      body: "Todo cambia. Lo difícil pasa; lo agradable también.",
    },
  },
  origin: {
    headline: "Por qué la hice",
    paragraphs: [
      "Estas palabras se quedaron conmigo después de un retiro de Vipassana de diez días, en una etapa en la que el cáncer había cambiado mi vida.",
      "Las primeras las hice para quienes me habían apoyado: un pequeño recordatorio de que lo que ellos estaban viviendo también importaba y también estaba cambiando.",
    ],
    pull: "Este momento es real. También está cambiando.",
  },
  arrives: {
    headline: "Qué recibes",
    items: [
      "Una ficha grabada por ambas caras de 2,45 cm",
      "Bolsita de terciopelo",
      "Nota personal",
    ],
    material: "Metal plateado · grabado con diamante",
  },
  finalCta: {
    headline: "Elige las palabras que quieres llevar contigo.",
    support: "Bolsita y nota personal incluidas · Envío estándar en España incluido",
    tracked: "Puedes elegir envío con seguimiento al pagar",
  },
  faq: {
    headline: "Preguntas",
    items: [
      {
        q: "¿De qué está hecha?",
        a: "Metal plateado, grabado con diamante por las dos caras. No es plata de ley.",
      },
      {
        q: "¿Incluye cadena o cordón?",
        a: "No.",
      },
      {
        q: "¿Es un producto oficial de Vipassana?",
        a: "No. Es un objeto independiente, sin vinculación con ninguna organización de Vipassana.",
      },
      {
        q: "¿Se puede regalar?",
        a: "Sí. De hecho, las primeras las hice precisamente para regalar.",
      },
      {
        q: "¿Dónde envías?",
        a: "El envío estándar en España está incluido. Puedes elegir envío con seguimiento al pagar. De momento no ofrezco envíos fuera de España.",
        href: ANICCA_SHIPPING_RETURNS_PATH,
        hrefLabel: "Envíos y devoluciones",
      },
      {
        q: "¿Se puede devolver?",
        a: `Si compras en la UE como particular, puedes desistir en 14 días. Escríbeme a ${ANICCA_CONTACT_EMAIL}.`,
        href: ANICCA_SHIPPING_RETURNS_PATH,
        hrefLabel: "Envíos y devoluciones",
      },
    ],
  },
  trust: {
    independent:
      "Creado de forma independiente. Sin vinculación con ninguna organización de Vipassana.",
    contact: "Dudas antes de comprar",
    contactPage: "Contacto",
    privacyNote:
      "El pago y los datos de envío los gestiona Stripe. Si tienes dudas de privacidad, usa el correo de contacto.",
    shippingLink: "Envíos y devoluciones",
  },
  a11y: {
    selectVariant: "Elige inscripción",
    heroFrontAlt: (inscription) => `Anverso de la ficha: ${inscription}`,
    heroBackAlt: (inscription) => `Reverso de la ficha: ${inscription}`,
  },
};

export const aniccaCopyByLocale: Record<"en" | "es", AniccaCopy> = { en, es };

export function getAniccaCopy(locale: Locale | "en" | "es" = "en"): AniccaCopy {
  return locale === "es" ? aniccaCopyByLocale.es : aniccaCopyByLocale.en;
}
