import type { Metadata } from "next";
import Link from "next/link";
import {
  ANICCA_CONTACT_EMAIL,
  ANICCA_ORIGIN,
  ANICCA_PATH,
  ANICCA_SHIPPING_RETURNS_PATH,
} from "@/lib/anicca/config";
import { getAniccaShippingReturns } from "@/lib/anicca/shipping";
import { getLocale } from "@/lib/i18n";
import "../anicca.css";

const canonical = `${ANICCA_ORIGIN}${ANICCA_SHIPPING_RETURNS_PATH}`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const copy = getAniccaShippingReturns(locale);

  return {
    title: { absolute: copy.meta.title },
    description: copy.meta.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: copy.meta.title,
      description: copy.meta.description,
      siteName: "iknowainhoa",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AniccaShippingReturnsPage() {
  const locale = await getLocale();
  const copy = getAniccaShippingReturns(locale);

  return (
    <div className="anicca">
      <article className="anicca-wrap anicca-legal">
        <p className="anicca-eyebrow">
          <Link href={ANICCA_PATH}>Anicca</Link>
        </p>
        <h1>{copy.title}</h1>

        <section className="anicca-section" aria-labelledby="shipping-title">
          <h2 id="shipping-title">{copy.shipping.title}</h2>
          <ul className="anicca-list">
            {copy.shipping.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="anicca-section" aria-labelledby="dispatch-title">
          <h2 id="dispatch-title">{copy.dispatch.title}</h2>
          <p className="anicca-prose">{copy.dispatch.body}</p>
        </section>

        <section className="anicca-section" aria-labelledby="returns-title">
          <h2 id="returns-title">{copy.returns.title}</h2>
          <ul className="anicca-list">
            {copy.returns.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="anicca-section" aria-labelledby="problems-title">
          <h2 id="problems-title">{copy.problems.title}</h2>
          <p className="anicca-prose">{copy.problems.body}</p>
        </section>

        <div className="anicca-trust">
          <p>
            {copy.contactLabel}:{" "}
            <a href={`mailto:${ANICCA_CONTACT_EMAIL}`}>{ANICCA_CONTACT_EMAIL}</a>
          </p>
          <p>
            <Link href={ANICCA_PATH}>{copy.backLabel}</Link>
          </p>
        </div>
      </article>
    </div>
  );
}
