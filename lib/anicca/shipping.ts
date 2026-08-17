import { ANICCA_CONTACT_EMAIL } from "@/lib/anicca/config";
import type { Locale } from "@/lib/i18n/shared";

export type AniccaShippingReturnsCopy = {
  meta: { title: string; description: string };
  title: string;
  shipping: { title: string; items: string[] };
  dispatch: { title: string; body: string };
  returns: { title: string; items: string[] };
  problems: { title: string; body: string };
  contactLabel: string;
  backLabel: string;
};

const en: AniccaShippingReturnsCopy = {
  meta: {
    title: "Shipping and returns | Anicca",
    description:
      "Shipping, dispatch and returns for the Anicca reminder token. Standard delivery in Spain is included.",
  },
  title: "Shipping and returns",
  shipping: {
    title: "Shipping",
    items: [
      "Orders are sent from Spain.",
      "Standard delivery within Spain is included in the €14 price (Correos ordinary post).",
      "You can choose tracked delivery at checkout.",
      "For now, delivery is available in Spain only.",
    ],
  },
  dispatch: {
    title: "Dispatch",
    body: "Orders are posted from Spain on working days.",
  },
  returns: {
    title: "Returns",
    items: [
      `If you buy in the EU as a private customer, you may withdraw from the purchase within 14 days of receiving the token. Write to ${ANICCA_CONTACT_EMAIL} to do so.`,
      "These tokens are pre-made inscription variants, not made to a personal specification.",
      "If you decide to return it, it should come back in the same condition you received it. Return postage is yours unless the item is incorrect or damaged.",
    ],
  },
  problems: {
    title: "Problems with an order",
    body: `If the token arrives incorrect or damaged, write to ${ANICCA_CONTACT_EMAIL} and I will put it right.`,
  },
  contactLabel: "Contact",
  backLabel: "Back to Anicca",
};

const es: AniccaShippingReturnsCopy = {
  meta: {
    title: "Envíos y devoluciones | Anicca",
    description:
      "Envíos, salida y devoluciones de la ficha Anicca. El envío estándar en España está incluido.",
  },
  title: "Envíos y devoluciones",
  shipping: {
    title: "Envíos",
    items: [
      "Los pedidos salen desde España.",
      "El envío estándar en España está incluido en los 14 € (Correos ordinario).",
      "Puedes elegir envío con seguimiento al pagar.",
      "De momento, los envíos están disponibles solo en España.",
    ],
  },
  dispatch: {
    title: "Salida",
    body: "Los pedidos se envían desde España en días laborables.",
  },
  returns: {
    title: "Devoluciones",
    items: [
      `Si compras en la UE como particular, puedes desistir en 14 días desde que recibes la ficha. Escríbeme a ${ANICCA_CONTACT_EMAIL}.`,
      "Son variantes ya hechas, no un grabado a medida.",
      "Si decides devolverla, debe volver en el mismo estado en que la recibiste. El envío de vuelta corre de tu cuenta, salvo que llegue mal o dañada.",
    ],
  },
  problems: {
    title: "Si hay un problema",
    body: `Si la ficha llega incorrecta o dañada, escríbeme a ${ANICCA_CONTACT_EMAIL} y lo resuelvo.`,
  },
  contactLabel: "Contacto",
  backLabel: "Volver a Anicca",
};

export function getAniccaShippingReturns(
  locale: Locale | "en" | "es" = "en"
): AniccaShippingReturnsCopy {
  return locale === "es" ? es : en;
}
