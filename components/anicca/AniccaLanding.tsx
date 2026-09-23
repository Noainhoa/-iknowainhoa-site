"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import AniccaVariantPicker from "@/components/anicca/AniccaVariantPicker";
import { trackAniccaEvent } from "@/lib/anicca/analytics";
import {
  ANICCA_CONTACT_EMAIL,
  ANICCA_LIFE_IMAGES,
  ANICCA_SHIPPING_RETURNS_PATH,
  ANICCA_VARIANTS,
  formatAniccaPrice,
  getDefaultAniccaVariant,
  hasValidStripeUrl,
  isVariantPurchasable,
  type AniccaVariant,
  type AniccaVariantId,
} from "@/lib/anicca/config";
import { getAniccaCopy, type AniccaCopy } from "@/lib/anicca/copy";
import type { Locale } from "@/lib/i18n/shared";

function Media({
  src,
  alt,
  sizes = "(max-width: 880px) 100vw, 540px",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
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
        objectPosition: "center",
      }}
    />
  );
}

function CheckoutAction({
  selected,
  label,
  soldOut,
  noteId,
  onBlocked,
}: {
  selected: AniccaVariant;
  label: string;
  soldOut: string;
  noteId?: string;
  onBlocked: (variant: AniccaVariant, reason: "sold_out" | "no_payment_url") => void;
}) {
  const purchasable = isVariantPurchasable(selected);
  const ready = purchasable && hasValidStripeUrl(selected.stripePaymentUrl);

  if (ready) {
    return (
      <a
        className="anicca-btn"
        href={selected.stripePaymentUrl}
        aria-describedby={noteId}
        onClick={() =>
          trackAniccaEvent({ name: "anicca_checkout_clicked", variantId: selected.id })
        }
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="anicca-btn"
      disabled={!purchasable}
      aria-describedby={noteId}
      onClick={() => onBlocked(selected, purchasable ? "no_payment_url" : "sold_out")}
    >
      {purchasable ? label : soldOut}
    </button>
  );
}

export default function AniccaLanding({ locale = "en" }: { locale?: Locale }) {
  const copy: AniccaCopy = getAniccaCopy(locale);
  const noteId = useId();
  const pageLocale = locale === "es" ? "es" : "en";
  const [selectedId, setSelectedId] = useState<AniccaVariantId>(
    () => getDefaultAniccaVariant(pageLocale).id
  );
  const [checkoutNote, setCheckoutNote] = useState<string | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);

  const variant =
    ANICCA_VARIANTS.find((item) => item.id === selectedId) ??
    getDefaultAniccaVariant(pageLocale);
  const meaning = copy.meaningByVariant[variant.id];
  const price = formatAniccaPrice(variant.priceEur, pageLocale);
  const commercialLine = `${price} · ${copy.hero.ctaMeta}`;
  const ctaLabel = copy.choice.ctaBuy(price);
  const describedBy = checkoutNote ? noteId : undefined;

  useEffect(() => {
    trackAniccaEvent({ name: "anicca_view" });
  }, []);

  function selectVariant(next: AniccaVariant, collapseHero = false) {
    setSelectedId(next.id);
    setCheckoutNote(null);
    if (collapseHero) setChooserOpen(false);
    trackAniccaEvent({ name: "anicca_variant_selected", variantId: next.id });
  }

  function onBlocked(next: AniccaVariant, reason: "sold_out" | "no_payment_url") {
    trackAniccaEvent({
      name: "anicca_checkout_blocked",
      variantId: next.id,
      reason,
    });
    if (reason === "no_payment_url") {
      setCheckoutNote(copy.choice.paymentMissing);
    }
  }

  return (
    <div className="anicca">
      <div className="anicca-wrap">
        <header className="anicca-hero">
          <div className="anicca-hero-photos">
            <figure className="anicca-shot anicca-shot--front">
              <div className="anicca-frame">
                <Media
                  src={variant.images.front}
                  alt={copy.a11y.heroFrontAlt(variant.front)}
                  priority
                  sizes="(max-width: 880px) 70vw, 480px"
                />
              </div>
              <figcaption>
                <span className="anicca-shot-side">{copy.choice.frontLabel}</span>
                <span className="anicca-shot-text">{variant.frontCaption}</span>
              </figcaption>
            </figure>
            <figure className="anicca-shot anicca-shot--back">
              <div className="anicca-frame">
                <Media
                  src={variant.images.back}
                  alt={copy.a11y.heroBackAlt(variant.back)}
                  sizes="(max-width: 880px) 40vw, 280px"
                />
              </div>
              <figcaption>
                <span className="anicca-shot-side">{copy.choice.backLabel}</span>
                <span className="anicca-shot-text">{variant.backCaption}</span>
              </figcaption>
            </figure>
          </div>

          <div className="anicca-hero-copy">
            <p className="anicca-eyebrow">{copy.hero.eyebrow}</p>
            <h1>{copy.hero.headline}</h1>
            <p className="anicca-lead">{copy.hero.support}</p>

            <p className="anicca-commercial">{commercialLine}</p>

            <div className="anicca-buy" id="choose">
              <div className="anicca-current">
                <p className="anicca-current-label">{variant.selectorLabel}</p>
                <p className="anicca-current-detail">{variant.compactDetail}</p>
                <p className="anicca-edition">{copy.hero.edition}</p>
                <button
                  type="button"
                  className="anicca-change"
                  aria-expanded={chooserOpen}
                  aria-controls="hero-inscriptions"
                  onClick={() => setChooserOpen((open) => !open)}
                >
                  {chooserOpen ? copy.hero.closeInscription : copy.hero.changeInscription}
                </button>
              </div>
              {chooserOpen ? (
                <div id="hero-inscriptions">
                  <AniccaVariantPicker
                    selectedId={variant.id}
                    locale={locale}
                    onSelect={(next) => selectVariant(next, true)}
                  />
                </div>
              ) : null}
              <CheckoutAction
                selected={variant}
                label={ctaLabel}
                soldOut={copy.choice.soldOut}
                noteId={describedBy}
                onBlocked={onBlocked}
              />
              {checkoutNote ? (
                <p id={noteId} className="anicca-notice" role="status">
                  {checkoutNote}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <section className="anicca-section anicca-life" aria-labelledby="life-title">
          <h2 id="life-title">{copy.life.headline}</h2>
          <p className="anicca-prose">{copy.life.body}</p>
          <ul className="anicca-life-grid">
            {ANICCA_LIFE_IMAGES.map((item, index) => (
              <li key={item.src}>
                <figure className="anicca-frame">
                  <Media
                    src={item.src}
                    alt={copy.life.imageAlts[index] ?? item.alt}
                    sizes={
                      index === 0
                        ? "(max-width: 720px) 100vw, 720px"
                        : "(max-width: 720px) 50vw, 360px"
                    }
                  />
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section className="anicca-section anicca-meaning" aria-labelledby="meaning-title">
          <h2 id="meaning-title">{meaning.headline}</h2>
          <p className="anicca-gloss">{meaning.gloss}</p>
          <p className="anicca-prose">{meaning.body}</p>
        </section>

        <section className="anicca-section anicca-arrives" aria-labelledby="arrives-title">
          <h2 id="arrives-title">{copy.arrives.headline}</h2>
          <ul className="anicca-list">
            {copy.arrives.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="anicca-material">{copy.arrives.material}</p>
          <div className="anicca-buy anicca-buy--inline">
            <CheckoutAction
              selected={variant}
              label={ctaLabel}
              soldOut={copy.choice.soldOut}
              noteId={describedBy}
              onBlocked={onBlocked}
            />
          </div>
        </section>

        <section className="anicca-section anicca-origin" aria-labelledby="origin-title">
          <h2 id="origin-title">{copy.origin.headline}</h2>
          {copy.origin.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="anicca-prose">
              {paragraph}
            </p>
          ))}
          <blockquote className="anicca-pull">
            <p>{copy.origin.pull}</p>
          </blockquote>
        </section>

        <section className="anicca-section anicca-final" aria-labelledby="final-title">
          <h2 id="final-title">{copy.finalCta.headline}</h2>
          <div className="anicca-buy">
            <AniccaVariantPicker
              selectedId={variant.id}
              locale={locale}
              onSelect={(next) => selectVariant(next)}
            />
            <p className="anicca-price anicca-price--compact">{price}</p>
            <CheckoutAction
              selected={variant}
              label={ctaLabel}
              soldOut={copy.choice.soldOut}
              noteId={describedBy}
              onBlocked={onBlocked}
            />
            {checkoutNote ? (
              <p className="anicca-notice" role="status">
                {checkoutNote}
              </p>
            ) : null}
            <p className="anicca-meta">{copy.finalCta.support}</p>
            <p className="anicca-meta">{copy.finalCta.tracked}</p>
          </div>
        </section>

        <section className="anicca-section anicca-faq" aria-labelledby="faq-title">
          <h2 id="faq-title">{copy.faq.headline}</h2>
          {copy.faq.items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>
                {item.a}
                {item.href ? (
                  <>
                    {" "}
                    <Link href={item.href}>{item.hrefLabel}</Link>
                  </>
                ) : null}
              </p>
            </details>
          ))}
          <div className="anicca-trust">
            <p>{copy.trust.independent}</p>
            <p>
              {copy.trust.contact}:{" "}
              <a href={`mailto:${ANICCA_CONTACT_EMAIL}`}>{ANICCA_CONTACT_EMAIL}</a>
              {" · "}
              <Link href="/contact">{copy.trust.contactPage}</Link>
              {" · "}
              <Link href={ANICCA_SHIPPING_RETURNS_PATH}>{copy.trust.shippingLink}</Link>
            </p>
            <p>{copy.trust.privacyNote}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
