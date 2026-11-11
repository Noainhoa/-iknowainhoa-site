"use client";

import { useEffect, useState } from "react";
import { TechBrandLink } from "@/components/tech/TechBrandLink";
import TechContactLinks from "@/components/tech/TechContactLinks";
import { buildIcs } from "@/lib/tech/ics";
import { getTechCopy } from "@/lib/tech/i18n";
import type { TechLocale } from "@/lib/tech/locale";
import { techPageHref } from "@/lib/tech/seo";
import { customerWhatsAppText, euros } from "@/lib/tech/messages";
import { formatMadrid } from "@/lib/tech/time";

type RecordView = {
  record: "booking" | "request";
  reference: string;
  status: string;
  attendeeName: string;
  kind: "group" | "individual";
  startsAt: string;
  durationMinutes: number;
  priceCents: number;
  venueLabel: string;
  canCancel: boolean;
};

export default function TechConfirmation({
  token,
  locale,
}: {
  token: string;
  locale: TechLocale;
}) {
  const copy = getTechCopy(locale);
  const [view, setView] = useState<RecordView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tech/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.ok) throw new Error(payload.error || "tech_not_found");
        if (!cancelled) setView(payload);
      })
      .catch(() => {
        if (!cancelled) setError("tech_not_found");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/tech/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || "tech_failed");
        return;
      }
      setDone(payload.already ? "already" : "done");
    } catch {
      setError("network");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!view || view.record !== "booking") return;
    const startsAt = new Date(view.startsAt);
    const ics = buildIcs({
      reference: view.reference,
      title: copy.brandName,
      startsAt,
      endsAt: new Date(startsAt.getTime() + view.durationMinutes * 60 * 1000),
      location: view.venueLabel || copy.pendingPlace,
      description: `${copy.reference} ${view.reference}`,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guardamar-click-${view.reference}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const when = view ? formatMadrid(new Date(view.startsAt), locale) : "";
  const message = view
    ? customerWhatsAppText({
        locale,
        reference: view.reference,
        when,
        kind: view.record === "request" ? "request" : view.kind,
      })
    : undefined;

  return (
    <main className="tme" lang={locale}>
      <div className="tme-wrap">
        <header className="tme-top">
          <TechBrandLink href={techPageHref(locale)} name={copy.brandName} />
        </header>
        <section className="tme-section" style={{ paddingTop: 12 }}>
          <h1>{copy.cancelTitle}</h1>
          {error ? (
            <p className="tme-alert" role="alert">
              {error === "tech_too_late" ? copy.tooLate : copy.errors[error] || copy.notFound}
            </p>
          ) : null}
          {done === "done" ? (
            <p className="tme-alert" role="status">
              {view?.record === "request" ? copy.requestWithdrawn : copy.cancelled}
            </p>
          ) : null}
          {done === "already" ? <p role="status">{copy.alreadyCancelled}</p> : null}
          {view && !done ? (
            <div className="tme-card">
              <p className="tme-eyebrow">{copy.reference}</p>
              <p className="tme-ref">{view.reference}</p>
              <p>{view.attendeeName}</p>
              <p>
                <strong>{copy.when}:</strong> {when}
              </p>
              <p>
                <strong>{copy.price}:</strong> {euros(view.priceCents, locale)}
              </p>
              <p>
                <strong>{copy.where}:</strong> {view.venueLabel || copy.pendingPlace}
              </p>
              {view.record === "request" && view.status === "pending" ? <p>{copy.requestPending}</p> : null}
              {view.status === "cancelled" ? <p>{copy.alreadyCancelled}</p> : null}
              {view.status === "declined" ? <p>{copy.declined}</p> : null}
              {view.record === "booking" && view.status === "confirmed" ? (
                <button type="button" className="tme-secondary" onClick={download}>
                  {copy.calendar}
                </button>
              ) : null}
              {view.status !== "cancelled" && view.status !== "declined" && view.canCancel ? (
                <button type="button" className="tme-danger" onClick={cancel} disabled={busy}>
                  {busy ? copy.cancelling : copy.cancelButton}
                </button>
              ) : null}
              {view.status !== "cancelled" && view.status !== "declined" && !view.canCancel ? (
                <p>{copy.cancelLate}</p>
              ) : null}
            </div>
          ) : null}
          <p className="tme-note" style={{ marginTop: 20 }}>
            {copy.preferCall}
          </p>
          <TechContactLinks copy={copy} message={message} />
          <p style={{ marginTop: 16 }}>
            <a className="tme-secondary" href={techPageHref(locale)}>
              {copy.back}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
