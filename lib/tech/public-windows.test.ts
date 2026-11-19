import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { madridLocalToUtc } from "./time";
import {
  filterStartsToPublicWindows,
  isShortNotice,
  isWithinPublicOfferWindow,
} from "./public-windows";

describe("public offer windows", () => {
  it("allows Tue 12–15, Thu 18–20, and Sat 10–13 only", () => {
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-24", "12:00"), 60), true);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-24", "14:00"), 60), true);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-24", "10:00"), 60), false);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-26", "18:00"), 60), true);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-26", "17:00"), 60), false);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-28", "10:00"), 60), true);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-28", "12:00"), 60), true);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-28", "13:00"), 60), false);
    assert.equal(isWithinPublicOfferWindow(madridLocalToUtc("2026-11-23", "12:00"), 60), false);
  });

  it("filters starts to those windows", () => {
    const starts = [
      madridLocalToUtc("2026-11-24", "12:00").toISOString(),
      madridLocalToUtc("2026-11-23", "12:00").toISOString(),
      madridLocalToUtc("2026-11-28", "11:00").toISOString(),
    ];
    assert.deepEqual(filterStartsToPublicWindows(starts, 60), [starts[0], starts[2]]);
  });

  it("treats under 48 hours as short notice", () => {
    const now = madridLocalToUtc("2026-11-24", "10:00");
    assert.equal(isShortNotice(madridLocalToUtc("2026-11-24", "18:00"), now), true);
    assert.equal(isShortNotice(madridLocalToUtc("2026-11-27", "10:00"), now), false);
  });
});
