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

export type AniccaFaqItem = {
  q: string;
  a: string;
  href?: string;
  hrefLabel?: string;
};

export type AniccaCopy = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    support: string;
    supportClose: string;
    ctaMeta: string;
    contents: string;
    changeInscription: string;
    closeInscription: string;
  };
  choice: {
    ctaBuy: (price: string) => string;
    soldOut: string;
    remaining: (n: number) => string;
    frontLabel: string;
    backLabel: string;
    paymentMissing: string;
  };
  life: { headline: string; imageAlts: string[] };
  meaningByVariant: Record<AniccaVariantId, AniccaMeaning>;
  origin: { paragraphs: string[] };
  materials: string;
  faq: { items: AniccaFaqItem[] };
  secondary: {
    about: string;
    why: string;
    shipping: string;
    materials: string;
    faq: string;
    contact: string;
    disclaimer: string;
  };
  trust: {
    independent: string;
    contactPage: string;
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
    title: "Anicca — a reminder to keep close",
    description:
      "A small engraved reminder token. €14, standard delivery in Spain included. For difficult days and beautiful ones.",
  },
  hero: {
    eyebrow: "Anicca · A reminder to keep close",
    headline: "Whatever you’re going through, it will change.",
    support: "For the difficult days. For the beautiful ones you wish could stay.",
    supportClose: "Anicca — everything changes.",
    ctaMeta: "Standard delivery in Spain included",
    contents: "2.45 cm engraved token · velvet pouch · personal note",
    changeInscription: "Change inscription",
    closeInscription: "Close",
  },
  choice: {
    ctaBuy: (price) => `Get this token — ${price}`,
    soldOut: "Sold out",
    remaining: (n) => (n === 1 ? "1 remaining" : `${n} remaining`),
    frontLabel: "Front",
    backLabel: "Back",
    paymentMissing: `This inscription isn’t available at checkout yet. Write to ${ANICCA_CONTACT_EMAIL} if you’d like it.`,
  },
  life: {
    headline: "The first ones never stayed in the box.",
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
    paragraphs: [
      "These words stayed with me after a ten-day Vipassana retreat, during a period when cancer had changed the shape of my life.",
      "I first made the tokens for people who had supported me — a small reminder that whatever they were going through mattered too, and that it was changing.",
    ],
  },
  materials:
    "Silver-plated metal, diamond engraved on both sides. It is not solid silver or sterling silver. Cord, chain and keyring are not included.",
  faq: {
    items: [
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
  secondary: {
    about: "About Anicca",
    why: "Why I made it",
    shipping: "Shipping & returns",
    materials: "Materials",
    faq: "FAQ",
    contact: "Contact",
    disclaimer: "Disclaimer",
  },
  trust: {
    independent:
      "Created independently. Not affiliated with or endorsed by any Vipassana organisation.",
    contactPage: "Contact",
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
    title: "Anicca — un recordatorio para llevar cerca",
    description:
      "Un pequeño token grabado como recordatorio. 14 €, envío estándar en España incluido. Para los días difíciles y también para los hermosos.",
  },
  hero: {
    eyebrow: "Anicca · Un recordatorio para llevar cerca",
    headline: "Lo que estés viviendo, también cambiará.",
    support: "Para los días difíciles. Para los hermosos que desearías que se quedaran.",
    supportClose: "Anicca — todo cambia.",
    ctaMeta: "Envío estándar en España incluido",
    contents: "Token grabado de 2,45 cm · bolsita de terciopelo · nota personal",
    changeInscription: "Cambiar inscripción",
    closeInscription: "Cerrar",
  },
  choice: {
    ctaBuy: (price) => `Quiero este token — ${price}`,
    soldOut: "Agotada",
    remaining: (n) => (n === 1 ? "1 restante" : `${n} restantes`),
    frontLabel: "Anverso",
    backLabel: "Reverso",
    paymentMissing: `Esta inscripción aún no está disponible al pagar. Escríbeme a ${ANICCA_CONTACT_EMAIL} si te interesa.`,
  },
  life: {
    headline: "Las primeras nunca se quedaron guardadas.",
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
    paragraphs: [
      "Estas palabras se quedaron conmigo después de un retiro de Vipassana de diez días, en una etapa en la que el cáncer había cambiado mi vida.",
      "Las primeras las hice para quienes me habían apoyado: un pequeño recordatorio de que lo que ellos estaban viviendo también importaba y también estaba cambiando.",
    ],
  },
  materials:
    "Metal plateado, grabado con diamante por las dos caras. No es plata de ley. No incluye cordón, cadena ni llavero.",
  faq: {
    items: [
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
  secondary: {
    about: "Sobre Anicca",
    why: "Por qué la hice",
    shipping: "Envíos y devoluciones",
    materials: "Materiales",
    faq: "Preguntas",
    contact: "Contacto",
    disclaimer: "Aviso",
  },
  trust: {
    independent:
      "Creado de forma independiente. Sin vinculación con ninguna organización de Vipassana.",
    contactPage: "Contacto",
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
