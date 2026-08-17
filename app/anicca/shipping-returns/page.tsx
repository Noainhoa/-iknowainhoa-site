import type { Metadata } from "next";
import Link from "next/link";
import {
  ANICCA_CONTACT_EMAIL,
  ANICCA_ORIGIN,
  ANICCA_PATH,
  ANICCA_SHIPPING_RETURNS_PATH,
} from "@/lib/anicca/config";
import { ANICCA_SHIPPING_RETURNS as copy } from "@/lib/anicca/shipping";
import "../anicca.css";

const canonical = `${ANICCA_ORIGIN}${ANICCA_SHIPPING_RETURNS_PATH}`;

export const metadata: Metadata = {
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

export default function AniccaShippingReturnsPage() {
  return (
    <div className="anicca">
      <article className="anicca-wrap anicca-legal">
        <p className="anicca-eyebrow">
          <Link href={ANICCA_PATH}>Anicca</Link>
        </p>
        <h1>{copy.title}</h1>
        <p className="anicca-lead">{copy.intro}</p>

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
            <Link href={ANICCA_PATH}>Back to Anicca</Link>
          </p>
        </div>
      </article>
    </div>
  );
}
