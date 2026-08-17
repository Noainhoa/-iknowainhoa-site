import { ANICCA_CONTACT_EMAIL, ANICCA_DISPATCH_PUBLIC } from "@/lib/anicca/config";

export const ANICCA_SHIPPING_RETURNS = {
  meta: {
    title: "Shipping and returns | Anicca",
    description:
      "Shipping, dispatch and returns for the Anicca reminder token. Standard delivery in Spain is included.",
  },
  title: "Shipping and returns",
  intro: "A short note for this small independent sale.",
  shipping: {
    title: "Shipping",
    items: [
      "Orders currently dispatch from Spain.",
      "Standard delivery within Spain is included in the €14 price (Correos ordinary post).",
      "Optional tracked delivery can be selected at checkout (Correos Carta Certificada).",
      "Delivery outside Spain is not currently advertised.",
    ],
  },
  dispatch: {
    title: "Dispatch",
    body: ANICCA_DISPATCH_PUBLIC,
  },
  returns: {
    title: "Returns",
    items: [
      `If you buy as a consumer in the EU, you may withdraw from the purchase within 14 days of receiving the token. Write to ${ANICCA_CONTACT_EMAIL} to do so.`,
      "These tokens are pre-made inscription variants, not made to a personal specification.",
      "If you withdraw, send the token back in the condition you received it. Return postage is yours unless the item is incorrect or damaged.",
    ],
  },
  problems: {
    title: "Problems with an order",
    body: `If the token arrives incorrect or damaged, write to ${ANICCA_CONTACT_EMAIL} and we will put it right.`,
  },
  contactLabel: "Contact",
};
