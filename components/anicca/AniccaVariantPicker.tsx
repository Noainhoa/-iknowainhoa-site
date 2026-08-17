"use client";

import { useId } from "react";
import {
  ANICCA_VARIANTS,
  isVariantPurchasable,
  type AniccaVariant,
  type AniccaVariantId,
} from "@/lib/anicca/config";
import { getAniccaCopy } from "@/lib/anicca/copy";
import type { Locale } from "@/lib/i18n/shared";

export default function AniccaVariantPicker({
  selectedId,
  onSelect,
  labelledBy,
  locale = "en",
}: {
  selectedId: AniccaVariantId;
  onSelect: (variant: AniccaVariant) => void;
  labelledBy?: string;
  locale?: Locale;
}) {
  const copy = getAniccaCopy(locale);
  const name = useId();

  return (
    <div
      className="anicca-picker"
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : copy.a11y.selectVariant}
    >
      {ANICCA_VARIANTS.map((variant) => {
        const selected = variant.id === selectedId;
        const purchasable = isVariantPurchasable(variant);

        return (
          <label
            key={variant.id}
            className={`anicca-pick${selected ? " is-selected" : ""}${
              !purchasable ? " is-sold-out" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={variant.id}
              checked={selected}
              onChange={() => onSelect(variant)}
            />
            <span className="anicca-pick-mark" aria-hidden />
            <span className="anicca-pick-copy">
              <span className="anicca-pick-title">
                {variant.selectorLabel}{" "}
                <span className="anicca-pick-stock">
                  {purchasable ? copy.choice.remaining(variant.stock) : copy.choice.soldOut}
                </span>
              </span>
              <span className="anicca-pick-detail">{variant.selectorDetail}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
