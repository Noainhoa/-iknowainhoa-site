import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HOME_TRAVEL_TOTAL_MINUTES,
  homeBlockMinutes,
  homePriceCents,
  resolveCreateTiming,
  venueLabelForMode,
} from "@/lib/tech/assistance";

describe("assistance timing", () => {
  it("keeps onsite arrival and help length", () => {
    const timing = resolveCreateTiming({
      mode: "onsite",
      arrivalAt: "2026-11-20T15:00:00.000Z",
      helpMinutes: 60,
    });
    assert.ok(timing);
    assert.equal(timing.startsAt, timing.arrivalAt);
    assert.equal(timing.durationMinutes, 60);
    assert.equal(timing.priceCents, 2500);
  });

  it("shifts home visit block and adds travel to price", () => {
    const arrival = "2026-11-20T15:00:00.000Z";
    const timing = resolveCreateTiming({
      mode: "home_visit",
      arrivalAt: arrival,
      helpMinutes: 30,
    });
    assert.ok(timing);
    assert.equal(timing.arrivalAt, new Date(arrival).toISOString());
    assert.equal(
      new Date(timing.startsAt).getTime(),
      new Date(arrival).getTime() - 30 * 60_000
    );
    assert.equal(timing.durationMinutes, homeBlockMinutes(30));
    assert.equal(timing.durationMinutes, 30 + HOME_TRAVEL_TOTAL_MINUTES);
    assert.equal(timing.priceCents, homePriceCents(30));
    assert.equal(timing.priceCents, 3000);
  });

  it("labels venues by mode", () => {
    assert.equal(venueLabelForMode("phone", "Guardamar"), "Asistencia telefónica");
    assert.match(venueLabelForMode("home_visit", "Guardamar"), /domicilio/i);
    assert.equal(venueLabelForMode("onsite", "Guardamar del Segura"), "Guardamar del Segura");
  });
});
