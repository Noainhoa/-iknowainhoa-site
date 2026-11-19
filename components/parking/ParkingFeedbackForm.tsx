"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/shared";
import { trackParkingEvent } from "@/lib/parking/analytics";
import {
  normalizeParkingPlate,
  normalizeParkingPlateInput,
} from "@/lib/parking/plate";
import { parkingCanonicalUrl } from "@/lib/parking/seo";

export type ParkingFeedbackMood = "good" | "ok" | "problem";

export type ParkingFeedbackCopy = {
  summary: string;
  lead: string;
  moodLabel: string;
  moodGood: string;
  moodOk: string;
  moodProblem: string;
  messageLabel: string;
  messagePlaceholder: string;
  referenceLabel: string;
  referencePlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  privacy: string;
};

type Props = {
  locale: Locale;
  copy: ParkingFeedbackCopy;
};

export default function ParkingFeedbackForm({ locale, copy }: Props) {
  const [mood, setMood] = useState<ParkingFeedbackMood | "">("");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setStatus("err");
      return;
    }

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
    trackParkingEvent({
      name: "parking_feedback_submit",
      language: locale,
      hasMood: Boolean(mood),
      hasReference: Boolean(normalizeParkingPlate(reference)),
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
        <p className="pk-feedback-lead">{copy.lead}</p>

        <fieldset className="pk-feedback-mood">
          <legend className="pk-feedback-lab">{copy.moodLabel}</legend>
          <div className="pk-feedback-mood-row" role="group">
            {(
              [
                ["good", copy.moodGood],
                ["ok", copy.moodOk],
                ["problem", copy.moodProblem],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`pk-feedback-mood-btn${mood === value ? " is-on" : ""}`}
                aria-pressed={mood === value}
                onClick={() => setMood((current) => (current === value ? "" : value))}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="pk-feedback-field" htmlFor="pk-feedback-message">
          <span className="pk-feedback-lab">{copy.messageLabel}</span>
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

        <label className="pk-feedback-field" htmlFor="pk-feedback-reference">
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

        <p className="pk-feedback-privacy">{copy.privacy}</p>

        {status === "err" ? (
          <p className="pk-feedback-error" role="alert">
            {copy.error}
          </p>
        ) : null}

        <button
          type="submit"
          className="pk-feedback-submit"
          disabled={status === "saving" || message.trim().length < 3}
        >
          {status === "saving" ? copy.submitting : copy.submit}
        </button>
      </form>
    </details>
  );
}
