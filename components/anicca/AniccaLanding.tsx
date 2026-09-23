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
  const aboutMeaning =
    copy.meaningByVariant[pageLocale === "es" ? "anicca-es" : "anicca-en"];
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
            <div className="anicca-lead">
              <p>{copy.hero.support}</p>
              <p>{copy.hero.supportClose}</p>
            </div>

            <p className="anicca-commercial">{commercialLine}</p>

            <div className="anicca-buy" id="choose">
              <div className="anicca-current">
                <p className="anicca-current-label">{variant.selectorLabel}</p>
                <p className="anicca-current-detail">{variant.compactDetail}</p>
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
              <p className="anicca-contents">{copy.hero.contents}</p>
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

        <section className="anicca-life" aria-labelledby="life-title">
          <h2 id="life-title">{copy.life.headline}</h2>
          <ul className="anicca-life-row">
            {ANICCA_LIFE_IMAGES.map((item, index) => (
              <li key={item.src}>
                <figure className="anicca-frame">
                  <Media
                    src={item.src}
                    alt={copy.life.imageAlts[index] ?? item.alt}
                    sizes="(max-width: 720px) 42vw, 200px"
                  />
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <footer className="anicca-secondary">
          <details>
            <summary>{copy.secondary.about}</summary>
            <div className="anicca-secondary-body">
              <p className="anicca-gloss">
                {aboutMeaning.headline} · {aboutMeaning.gloss}
              </p>
              <p>{aboutMeaning.body}</p>
            </div>
          </details>

          <details>
            <summary>{copy.secondary.why}</summary>
            <div className="anicca-secondary-body">
              {copy.origin.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </details>

          <p className="anicca-secondary-link">
            <Link href={ANICCA_SHIPPING_RETURNS_PATH}>{copy.secondary.shipping}</Link>
          </p>

          <details>
            <summary>{copy.secondary.materials}</summary>
            <div className="anicca-secondary-body">
              <p>{copy.materials}</p>
            </div>
          </details>

          <details>
            <summary>{copy.secondary.faq}</summary>
            <div className="anicca-secondary-body anicca-secondary-faq">
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
            </div>
          </details>

          <p className="anicca-secondary-link">
            <Link href="/contact">{copy.secondary.contact}</Link>
            {" · "}
            <a href={`mailto:${ANICCA_CONTACT_EMAIL}`}>{ANICCA_CONTACT_EMAIL}</a>
          </p>

          <details>
            <summary>{copy.secondary.disclaimer}</summary>
            <div className="anicca-secondary-body">
              <p>{copy.trust.independent}</p>
            </div>
          </details>
        </footer>
      </div>
    </div>
  );
}
