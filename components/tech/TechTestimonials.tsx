"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { TechCopy } from "@/lib/tech/i18n";
import type { TechLocale } from "@/lib/tech/locale";

type Story = {
  id: string;
  name: string;
  body: string;
  place: string | null;
};

export default function TechTestimonials({ copy, locale }: { copy: TechCopy; locale: TechLocale }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [body, setBody] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tech/testimonials")
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { testimonials?: Story[] };
        if (!cancelled) setStories(payload.testimonials ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/tech/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, place, body, consent, website, locale }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; ignored?: boolean } | null;
      if (payload?.ignored) return;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "tech_failed");
        return;
      }
      setSent(true);
      setName("");
      setPlace("");
      setBody("");
      setConsent(false);
    } catch {
      setError("network");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="tme-section" id="opiniones">
      <div className="tme-wrap">
        <div className="tme-eyebrow">{copy.storiesKicker}</div>
        <h2>
          {copy.storiesTitleBefore} <em>{copy.storiesTitleEm}</em>
        </h2>
        <p className="tme-stories-lead">{copy.storiesLead}</p>
        {stories.length === 0 ? <p className="tme-note">{copy.storiesEmpty}</p> : null}
        {stories.length > 0 ? (
          <div className="tme-stories">
            {stories.map((story) => (
              <blockquote className="tme-story" key={story.id}>
                <p>{story.body}</p>
                <footer>
                  <cite>{story.name}</cite>
                  {story.place ? <span>{story.place}</span> : null}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : null}

        <form className="tme-panel tme-story-form" onSubmit={onSubmit}>
          <h3>{copy.storiesFormTitle}</h3>
          {sent ? (
            <p className="tme-story-thanks" role="status">
              <strong>{copy.storiesThanks}</strong>
              {copy.storiesThanksBody}
            </p>
          ) : null}
          <label htmlFor="tme-story-name">{copy.storiesName}</label>
          <input
            id="tme-story-name"
            type="text"
            autoComplete="name"
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <label htmlFor="tme-story-place">{copy.storiesPlace}</label>
          <input
            id="tme-story-place"
            type="text"
            maxLength={80}
            value={place}
            onChange={(event) => setPlace(event.target.value)}
          />
          <label htmlFor="tme-story-body">{copy.storiesBody}</label>
          <textarea
            id="tme-story-body"
            maxLength={400}
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
          />
          <label className="tme-check">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>{copy.storiesConsent}</span>
          </label>
          <div className="tme-hp" aria-hidden="true">
            <label htmlFor="tme-story-website">Website</label>
            <input
              id="tme-story-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
          {error ? (
            <p className="tme-alert" role="alert">
              {copy.errors[error] || copy.errors.tech_failed}
            </p>
          ) : null}
          <button className="tme-submit" type="submit" disabled={saving}>
            {saving ? copy.saving : copy.storiesSubmit}
          </button>
        </form>
      </div>
    </section>
  );
}
