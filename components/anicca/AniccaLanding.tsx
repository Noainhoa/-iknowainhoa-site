"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { trackAniccaEvent } from "@/lib/anicca/analytics";
import {
  ANICCA_DISPATCH_ESTIMATE,
  ANICCA_FIRST_EDITION_TOTAL,
  ANICCA_IMAGES,
  ANICCA_PRICE_EUR,
  ANICCA_SHIPPING_MESSAGE,
  ANICCA_VARIANTS,
  type AniccaVariant,
  type AniccaVariantId,
  hasValidStripeUrl,
  isVariantPurchasable,
} from "@/lib/anicca/config";
import { getAniccaCopy } from "@/lib/anicca/copy";
import { site } from "@/lib/site";

function priceLabel(amount = ANICCA_PRICE_EUR) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Media({
  src,
  alt,
  sizes = "(max-width: 880px) 100vw, 540px",
  priority = false,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={900}
      sizes={sizes}
      priority={priority}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition,
      }}
    />
  );
}

export default function AniccaLanding() {
  const copy = getAniccaCopy("en");
  const groupId = useId();
  const [selectedId, setSelectedId] = useState<AniccaVariantId | null>(null);
  const [checkoutNote, setCheckoutNote] = useState<string | null>(null);

  const selected = ANICCA_VARIANTS.find((v) => v.id === selectedId) ?? null;

  useEffect(() => {
    trackAniccaEvent({ name: "anicca_view" });
  }, []);

  function selectVariant(variant: AniccaVariant) {
    if (!isVariantPurchasable(variant)) return;
    setSelectedId(variant.id);
    setCheckoutNote(null);
    trackAniccaEvent({ name: "anicca_variant_select", variantId: variant.id });
  }

  function onBuyClick() {
    if (!selected) return;
    if (!isVariantPurchasable(selected)) {
      trackAniccaEvent({
        name: "anicca_checkout_blocked",
        variantId: selected.id,
        reason: "sold_out",
      });
      return;
    }
    if (!hasValidStripeUrl(selected.stripePaymentUrl)) {
      setCheckoutNote(copy.choice.paymentMissing);
      trackAniccaEvent({
        name: "anicca_checkout_blocked",
        variantId: selected.id,
        reason: "no_payment_url",
      });
      return;
    }
    trackAniccaEvent({ name: "anicca_checkout_click", variantId: selected.id });
    window.location.assign(selected.stripePaymentUrl);
  }

  const faqItems = copy.faq.items.map((item) => {
    if (item.q === "Where do you deliver?") {
      return { ...item, a: ANICCA_SHIPPING_MESSAGE };
    }
    if (item.q === "How soon will it be posted?") {
      return { ...item, a: ANICCA_DISPATCH_ESTIMATE };
    }
    return item;
  });

  const keepImages: {
    src: string;
    alt: string;
    label: string;
    objectPosition?: string;
    frame?: "portrait";
  }[] = [
    { src: ANICCA_IMAGES.wallet, alt: "Token carried in a wallet", label: copy.keepClose.uses[0] },
    { src: ANICCA_IMAGES.desk, alt: "Token on a desk", label: copy.keepClose.uses[1] },
    {
      src: ANICCA_IMAGES.keyring,
      alt: "Token on a keyring",
      label: copy.keepClose.uses[2],
      objectPosition: "center bottom",
      frame: "portrait",
    },
    { src: ANICCA_IMAGES.necklace, alt: "Token on a fine cord", label: copy.keepClose.uses[3] },
  ];

  return (
    <div className="anicca">
      <div className="anicca-wrap">
        <header className="anicca-hero">
          <figure className="anicca-hero-media">
            <Media src={ANICCA_IMAGES.hero} alt={copy.a11y.heroAlt} priority sizes="(max-width: 880px) 100vw, 560px" />
          </figure>
          <div className="anicca-hero-copy">
            <h1>{copy.hero.headline}</h1>
            <p className="anicca-lead">{copy.hero.support}</p>
            <div className="anicca-cta-row">
              <a className="anicca-btn" href="#choose">
                {copy.hero.cta}
              </a>
              <p className="anicca-meta">{copy.hero.ctaMeta}</p>
            </div>
          </div>
        </header>

        <section className="anicca-section" aria-labelledby="recognition-title">
          <h2 id="recognition-title">{copy.recognition.headline}</h2>
          <p className="anicca-prose">{copy.recognition.body}</p>
        </section>

        <section className="anicca-section" id="choose" aria-labelledby="choice-title">
          <p className="anicca-eyebrow">{copy.choice.eyebrow}</p>
          <h2 id="choice-title">{copy.choice.headline}</h2>

          <div
            className="anicca-choice-grid"
            role="radiogroup"
            aria-label={copy.a11y.selectVariant}
          >
            {ANICCA_VARIANTS.map((variant) => {
              const purchasable = isVariantPurchasable(variant);
              const selectedState = selectedId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedState}
                  aria-disabled={!purchasable}
                  disabled={!purchasable}
                  className={`anicca-option${selectedState ? " is-selected" : ""}${
                    !purchasable ? " is-sold-out" : ""
                  }`}
                  onClick={() => selectVariant(variant)}
                >
                  <div className="anicca-option-thumbs">
                    <figure>
                      <Media
                        src={variant.images.front}
                        alt={`${variant.name} front: ${variant.front}`}
                        sizes="160px"
                      />
                    </figure>
                    <figure>
                      <Media
                        src={variant.images.back}
                        alt={`${variant.name} back: ${variant.back}`}
                        sizes="160px"
                      />
                    </figure>
                  </div>
                  <p className="anicca-option-title">{variant.label}</p>
                  <p className="anicca-option-inscribe">
                    <strong>{copy.choice.frontLabel}:</strong> {variant.front}
                    <br />
                    <strong>{copy.choice.backLabel}:</strong> {variant.back}
                  </p>
                  <p className="anicca-option-meta">
                    <span className="anicca-pill">
                      {copy.choice.languageLabel}: {variant.language}
                    </span>
                    <span className="anicca-pill">
                      {copy.choice.priceLabel}: {priceLabel(variant.priceEur)}
                    </span>
                    {purchasable ? (
                      <span className="anicca-pill">{copy.choice.remaining(variant.stock)}</span>
                    ) : (
                      <span className="anicca-pill anicca-pill--sold">{copy.choice.soldOut}</span>
                    )}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="anicca-buy-panel">
            {!selected ? <p className="anicca-meta">{copy.choice.selectPrompt}</p> : null}
            <button
              type="button"
              className="anicca-btn"
              disabled={!selected || !isVariantPurchasable(selected)}
              aria-describedby={checkoutNote ? `${groupId}-note` : undefined}
              onClick={onBuyClick}
            >
              {selected
                ? copy.choice.ctaBuy(priceLabel(selected.priceEur))
                : copy.choice.ctaDisabled}
            </button>
            {checkoutNote ? (
              <p id={`${groupId}-note`} className="anicca-notice" role="status">
                {checkoutNote}
              </p>
            ) : null}
            <p className="anicca-meta">€{ANICCA_PRICE_EUR} + delivery · Quantity 1</p>
          </div>
        </section>

        <section className="anicca-section" aria-labelledby="meanings-title">
          <p className="anicca-eyebrow">{copy.meanings.eyebrow}</p>
          <h2 id="meanings-title">{copy.meanings.headline}</h2>
          <div className="anicca-meanings">
            <article className="anicca-meaning">
              <h3>{copy.meanings.aniccaTitle}</h3>
              <p className="anicca-gloss">{copy.meanings.aniccaGloss}</p>
              <p className="anicca-prose">{copy.meanings.aniccaBody}</p>
            </article>
            <article className="anicca-meaning">
              <h3>{copy.meanings.yathaTitle}</h3>
              <p className="anicca-gloss">{copy.meanings.yathaGloss}</p>
              <p className="anicca-prose">{copy.meanings.yathaBody}</p>
            </article>
          </div>
          <p className="anicca-prose" style={{ marginTop: 28 }}>
            {copy.meanings.note}
          </p>
        </section>

        <section className="anicca-section" aria-labelledby="keep-title">
          <h2 id="keep-title">{copy.keepClose.headline}</h2>
          <p className="anicca-prose">{copy.keepClose.intro}</p>
          <ul className="anicca-uses">
            {keepImages.map((item) => (
              <li key={item.src}>
                <figure
                  className={`anicca-media${item.frame === "portrait" ? " anicca-media--portrait" : ""}`}
                >
                  <Media
                    src={item.src}
                    alt={item.alt}
                    sizes="(max-width: 720px) 100vw, 480px"
                    objectPosition={item.objectPosition ?? "center"}
                  />
                </figure>
                <p>{item.label}</p>
              </li>
            ))}
          </ul>
          <p className="anicca-meta" style={{ marginTop: 18 }}>
            {copy.keepClose.notIncluded}
          </p>
        </section>

        <section className="anicca-section" aria-labelledby="origin-title">
          <div style={{ display: "grid", gap: 28 }}>
            <figure className="anicca-media" style={{ maxWidth: 560 }}>
              <Media
                src={ANICCA_IMAGES.note}
                alt="Printed personal note supplied with the token"
                sizes="(max-width: 720px) 100vw, 560px"
              />
            </figure>
            <div>
              <h2 id="origin-title">{copy.origin.headline}</h2>
              {copy.origin.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="anicca-prose" style={{ marginTop: "1em" }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="anicca-section" aria-labelledby="arrives-title">
          <div
            style={{
              display: "grid",
              gap: 28,
              gridTemplateColumns: "minmax(0, 1fr)",
            }}
            className="anicca-arrives"
          >
            <figure className="anicca-media" style={{ maxWidth: 640 }}>
              <Media
                src={ANICCA_IMAGES.flatLay}
                alt="Token, velvet pouch and packaging laid out together"
                sizes="(max-width: 720px) 100vw, 640px"
              />
            </figure>
            <div>
              <h2 id="arrives-title">{copy.arrives.headline}</h2>
              <ul className="anicca-list">
                {copy.arrives.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="anicca-prose" style={{ marginTop: 18 }}>
                {copy.arrives.variation}
              </p>
            </div>
          </div>
        </section>

        <section className="anicca-section" aria-labelledby="social-title">
          <h2 id="social-title">{copy.social.headline}</h2>
          <p className="anicca-prose">{copy.social.body}</p>
          {/* Verified testimonials can be appended here when quotes and permission exist. */}
        </section>

        <section className="anicca-section" aria-labelledby="limited-title">
          <h2 id="limited-title">{copy.limited.headline}</h2>
          <p className="anicca-prose">{copy.limited.body}</p>
          <table className="anicca-stock-table">
            <caption className="anicca-meta" style={{ captionSide: "top", textAlign: "left", marginBottom: 8 }}>
              {copy.limited.stockLabel} · {ANICCA_FIRST_EDITION_TOTAL} first edition
            </caption>
            <thead>
              <tr>
                <th scope="col">Inscription</th>
                <th scope="col">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {ANICCA_VARIANTS.map((v) => (
                <tr key={v.id}>
                  <td>{v.label}</td>
                  <td>{v.stock > 0 ? v.stock : copy.choice.soldOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="anicca-section" aria-labelledby="final-title">
          <h2 id="final-title">{copy.finalCta.headline}</h2>
          <div className="anicca-cta-row" style={{ marginTop: 20 }}>
            <a className="anicca-btn" href="#choose">
              {copy.finalCta.cta}
            </a>
            <p className="anicca-meta">{copy.finalCta.support}</p>
          </div>
        </section>

        <section className="anicca-section anicca-faq" aria-labelledby="faq-title">
          <h2 id="faq-title">{copy.faq.headline}</h2>
          {faqItems.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
          <div className="anicca-trust">
            <p>{copy.trust.independent}</p>
            <p>
              {copy.trust.contact}:{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>
              {" · "}
              <Link href="/contact">Contact</Link>
            </p>
            <p>{copy.trust.privacyNote}</p>
            <p>{copy.trust.returnsNote}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
