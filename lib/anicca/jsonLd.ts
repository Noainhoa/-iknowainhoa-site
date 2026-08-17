import { site } from "@/lib/site";
import {
  ANICCA_CANONICAL,
  ANICCA_CURRENCY,
  ANICCA_IMAGES,
  ANICCA_ORIGIN,
  ANICCA_PRICE_EUR,
  ANICCA_VARIANTS,
  isVariantPurchasable,
} from "@/lib/anicca/config";
import { getAniccaCopy } from "@/lib/anicca/copy";

export function buildAniccaJsonLd() {
  const copy = getAniccaCopy("en");
  const anyInStock = ANICCA_VARIANTS.some(isVariantPurchasable);
  const productImages = [
    `${ANICCA_ORIGIN}${ANICCA_IMAGES.hero}`,
    `${ANICCA_ORIGIN}${ANICCA_IMAGES.og}`,
    `${ANICCA_ORIGIN}${ANICCA_IMAGES.necklace}`,
    `${ANICCA_ORIGIN}${ANICCA_IMAGES.desk}`,
  ];

  const offers = ANICCA_VARIANTS.filter((v) => v.active).map((v) => ({
    "@type": "Offer" as const,
    name: v.label,
    sku: v.id,
    price: ANICCA_PRICE_EUR,
    priceCurrency: ANICCA_CURRENCY,
    availability: isVariantPurchasable(v)
      ? "https://schema.org/InStock"
      : "https://schema.org/SoldOut",
    url: ANICCA_CANONICAL,
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${ANICCA_CANONICAL}#webpage`,
        url: ANICCA_CANONICAL,
        name: copy.meta.title,
        description: copy.meta.description,
        isPartOf: { "@id": `${ANICCA_ORIGIN}/#website` },
        inLanguage: "en",
      },
      {
        "@type": "Product",
        "@id": `${ANICCA_CANONICAL}#product`,
        name: "Anicca Reminder Token",
        description: copy.meta.description,
        image: productImages,
        brand: {
          "@type": "Brand",
          name: site.name,
        },
        category: "Keepsake",
        material: "Silver-plated metal",
        offers: anyInStock
          ? {
              "@type": "AggregateOffer",
              priceCurrency: ANICCA_CURRENCY,
              lowPrice: ANICCA_PRICE_EUR,
              highPrice: ANICCA_PRICE_EUR,
              offerCount: ANICCA_VARIANTS.filter((v) => v.active).length,
              offers,
            }
          : {
              "@type": "Offer",
              price: ANICCA_PRICE_EUR,
              priceCurrency: ANICCA_CURRENCY,
              availability: "https://schema.org/SoldOut",
              url: ANICCA_CANONICAL,
            },
      },
      {
        "@type": "FAQPage",
        "@id": `${ANICCA_CANONICAL}#faq`,
        mainEntity: copy.faq.items
          .filter((item) => item.q && item.a)
          .map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
      },
    ],
  };
}
