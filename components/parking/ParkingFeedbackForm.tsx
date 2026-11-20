"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/shared";
import { externalAnchorProps } from "@/lib/links";
import { trackParkingEvent } from "@/lib/parking/analytics";
import { PARKING_GOOGLE_REVIEW_URL } from "@/lib/parking/constants";
import {
  normalizeParkingPlate,
  normalizeParkingPlateInput,
} from "@/lib/parking/plate";
import { parkingCanonicalUrl } from "@/lib/parking/seo";

export type ParkingFeedbackMood = "up" | "down";

export type ParkingFeedbackCopy = {
  summary: string;
  moodLabel: string;
  moodUp: string;
  moodDown: string;
  messageLabel: string;
  messagePlaceholder: string;
  referenceLabel: string;
  referencePlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  privacyBefore: string;
  privacyLink: string;
  privacyAfter: string;
  contactAsk: string;
  contactName: string;
  contactNamePlaceholder: string;
  contactEmail: string;
  contactEmailPlaceholder: string;
  contactPhone: string;
  contactPhonePlaceholder: string;
  contactNeed: string;
};

function SendIcon() {
  return (
    <svg
      className="pk-feedback-send-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21.854 2.147-10.94 10.939"
      />
    </svg>
  );
}

function ThumbIcon({ direction }: { direction: "up" | "down" }) {
  const up = direction === "up";
  return (
    <svg
      className="pk-feedback-mood-icon"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={
          up
            ? "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
            : "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"
        }
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={up ? "M7 10v12" : "M17 14V2"}
      />
    </svg>
  );
}

type Props = {
  locale: Locale;
  copy: ParkingFeedbackCopy;
};

export default function ParkingFeedbackForm({ locale, copy }: Props) {
  const [mood, setMood] = useState<ParkingFeedbackMood | "">("");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [wantContact, setWantContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactError, setContactError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setContactError("");
      setStatus("err");
      return;
    }

    const name = contactName.trim();
    const email = contactEmail.trim();
    const phone = contactPhone.trim();
    if (wantContact && !email && !phone) {
      setContactError(copy.contactNeed);
      setStatus("err");
      return;
    }

    setContactError("");
    setStatus("saving");
    const response = await fetch("/api/parking/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: trimmed,
        mood: mood || null,
        reference: normalizeParkingPlate(reference) || null,
        locale,
        pageUrl: parkingCanonicalUrl(locale),
        contactName: wantContact ? name || null : null,
        contactEmail: wantContact ? email || null : null,
        contactPhone: wantContact ? phone || null : null,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      setStatus("err");
      trackParkingEvent({
        name: "parking_feedback_error",
        language: locale,
      });
      return;
    }

    setStatus("ok");
    setMessage("");
    setReference("");
    setMood("");
    setWantContact(false);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    trackParkingEvent({
      name: "parking_feedback_submit",
      language: locale,
      hasMood: Boolean(mood),
      hasReference: Boolean(normalizeParkingPlate(reference)),
      hasContact: wantContact,
    });
  }

  if (status === "ok") {
    return (
      <div className="pk-feedback" role="status">
        <p className="pk-feedback-success">{copy.success}</p>
      </div>
    );
  }

  return (
    <details className="pk-feedback">
      <summary className="pk-feedback-summary">
        <span className="pk-feedback-summary-icons" aria-hidden="true">
          <svg
            className="pk-feedback-summary-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            focusable="false"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 10v12"
            />
          </svg>
          <svg
            className="pk-feedback-summary-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            focusable="false"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 14V2"
            />
          </svg>
        </span>
        <span>{copy.summary}</span>
      </summary>
      <form className="pk-feedback-form" onSubmit={onSubmit} noValidate>
        <fieldset className="pk-feedback-mood">
          <legend className="sr-only">{copy.moodLabel}</legend>
          <span className="pk-feedback-lab" aria-hidden="true">
            {copy.moodLabel}
          </span>
          <div className="pk-feedback-mood-row" role="group">
            {(
              [
                ["up", copy.moodUp],
                ["down", copy.moodDown],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`pk-feedback-mood-btn pk-feedback-mood-${value}${mood === value ? " is-on" : ""}`}
                aria-pressed={mood === value}
                aria-label={label}
                onClick={() => setMood((current) => (current === value ? "" : value))}
              >
                <ThumbIcon direction={value} />
              </button>
            ))}
          </div>
        </fieldset>

        <label className="pk-feedback-field" htmlFor="pk-feedback-message">
          <span className="sr-only">{copy.messageLabel}</span>
          <textarea
            id="pk-feedback-message"
            name="feedback"
            rows={3}
            maxLength={1000}
            required
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              if (status === "err") setStatus("idle");
            }}
            placeholder={copy.messagePlaceholder}
          />
        </label>

        <label className="pk-feedback-ask">
          <input
            type="checkbox"
            checked={wantContact}
            onChange={(event) => {
              setWantContact(event.target.checked);
              if (!event.target.checked) setContactError("");
            }}
          />
          <span>{copy.contactAsk}</span>
        </label>

        {wantContact ? (
          <div className="pk-feedback-contact">
            <label className="pk-feedback-field" htmlFor="pk-feedback-name">
              <span className="pk-feedback-lab">{copy.contactName}</span>
              <input
                id="pk-feedback-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={80}
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder={copy.contactNamePlaceholder}
              />
            </label>
            <label className="pk-feedback-field" htmlFor="pk-feedback-email">
              <span className="pk-feedback-lab">{copy.contactEmail}</span>
              <input
                id="pk-feedback-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={120}
                value={contactEmail}
                onChange={(event) => {
                  setContactEmail(event.target.value);
                  if (contactError) setContactError("");
                }}
                placeholder={copy.contactEmailPlaceholder}
              />
            </label>
            <label className="pk-feedback-field" htmlFor="pk-feedback-phone">
              <span className="pk-feedback-lab">{copy.contactPhone}</span>
              <input
                id="pk-feedback-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={40}
                value={contactPhone}
                onChange={(event) => {
                  setContactPhone(event.target.value);
                  if (contactError) setContactError("");
                }}
                placeholder={copy.contactPhonePlaceholder}
              />
            </label>
          </div>
        ) : null}

        {status === "err" ? (
          <p className="pk-feedback-error" role="alert">
            {contactError || copy.error}
          </p>
        ) : null}

        <div className="pk-feedback-plate-row">
          <label className="pk-feedback-field pk-feedback-plate" htmlFor="pk-feedback-reference">
            <span className="pk-feedback-lab">{copy.referenceLabel}</span>
            <input
              id="pk-feedback-reference"
              name="reference"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={12}
              autoComplete="off"
              pattern="[A-Z0-9 ]*"
              title="A–Z, 0–9 and spaces"
              value={reference}
              onChange={(event) =>
                setReference(normalizeParkingPlateInput(event.target.value, 12))
              }
              placeholder={copy.referencePlaceholder}
            />
          </label>
          <button
            type="submit"
            className="pk-feedback-submit"
            aria-label={status === "saving" ? copy.submitting : copy.submit}
            disabled={
              status === "saving" ||
              message.trim().length < 3 ||
              (wantContact && !contactEmail.trim() && !contactPhone.trim())
            }
          >
            <SendIcon />
          </button>
        </div>

        <p className="pk-feedback-privacy">
          {copy.privacyBefore}
          <a
            href={PARKING_GOOGLE_REVIEW_URL}
            {...externalAnchorProps(PARKING_GOOGLE_REVIEW_URL)}
          >
            {copy.privacyLink}
          </a>
          {copy.privacyAfter}
        </p>
      </form>
    </details>
  );
}
