"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TechBrandLink } from "@/components/tech/TechBrandLink";
import TechBookingCalendar, {
  type CalendarSelection,
  type CalendarSession,
} from "@/components/tech/TechBookingCalendar";
import type { SessionLanguage } from "@/lib/tech/calendar";
import TechContactLinks from "@/components/tech/TechContactLinks";
import TechTestimonials from "@/components/tech/TechTestimonials";
import {
  IconCalendar,
  IconClock,
  IconPhone,
  TopicIcon,
} from "@/components/tech/TechIllustrations";
import WhatsAppMark from "@/components/tech/WhatsAppMark";
import { externalAnchorProps } from "@/lib/links";
import { GROUP_PRICE_CENTS, INDIVIDUAL_PRICE_CENTS, TECH_PATH } from "@/lib/tech/constants";
import { site, siteWhatsAppEnquiryHref } from "@/lib/site";
import { formatNationalPhone, telHref } from "@/lib/tech/phone";
import type { TechCopy } from "@/lib/tech/i18n";
import type { TechLocale } from "@/lib/tech/locale";
import { buildIcs } from "@/lib/tech/ics";
import { customerWhatsAppText, euros } from "@/lib/tech/messages";
import { techConditionsHref, techPageHref } from "@/lib/tech/seo";
import { readSource } from "@/lib/tech/validate";
import { formatMadrid, madridLocalToUtc } from "@/lib/tech/time";
import { newIdempotencyKey } from "@/lib/tech/idempotency";

const HERO_FAQ_ART: Record<TechLocale, string> = {
  es: "/images/tech/everyday-faqs-es.png",
  en: "/images/tech/everyday-faqs-en.png",
  nl: "/images/tech/everyday-faqs-nl.png",
};

type Kind = "group" | "individual" | "request";

type Success = {
  title: string;
  reference: string;
  when: string;
  price: string;
  where: string;
  path: string | null;
  kind: "group" | "individual" | "request";
  startsAt: string;
  durationMinutes: number;
  replayed: boolean;
};

const TIMES = Array.from({ length: 20 }, (_, index) => {
  const minutes = 9 * 60 + index * 30;
  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
});

function todayMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function TechPublicApp({
  locale,
  copy,
}: {
  locale: TechLocale;
  copy: TechCopy;
}) {
  const searchParams = useSearchParams();
  function langHref(next: TechLocale) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    return `${TECH_PATH}?${params.toString()}`;
  }
  const [kind, setKind] = useState<Kind>("group");
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [templateReady, setTemplateReady] = useState(false);
  const [bookableStarts, setBookableStarts] = useState<string[]>([]);
  const [nextJoinableGroup, setNextJoinableGroup] = useState<CalendarSession | null>(null);
  const [weekSlotCounts, setWeekSlotCounts] = useState<Record<string, number>>({});
  const [dayOpenMinute, setDayOpenMinute] = useState(540);
  const [dayCloseMinute, setDayCloseMinute] = useState(1080);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error" | "off">("loading");
  const [selection, setSelection] = useState<CalendarSelection | null>(null);
  const [date, setDate] = useState(todayMadrid);
  const [time, setTime] = useState("10:00");
  const [contactName, setContactName] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [forOther, setForOther] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [sessionLanguage, setSessionLanguage] = useState<SessionLanguage>(locale === "en" ? "en" : "es");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [company, setCompany] = useState("");
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const idempotency = useRef(newIdempotencyKey());
  const successRef = useRef<HTMLHeadingElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);
  const [barHidden, setBarHidden] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const phoneDisplay = formatNationalPhone();

  function closeNav() {
    setNavOpen(false);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSource(readSource(params.get("src")));
    let cancelled = false;
    fetch("/api/tech/availability")
      .then(async (response) => {
        // 503 = booking backend not configured in this environment (not “no sessions”).
        if (response.status === 503) {
          if (!cancelled) setLoadState("off");
          return;
        }
        let payload: {
          ok?: boolean;
          templateReady?: boolean;
          settings?: { dayOpenMinute?: number; dayCloseMinute?: number; bufferMinutes?: number };
          sessions?: CalendarSession[];
          bookableStarts?: string[];
          nextJoinableGroup?: CalendarSession | null;
          weekSlotCounts?: Record<string, number>;
          error?: string;
        } | null = null;
        try {
          payload = await response.json();
        } catch {
          throw new Error("network");
        }
        // Any other failure is a real load/connection/backend problem — not emptiness.
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "tech_failed");
        }
        if (!cancelled) {
          setTemplateReady(payload.templateReady === true);
          setSessions(payload.sessions ?? []);
          setBookableStarts(payload.bookableStarts ?? []);
          setNextJoinableGroup(payload.nextJoinableGroup ?? null);
          setWeekSlotCounts(payload.weekSlotCounts ?? {});
          setDayOpenMinute(payload.settings?.dayOpenMinute ?? 540);
          setDayCloseMinute(payload.settings?.dayCloseMinute ?? 1080);
          setLoadState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    idempotency.current = newIdempotencyKey();
  }, [kind, selection, date, time]);

  useEffect(() => {
    successRef.current?.focus();
  }, [success]);

  useEffect(() => {
    const node = bookingRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setBarHidden(entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [success]);

  function openBooking(next: "group" | "individual") {
    setKind(next);
    setSelection(null);
    window.setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  const bookingKind = kind === "request" ? null : kind;

  function downloadCalendar(item: Success) {
    if (item.kind === "request") return;
    const startsAt = new Date(item.startsAt);
    const endsAt = new Date(startsAt.getTime() + item.durationMinutes * 60 * 1000);
    const ics = buildIcs({
      reference: item.reference,
      title: copy.brandName,
      startsAt,
      endsAt,
      location: item.where,
      description: `${copy.reference} ${item.reference}`,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guardamar-click-${item.reference}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    const endpoint = kind === "request" ? "/api/tech/request" : "/api/tech/book";
    let requestedStart: string | undefined;
    if (kind === "request") {
      try {
        requestedStart = madridLocalToUtc(date, time).toISOString();
      } catch {
        setSaving(false);
        setError("tech_failed");
        return;
      }
    }
    try {
      const bookPayload =
        kind === "request"
          ? { requestedStart }
          : selection?.mode === "join"
            ? { sessionId: selection.session.id }
            : selection?.mode === "create"
              ? { startsAt: selection.startsAt, kind: selection.kind }
              : null;
      if (kind !== "request" && !bookPayload) {
        setSaving(false);
        setError("tech_failed");
        return;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookPayload,
          idempotencyKey: idempotency.current,
          contactName,
          attendeeName,
          bookingForOther: forOther,
          phone,
          email,
          question,
          acceptTerms,
          company,
          source,
          locale,
          sessionLanguage,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (payload?.ignored) {
        setSaving(false);
        return;
      }
      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "tech_failed");
        setSaving(false);
        return;
      }
      const startsAt = payload.startsAt as string;
      const when = formatMadrid(new Date(startsAt), locale);
      const where = payload.venueLabel || copy.pendingPlace;
      setSuccess({
        title: kind === "request" ? copy.requestedTitle : copy.confirmedTitle,
        reference: payload.reference,
        when,
        price: euros(payload.priceCents, locale),
        where,
        path: payload.confirmationPath,
        kind: payload.kind,
        startsAt,
        durationMinutes: payload.durationMinutes,
        replayed: payload.replayed === true,
      });
    } catch {
      setError("network");
    } finally {
      setSaving(false);
    }
  }

  const whatsappMessage = success
    ? customerWhatsAppText({
        locale,
        reference: success.reference,
        when: success.when,
        kind: success.kind,
      })
    : locale === "en"
      ? "Hello Ainhoa, I would like technology help in Guardamar."
      : locale === "nl"
        ? "Hallo Ainhoa, ik zou graag technische hulp in Guardamar willen."
        : "Hola Ainhoa, me gustaría una sesión de ayuda tecnológica en Guardamar.";

  const enquiryHref = siteWhatsAppEnquiryHref(whatsappMessage);
  const successMailHref = success
    ? `mailto:${site.email}?subject=${encodeURIComponent(`${copy.reference} ${success.reference}`)}&body=${encodeURIComponent(
        `${copy.reference} ${success.reference}\n${copy.when}: ${success.when}\n\n${whatsappMessage}`
      )}`
    : "";
  const navAria =
    locale === "en" ? "Primary" : locale === "nl" ? "Hoofdmenu" : "Principal";

  const utilities = (
    <>
      <nav id="tme-primary-nav" className="tme-nav" aria-label={navAria}>
        <a href="#ayuda" onClick={closeNav}>
          {copy.navHelp}
        </a>
        <a href="#ainhoa" onClick={closeNav}>
          {copy.navAbout}
        </a>
        <a href="#precios" onClick={closeNav}>
          {copy.navPrices}
        </a>
        <a href="#opiniones" onClick={closeNav}>
          {copy.navStories}
        </a>
        <a
          href="#reservar"
          onClick={(event) => {
            event.preventDefault();
            closeNav();
            openBooking("group");
          }}
        >
          {copy.navBook}
        </a>
      </nav>
      <div className="tme-right">
        <a className="tme-tel-header" href={telHref()}>
          <IconPhone />
          {phoneDisplay}
        </a>
        <nav className="tme-lang" aria-label={copy.langLabel}>
          <Link
            href={langHref("es")}
            hrefLang="es"
            lang="es"
            aria-current={locale === "es" ? "page" : undefined}
            prefetch={false}
          >
            ES
          </Link>
          <span className="tme-lang-sep" aria-hidden="true">
            /
          </span>
          <Link
            href={langHref("en")}
            hrefLang="en"
            lang="en"
            aria-current={locale === "en" ? "page" : undefined}
            prefetch={false}
          >
            EN
          </Link>
          <span className="tme-lang-sep" aria-hidden="true">
            /
          </span>
          <Link
            href={langHref("nl")}
            hrefLang="nl"
            lang="nl"
            aria-current={locale === "nl" ? "page" : undefined}
            prefetch={false}
          >
            NL
          </Link>
        </nav>
        <button
          type="button"
          className="tme-menu-btn"
          aria-expanded={navOpen}
          aria-controls="tme-primary-nav"
          aria-label={navOpen ? copy.navMenuClose : copy.navMenuOpen}
          onClick={() => setNavOpen((open) => !open)}
        >
          <svg className="tme-menu-icon" viewBox="0 0 28 28" aria-hidden="true" fill="none">
            {navOpen ? (
              <>
                <rect x="0" y="12.5" width="28" height="3" fill="currentColor" transform="rotate(45 14 14)" />
                <rect x="0" y="12.5" width="28" height="3" fill="currentColor" transform="rotate(-45 14 14)" />
              </>
            ) : (
              <>
                <rect x="0" y="5" width="28" height="3" fill="currentColor" />
                <rect x="0" y="12.5" width="28" height="3" fill="currentColor" />
                <rect x="0" y="20" width="28" height="3" fill="currentColor" />
              </>
            )}
          </svg>
        </button>
      </div>
    </>
  );

  const brandUnit = (
    <div className="tme-brand-block">
      <TechBrandLink href={techPageHref(locale)} name={copy.brandName} />
      <div className="tme-brand-text">
        <p className="tme-eyebrow">{copy.kicker}</p>
        <h1>
          {copy.headlineBefore} <em>{copy.headlineEm}</em> {copy.headlineAfter}
        </h1>
        <div className="tme-meta">
          {copy.metaChips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="tme">
        <div className="tme-wrap">
          <header className="tme-top tme-top-success">
            <TechBrandLink href={techPageHref(locale)} name={copy.brandName} />
          </header>
          <section className="tme-section">
            <h1 ref={successRef} tabIndex={-1}>
              {success.title}
            </h1>
            <p className="tme-eyebrow">{copy.reference}</p>
            <p className="tme-ref">{success.reference}</p>
            <div className="tme-card">
              <p>
                <strong>{copy.when}:</strong> {success.when}
              </p>
              <p>
                <strong>{copy.price}:</strong> {success.price}
              </p>
              <p>
                <strong>{copy.where}:</strong> {success.where}
              </p>
            </div>
            <p>{copy.keepScreen}</p>
            {success.path ? (
              <p>
                <a href={`${site.url}${success.path}`}>{`${site.url}${success.path}`}</a>
              </p>
            ) : (
              <p>{copy.replayed}</p>
            )}
            <p>{success.kind === "request" ? copy.requestPending : copy.cancelHelp}</p>
            <div className="tme-success-actions">
              {success.kind !== "request" ? (
                <button type="button" className="tme-secondary" onClick={() => downloadCalendar(success)}>
                  {copy.calendar}
                </button>
              ) : null}
              <button
                type="button"
                className="tme-secondary"
                onClick={() => {
                  void navigator.clipboard.writeText(whatsappMessage).catch(() => undefined);
                }}
              >
                {copy.copyWhatsApp}
              </button>
              <a className="tme-secondary" href={successMailHref}>
                {copy.copyEmail}
              </a>
              <a className="tme-btn tme-btn-wa" href={enquiryHref} {...externalAnchorProps(enquiryHref)}>
                <WhatsAppMark />
                {copy.writeWhatsApp}
              </a>
              <TechContactLinks copy={copy} message={whatsappMessage} showWhatsApp={false} />
              <button
                type="button"
                className="tme-secondary"
                onClick={() => {
                  idempotency.current = newIdempotencyKey();
                  setSuccess(null);
                }}
              >
                {copy.back}
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="tme">
      <div className="tme-wrap">
        <header className={`tme-top${navOpen ? " is-nav-open" : ""}`}>{utilities}</header>

        <div className="tme-hero">
          <div className="tme-hero-copy">
            {brandUnit}
            <p className="tme-lead">{copy.lede}</p>
            <div className="tme-ctas">
              <a
                className="tme-btn tme-btn-sun"
                href="#reservar"
                onClick={(event) => {
                  event.preventDefault();
                  openBooking("group");
                }}
              >
                <IconCalendar />
                {copy.reserveCta}
              </a>
              <a className="tme-btn tme-btn-ghost" href={telHref()}>
                <IconPhone />
                {copy.callCta}
              </a>
            </div>
          </div>
          <div className="tme-art">
            <Image
              src={HERO_FAQ_ART[locale]}
              alt={copy.heroArtAlt}
              width={841}
              height={1024}
              sizes="(max-width: 720px) 90vw, 420px"
              className="tme-art-img"
              priority
            />
          </div>
        </div>
      </div>

      <section className="tme-section" id="ayuda">
        <div className="tme-wrap">
          <div className="tme-eyebrow">{copy.topicsKicker}</div>
          <h2>
            {copy.topicsTitleBefore} <em>{copy.topicsTitleEm}</em>
          </h2>
          <div className="tme-asks">
            {copy.topics.map((topic, index) => (
              <div className="tme-ask" key={topic.title}>
                <span className="tme-ask-icon" aria-hidden="true">
                  <TopicIcon index={index} />
                </span>
                <div>
                  <b>{topic.title}</b>
                  <q>{topic.quote}</q>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tme-about" id="ainhoa">
        <div className="tme-wrap tme-about-grid">
          <div className="tme-por">
            <Image
              src="/images/tech/ainhoa-portrait-v3.jpg"
              alt={copy.portraitLabel}
              width={960}
              height={960}
              sizes="300px"
              className="tme-por-img"
              priority
            />
          </div>
          <div>
            <div className="tme-eyebrow">{copy.aboutKicker}</div>
            <h2>
              {copy.aboutTitleBefore} <em>{copy.aboutTitleEm}</em>
            </h2>
            <p>{copy.aboutBody}</p>
            <p>{copy.aboutLanguages}</p>
            <div className="tme-sign">{copy.aboutSign}</div>
          </div>
        </div>
      </section>

      <section className="tme-section" id="precios">
        <div className="tme-wrap">
          <div className="tme-eyebrow">{copy.pricesKicker}</div>
          <h2>
            {copy.pricesTitleBefore} <em>{copy.pricesTitleEm}</em>
          </h2>
          <div className="tme-plans">
            <div className="tme-plan tme-plan-g">
              <span className="tme-plan-k">{copy.groupKicker}</span>
              <h3>{copy.groupTitle}</h3>
              <div className="tme-amt">
                {euros(GROUP_PRICE_CENTS, locale)}
                <small>{copy.groupAmtNote}</small>
              </div>
              <div className="tme-dur">
                <IconClock />
                {copy.groupDuration}
              </div>
              <div className="tme-dots" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <ul>
                {copy.groupPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button type="button" className="tme-btn tme-btn-sun" onClick={() => openBooking("group")}>
                {copy.bookGroup}
              </button>
            </div>
            <div className="tme-plan tme-plan-i">
              <span className="tme-plan-k">{copy.individualKicker}</span>
              <h3>{copy.individualTitle}</h3>
              <div className="tme-amt">
                {euros(INDIVIDUAL_PRICE_CENTS, locale)}
                <small>{copy.individualAmtNote}</small>
              </div>
              <div className="tme-dur">
                <IconClock />
                {copy.individualDuration}
              </div>
              <div className="tme-dots" aria-hidden="true">
                <span />
              </div>
              <ul>
                {copy.individualPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button type="button" className="tme-btn tme-btn-teal" onClick={() => openBooking("individual")}>
                {copy.bookIndividual}
              </button>
            </div>
          </div>
        </div>
      </section>

      <TechTestimonials copy={copy} locale={locale} />

      <section className="tme-section" id="reservar" ref={bookingRef} style={{ paddingTop: 0 }}>
        <div className="tme-wrap tme-book">
          <div>
            <div className="tme-eyebrow">{copy.stepsKicker}</div>
            <h2>
              {copy.stepsTitleBefore} <em>{copy.stepsTitleEm}</em>
            </h2>
            <ol className="tme-steps">
              {copy.steps.map((step) => (
                <li key={step.title}>
                  <p>
                    <b>{step.title}</b>
                    <span>{step.body}</span>
                  </p>
                </li>
              ))}
            </ol>
            <div className="tme-ctas">
              <TechContactLinks
                copy={copy}
                message={whatsappMessage}
                preferCallLabel={copy.preferCallBtn}
                className="tme-ctas"
              />
            </div>
            <p className="tme-note" style={{ marginTop: 18 }}>
              {copy.placeBody}
            </p>
            <p className="tme-note">{copy.pay}</p>
          </div>

          <div className="tme-panel">
            <div className="tme-choice" role="group" aria-label={copy.choose}>
              <button
                type="button"
                aria-pressed={kind === "group"}
                onClick={() => {
                  setKind("group");
                  setSelection(null);
                }}
              >
                {copy.groupOption}
              </button>
              <button
                type="button"
                aria-pressed={kind === "individual"}
                onClick={() => {
                  setKind("individual");
                  setSelection(null);
                }}
              >
                {copy.individualOption}
              </button>
              <button
                type="button"
                aria-pressed={kind === "request"}
                onClick={() => {
                  setKind("request");
                  setSelection(null);
                }}
              >
                {copy.otherTime}
              </button>
            </div>

            <fieldset className="tme-session-lang">
              <legend>{copy.sessionLanguageLabel}</legend>
              <p className="tme-hint">{copy.sessionLanguageHelp}</p>
              <div className="tme-choice" role="group" aria-label={copy.sessionLanguageLabel}>
                <button
                  type="button"
                  aria-pressed={sessionLanguage === "es"}
                  onClick={() => {
                    setSessionLanguage("es");
                    setSelection(null);
                  }}
                >
                  {copy.sessionLanguageEs}
                </button>
                <button
                  type="button"
                  aria-pressed={sessionLanguage === "en"}
                  onClick={() => {
                    setSessionLanguage("en");
                    setSelection(null);
                  }}
                >
                  {copy.sessionLanguageEn}
                </button>
              </div>
            </fieldset>

            {kind === "request" ? <p className="tme-note">{copy.otherTimeHelp}</p> : null}

            {kind !== "request" ? (
              <div aria-busy={loadState === "loading"}>
                {loadState === "loading" ? <p>{copy.loading}</p> : null}
                {loadState === "error" ? (
                  <p className="tme-alert" role="alert">
                    {copy.loadError}
                  </p>
                ) : null}
                {loadState === "off" ? (
                  <p className="tme-alert" role="status">
                    {copy.notConfigured}
                  </p>
                ) : null}
                {loadState === "ready" && bookingKind ? (
                  <TechBookingCalendar
                    copy={copy}
                    locale={locale}
                    templateReady={templateReady}
                    sessions={sessions.filter(
                      (session) => !session.sessionLanguage || session.sessionLanguage === sessionLanguage
                    )}
                    bookableStarts={bookableStarts}
                    nextJoinableGroup={
                      nextJoinableGroup &&
                      (!nextJoinableGroup.sessionLanguage ||
                        nextJoinableGroup.sessionLanguage === sessionLanguage)
                        ? nextJoinableGroup
                        : null
                    }
                    weekSlotCounts={weekSlotCounts}
                    dayOpenMinute={dayOpenMinute}
                    dayCloseMinute={dayCloseMinute}
                    selection={selection}
                    onSelect={setSelection}
                    preferredKind={bookingKind}
                    onPreferredKind={(next) => {
                      setKind(next);
                    }}
                  />
                ) : null}
              </div>
            ) : null}

            {kind === "request" || selection ? (
              <form onSubmit={onSubmit} noValidate>
                <h3 style={{ fontSize: 22 }}>{kind === "request" ? copy.requestTitle : copy.formTitle}</h3>
                {selection?.mode === "join" ? (
                  <p className="tme-card">
                    <strong>{formatMadrid(new Date(selection.session.startsAt), locale)}</strong>
                    <br />
                    {selection.session.venueLabel}
                    <br />
                    {euros(selection.session.priceCents, locale)}
                  </p>
                ) : null}
                {selection?.mode === "create" ? (
                  <p className="tme-card">
                    <strong>{formatMadrid(new Date(selection.startsAt), locale)}</strong>
                    <br />
                    {selection.kind === "group" ? copy.groupOption : copy.individualOption}
                    <br />
                    {euros(
                      selection.kind === "group" ? GROUP_PRICE_CENTS : INDIVIDUAL_PRICE_CENTS,
                      locale
                    )}
                  </p>
                ) : null}
                {kind === "request" ? (
                  <>
                    <label htmlFor="tme-date">{copy.date}</label>
                    <input
                      id="tme-date"
                      type="date"
                      value={date}
                      min={todayMadrid()}
                      onChange={(event) => setDate(event.target.value)}
                      required
                    />
                    <label htmlFor="tme-time">{copy.time}</label>
                    <select id="tme-time" value={time} onChange={(event) => setTime(event.target.value)}>
                      {TIMES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
                <label htmlFor="tme-name">{copy.contactName}</label>
                <input
                  id="tme-name"
                  type="text"
                  autoComplete="given-name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  required
                />
                <label className="tme-check">
                  <input type="checkbox" checked={forOther} onChange={(event) => setForOther(event.target.checked)} />
                  <span>{copy.forOther}</span>
                </label>
                {forOther ? (
                  <>
                    <label htmlFor="tme-attendee">{copy.attendeeName}</label>
                    <input
                      id="tme-attendee"
                      type="text"
                      value={attendeeName}
                      onChange={(event) => setAttendeeName(event.target.value)}
                      required
                    />
                  </>
                ) : null}
                <label htmlFor="tme-phone">{copy.phone}</label>
                <input
                  id="tme-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
                <label htmlFor="tme-email">{copy.email}</label>
                <input
                  id="tme-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <p className="tme-hint">{copy.emailHint}</p>
                <label htmlFor="tme-question">{copy.question}</label>
                <textarea
                  id="tme-question"
                  maxLength={400}
                  rows={4}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                />
                <p className="tme-hint">{copy.questionHint}</p>
                <label className="tme-check">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(event) => setAcceptTerms(event.target.checked)}
                  />
                  <span>
                    {copy.termsAcceptBefore}
                    <a
                      className="tme-inline-link"
                      href={techConditionsHref(locale)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {copy.termsLinkLabel}
                    </a>
                    {copy.termsAcceptAfter}
                  </span>
                </label>
                <div className="tme-hp" aria-hidden="true">
                  <label htmlFor="tme-company">Company</label>
                  <input
                    id="tme-company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                  />
                </div>
                {error ? (
                  <p className="tme-alert" role="alert">
                    {copy.errors[error] || copy.errors.tech_failed}
                  </p>
                ) : null}
                <button className="tme-submit" type="submit" disabled={saving}>
                  {saving ? copy.saving : kind === "request" ? copy.submitRequest : copy.submitBook}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="tme-wrap">
          <div className="tme-en">
            <h3>
              {copy.englishTitle} <em>{copy.englishTitleEm}</em>
            </h3>
            <p>{copy.englishBody}</p>
          </div>
        </div>
      </section>

      <footer className="tme-contact">
        <div className="tme-wrap">
          <div className="tme-eyebrow">{copy.contactKicker}</div>
          <h2 style={{ marginBottom: 6 }}>
            {copy.contactTitleBefore} <em style={{ color: "var(--tme-sun)" }}>{copy.contactTitleEm}</em>
          </h2>
          <a className="tme-big" href={telHref()}>
            {phoneDisplay}
          </a>
          <p>{copy.contactSub}</p>
          <div className="tme-ctas">
            <a className="tme-btn tme-btn-wa" href={enquiryHref} {...externalAnchorProps(enquiryHref)}>
              <WhatsAppMark />
              {copy.writeWhatsApp}
            </a>
            <a
              className="tme-btn tme-btn-ghost"
              href="#reservar"
              onClick={(event) => {
                event.preventDefault();
                openBooking("group");
              }}
            >
              {copy.reserveCta}
            </a>
          </div>
          <div className="tme-place">{copy.placeFooter}</div>
        </div>
      </footer>

      <nav className={barHidden ? "tme-dock is-hidden" : "tme-dock"} aria-label={copy.barReserve}>
        <a className="tme-dock-c" href={telHref()}>
          <IconPhone />
          {copy.barCall}
        </a>
        <a className="tme-dock-w" href={enquiryHref} {...externalAnchorProps(enquiryHref)} aria-label={copy.whatsapp}>
          <WhatsAppMark />
          {copy.whatsapp}
        </a>
        <a
          className="tme-dock-b"
          href="#reservar"
          onClick={(event) => {
            event.preventDefault();
            bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <IconCalendar />
          {copy.barReserve}
        </a>
      </nav>
    </div>
  );
}
