import {
  GROUP_MINUTES,
  INDIVIDUAL_MINUTES,
  INDIVIDUAL_SHORT_MINUTES,
  priceCentsForCreate,
} from "@/lib/tech/constants";
import type { SessionLanguage } from "@/lib/tech/calendar";

export type OfferSession = {
  id: string;
  kind: "group" | "individual";
  startsAt: string;
  durationMinutes: number;
  seatsLeft: number;
  priceCents: number;
  venueLabel: string;
  sessionLanguage: SessionLanguage;
};

export type PublicOffer = {
  key: string;
  mode: "join" | "create";
  startsAt: string;
  durationMinutes: number;
  priceCents: number;
  seatsLeft: number | null;
  sessionLanguage: SessionLanguage;
  kind: "group" | "individual";
  sessionId: string | null;
  venueLabel: string | null;
};

function instant(value: string): number {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.NaN;
}

function byStart(a: PublicOffer, b: PublicOffer): number {
  return instant(a.startsAt) - instant(b.startsAt);
}

export function buildGroupOffers(args: {
  sessions: OfferSession[];
  bookableStarts: string[];
  templateReady: boolean;
  createLanguage: SessionLanguage;
  now?: Date;
}): PublicOffer[] {
  const nowMs = (args.now ?? new Date()).getTime();
  const offers: PublicOffer[] = [];

  for (const session of args.sessions) {
    if (session.kind !== "group" || session.seatsLeft <= 0) continue;
    const startMs = instant(session.startsAt);
    if (!Number.isFinite(startMs) || startMs <= nowMs) continue;
    offers.push({
      key: `join:${session.id}`,
      mode: "join",
      startsAt: session.startsAt,
      durationMinutes: session.durationMinutes,
      priceCents: session.priceCents,
      seatsLeft: session.seatsLeft,
      sessionLanguage: session.sessionLanguage,
      kind: "group",
      sessionId: session.id,
      venueLabel: session.venueLabel,
    });
  }

  if (args.templateReady) {
    const taken = new Set(offers.map((offer) => instant(offer.startsAt)));
    for (const startsAt of args.bookableStarts) {
      const startMs = instant(startsAt);
      if (!Number.isFinite(startMs) || startMs <= nowMs || taken.has(startMs)) continue;
      taken.add(startMs);
      offers.push({
        key: `create:group:${GROUP_MINUTES}:${startsAt}`,
        mode: "create",
        startsAt,
        durationMinutes: GROUP_MINUTES,
        priceCents: priceCentsForCreate("group", GROUP_MINUTES),
        seatsLeft: null,
        sessionLanguage: args.createLanguage,
        kind: "group",
        sessionId: null,
        venueLabel: null,
      });
    }
  }

  offers.sort(byStart);
  return offers;
}

export function buildPrivateOffers(args: {
  bookableStarts: string[];
  durationMinutes: typeof INDIVIDUAL_SHORT_MINUTES | typeof INDIVIDUAL_MINUTES;
  templateReady: boolean;
  createLanguage: SessionLanguage;
  now?: Date;
}): PublicOffer[] {
  if (!args.templateReady) return [];
  const nowMs = (args.now ?? new Date()).getTime();
  const offers: PublicOffer[] = [];
  const seen = new Set<number>();

  for (const startsAt of args.bookableStarts) {
    const startMs = instant(startsAt);
    if (!Number.isFinite(startMs) || startMs <= nowMs || seen.has(startMs)) continue;
    seen.add(startMs);
    offers.push({
      key: `create:individual:${args.durationMinutes}:${startsAt}`,
      mode: "create",
      startsAt,
      durationMinutes: args.durationMinutes,
      priceCents: priceCentsForCreate("individual", args.durationMinutes),
      seatsLeft: null,
      sessionLanguage: args.createLanguage,
      kind: "individual",
      sessionId: null,
      venueLabel: null,
    });
  }

  offers.sort(byStart);
  return offers;
}
