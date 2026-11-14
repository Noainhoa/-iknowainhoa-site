"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/shared";
import { externalAnchorProps } from "@/lib/links";
import { trackParkingEvent } from "@/lib/parking/analytics";
import {
  PARKING_GOOGLE_MAPS_URL,
  PARKING_GOOGLE_REVIEWS,
  parkingGoogleQuote,
} from "@/lib/parking/googleReviews";

const ROTATE_MS = 5200;

type Props = {
  locale: Locale;
  ratingLabel: string;
  ratingAria: string;
  sourceLabel: string;
};

export default function ParkingGoogleReviews({
  locale,
  ratingLabel,
  ratingAria,
  sourceLabel,
}: Props) {
  const reviews = PARKING_GOOGLE_REVIEWS;
  const canRotate = reviews.length > 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!canRotate || paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [canRotate, paused, reviews.length]);

  if (reviews.length === 0) return null;

  const review = reviews[index] ?? reviews[0];
  const quote = parkingGoogleQuote(review, locale);
  const href = PARKING_GOOGLE_MAPS_URL;

  return (
    <a
      className={canRotate ? "pk-google is-carousel" : "pk-google"}
      href={href}
      {...externalAnchorProps(href)}
      aria-label={ratingAria}
      onClick={() => {
        trackParkingEvent({
          name: "parking_google_listing_click",
          language: locale,
        });
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="pk-google-score" aria-hidden="true">
        ★ {ratingLabel}
      </span>
      <span className="pk-google-source" aria-hidden="true">
        {sourceLabel}
      </span>
      <span className="pk-google-body" aria-live="polite">
        <span className="pk-google-slide" key={review.id}>
          <span className="pk-google-quote">“{quote}”</span>
          <span className="pk-google-author">· {review.author}</span>
        </span>
      </span>
    </a>
  );
}
