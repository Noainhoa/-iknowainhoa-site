import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GROUP_PRICE_CENTS, INDIVIDUAL_PRICE_CENTS, INDIVIDUAL_SHORT_PRICE_CENTS } from "./constants";
import { buildGroupOffers, buildPrivateOffers, type OfferSession } from "./public-offers";

const now = new Date("2026-11-18T10:00:00.000Z");
const future = "2026-11-20T09:00:00.000Z";
const later = "2026-11-21T09:00:00.000Z";
const past = "2026-11-18T09:00:00.000Z";

function session(overrides: Partial<OfferSession> = {}): OfferSession {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    kind: "group",
    startsAt: future,
    durationMinutes: 60,
    seatsLeft: 4,
    priceCents: 1000,
    venueLabel: "Guardamar del Segura",
    sessionLanguage: "es",
    ...overrides,
  };
}

describe("public session list", () => {
  it("lists only future group sessions that still have places", () => {
    const offers = buildGroupOffers({
      now,
      templateReady: false,
      createLanguage: "es",
      bookableStarts: [later],
      sessions: [
        session(),
        session({ id: "full", seatsLeft: 0, startsAt: later }),
        session({ id: "private", kind: "individual", startsAt: later }),
        session({ id: "past", startsAt: past }),
      ],
    });

    assert.deepEqual(
      offers.map((offer) => offer.sessionId),
      ["11111111-1111-4111-8111-111111111111"]
    );
    assert.equal(offers[0]?.priceCents, 1000);
    assert.equal(offers[0]?.seatsLeft, 4);
    assert.equal(offers[0]?.mode, "join");
  });

  it("adds real open group times only when the calendar template is on", () => {
    const off = buildGroupOffers({
      now,
      templateReady: false,
      createLanguage: "en",
      bookableStarts: [later],
      sessions: [],
    });
    assert.equal(off.length, 0);

    const on = buildGroupOffers({
      now,
      templateReady: true,
      createLanguage: "en",
      bookableStarts: [later, future],
      sessions: [session()],
    });
    assert.equal(on.length, 2);
    assert.equal(on[0]?.mode, "join");
    assert.equal(on[1]?.mode, "create");
    assert.equal(on[1]?.startsAt, later);
    assert.equal(on[1]?.priceCents, GROUP_PRICE_CENTS);
    assert.equal(on[1]?.durationMinutes, 60);
    assert.equal(on[1]?.seatsLeft, null);
    assert.equal(on[1]?.sessionLanguage, "en");
  });

  it("does not invent a second group on a time that is already published", () => {
    const offers = buildGroupOffers({
      now,
      templateReady: true,
      createLanguage: "es",
      bookableStarts: [future],
      sessions: [session()],
    });
    assert.equal(offers.length, 1);
    assert.equal(offers[0]?.mode, "join");
  });

  it("prices private openings from the existing 30- and 60-minute rates", () => {
    assert.equal(
      buildPrivateOffers({
        now,
        templateReady: false,
        createLanguage: "es",
        durationMinutes: 30,
        bookableStarts: [future],
      }).length,
      0
    );

    const short = buildPrivateOffers({
      now,
      templateReady: true,
      createLanguage: "es",
      durationMinutes: 30,
      bookableStarts: [later, past, later],
    });
    assert.equal(short.length, 1);
    assert.equal(short[0]?.priceCents, INDIVIDUAL_SHORT_PRICE_CENTS);
    assert.equal(short[0]?.durationMinutes, 30);
    assert.equal(short[0]?.kind, "individual");

    const hour = buildPrivateOffers({
      now,
      templateReady: true,
      createLanguage: "es",
      durationMinutes: 60,
      bookableStarts: [future],
    });
    assert.equal(hour[0]?.priceCents, INDIVIDUAL_PRICE_CENTS);
    assert.equal(hour[0]?.sessionLanguage, "es");
  });
});
