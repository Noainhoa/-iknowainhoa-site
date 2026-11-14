import type { Locale } from "@/lib/i18n/shared";
import { getParkingCopy } from "@/lib/parking/i18n";
import { parkingOfferSpecs } from "@/lib/parking/pricing";
import {
  PARKING_GOOGLE_MAPS_URL,
  PARKING_GOOGLE_RATING,
  PARKING_GOOGLE_REVIEWS,
  parkingGoogleQuote,
} from "@/lib/parking/googleReviews";
import {
  PARKING_GEO,
  PARKING_ORIGIN,
  PARKING_PATH,
  parkingCanonicalUrl,
} from "@/lib/parking/seo";

export function buildParkingJsonLd(locale: Locale) {
  const t = getParkingCopy(locale);
  const pageUrl = parkingCanonicalUrl(locale);
  const facilityId = `${PARKING_ORIGIN}${PARKING_PATH}#facility`;
  const webpageId = `${pageUrl}#webpage`;

  const widthName =
    locale === "es" ? "Ancho" : locale === "fr" ? "Largeur" : "Width";
  const lengthName =
    locale === "es" ? "Largo" : locale === "fr" ? "Longueur" : "Length";
  const heightName =
    locale === "es"
      ? "Altura máxima de acceso"
      : locale === "fr"
        ? "Hauteur maximale d’accès"
        : "Maximum access height";
  const typeName = locale === "es" ? "Tipo" : locale === "fr" ? "Type" : "Type";
  const typeValue =
    locale === "es"
      ? "Plaza privada en garaje cubierto"
      : locale === "fr"
        ? "Place privée en garage couvert"
        : "Private covered garage bay";
  const actionName =
    locale === "es"
      ? "Solicitar por WhatsApp"
      : locale === "fr"
        ? "Demander via WhatsApp"
        : "Enquire through WhatsApp";
  const homeName =
    locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home";

  const unitCode = (unit: "day" | "week" | "month") =>
    unit === "day" ? "DAY" : unit === "week" ? "WEE" : "MON";

  const offers = parkingOfferSpecs().map((spec) => ({
    "@type": "Offer",
    name: spec.name[locale],
    price: spec.price,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: pageUrl,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: spec.price,
      priceCurrency: "EUR",
      unitCode: unitCode(spec.unit),
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: pageUrl,
        name: t.metaTitle,
        description: t.metaDescription,
        inLanguage: locale,
        isPartOf: {
          "@type": "WebSite",
          name: "iknowainhoa",
          url: PARKING_ORIGIN,
        },
        about: { "@id": facilityId },
        mainEntity: { "@id": facilityId },
      },
      {
        "@type": "ParkingFacility",
        "@id": facilityId,
        name: t.brand,
        description: t.metaDescription,
        url: pageUrl,
        image: [
          `${PARKING_ORIGIN}/images/parking/plaza-1.jpg`,
          `${PARKING_ORIGIN}/images/parking/plaza-2.jpg`,
          `${PARKING_ORIGIN}/images/parking/plaza-3.jpg`,
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Carrer de Jorge Juan, 13",
          addressLocality: "Guardamar del Segura",
          addressRegion: "Alicante",
          postalCode: "03140",
          addressCountry: "ES",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: PARKING_GEO.latitude,
          longitude: PARKING_GEO.longitude,
        },
        sameAs: [PARKING_GOOGLE_MAPS_URL],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: PARKING_GOOGLE_RATING.ratingValue,
          reviewCount: PARKING_GOOGLE_RATING.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
        review: PARKING_GOOGLE_REVIEWS.map((item) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: item.author,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: PARKING_GOOGLE_RATING.ratingValue,
            bestRating: 5,
            worstRating: 1,
          },
          reviewBody: parkingGoogleQuote(item, locale),
        })),
        publicAccess: false,
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: widthName,
            value: "240 cm",
          },
          {
            "@type": "PropertyValue",
            name: lengthName,
            value: "490 cm",
          },
          {
            "@type": "PropertyValue",
            name: heightName,
            value: "179 cm",
          },
          {
            "@type": "PropertyValue",
            name: typeName,
            value: typeValue,
          },
        ],
        makesOffer: offers,
        potentialAction: {
          "@type": "CommunicateAction",
          name: actionName,
          target: `${pageUrl}#pk-form-heading`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: homeName,
            item: PARKING_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t.breadcrumbCurrent,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: t.faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
