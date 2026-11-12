import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  applyBusyHourToggleLocal,
  computeBookableStarts,
  hourIsWeeklyBusy,
  madridIsoWeekKey,
  nextJoinableGroup,
  planBusyHourToggle,
  rangesOverlapMinutes,
  slotHitsBusy,
  templateHourStarts,
  TEMPLATE_DAY_CLOSE_MINUTE,
  TEMPLATE_DAY_OPEN_MINUTE,
} from "./calendar";
import { madridLocalToUtc } from "./time";

const sql = readFileSync(new URL("../../supabase/tech-calendar.sql", import.meta.url), "utf8");

describe("tech hour calendar", () => {
  it("applies ±15 minute buffer around life busy blocks", () => {
    // Busy 14:00–15:00 + 15m buffer → blocked [13:45, 15:15) half-open.
    const busy = [{ weekday: 2, startMinute: 14 * 60, endMinute: 15 * 60 }];
    assert.equal(slotHitsBusy(13 * 60, 60, busy, 2, 15), true);
    assert.equal(slotHitsBusy(12 * 60 + 46, 60, busy, 2, 15), true);
    // Touches buffer start exactly → allowed (half-open).
    assert.equal(slotHitsBusy(12 * 60 + 45, 60, busy, 2, 15), false);
    assert.equal(slotHitsBusy(12 * 60 + 30, 60, busy, 2, 15), false);
    assert.equal(slotHitsBusy(15 * 60 + 15, 60, busy, 2, 15), false);
    assert.equal(rangesOverlapMinutes(0, 60, 60, 120), false);
  });

  it("returns no creatable starts when the template is disabled", () => {
    const starts = computeBookableStarts({
      settings: {
        enabled: false,
        dayOpenMinute: 9 * 60,
        dayCloseMinute: 18 * 60,
        bufferMinutes: 15,
        defaultVenueLabel: "Guardamar",
      },
      busy: [],
      closed: [],
      occupied: [],
      slotsByWeek: new Map(),
      fromDate: "2026-11-10",
      toDate: "2026-11-12",
      now: madridLocalToUtc("2026-11-01", "09:00"),
    });
    assert.deepEqual(starts, []);
  });

  it("emits hourly bookable starts inside open hours and skips busy buffers", () => {
    const starts = computeBookableStarts({
      settings: {
        enabled: true,
        dayOpenMinute: 10 * 60,
        dayCloseMinute: 13 * 60,
        bufferMinutes: 15,
        defaultVenueLabel: "Guardamar",
      },
      // Busy 12:00–13:00 + 15m buffer → 11:45–13:15 blocked; 10:00 stays free.
      busy: [{ weekday: 2, startMinute: 12 * 60, endMinute: 13 * 60 }],
      closed: [],
      occupied: [],
      slotsByWeek: new Map(),
      fromDate: "2026-11-10", // Tuesday
      toDate: "2026-11-10",
      now: madridLocalToUtc("2026-11-01", "09:00"),
    });
    assert.equal(starts.length, 1);
    assert.equal(starts[0], madridLocalToUtc("2026-11-10", "10:00").toISOString());
  });

  it("only surfaces the next joinable group, never a free creatable hour", () => {
    const next = nextJoinableGroup(
      [
        {
          id: "a",
          kind: "individual",
          startsAt: madridLocalToUtc("2026-11-10", "10:00").toISOString(),
          durationMinutes: 60,
          capacity: 1,
          seatsLeft: 1,
          priceCents: 2500,
          venueLabel: "X",
          sessionLanguage: "es",
        },
        {
          id: "b",
          kind: "group",
          startsAt: madridLocalToUtc("2026-11-11", "11:00").toISOString(),
          durationMinutes: 60,
          capacity: 7,
          seatsLeft: 3,
          priceCents: 1000,
          venueLabel: "X",
          sessionLanguage: "es",
        },
      ],
      madridLocalToUtc("2026-11-01", "09:00")
    );
    assert.equal(next?.id, "b");
    assert.equal(
      nextJoinableGroup(
        [
          {
            id: "c",
            kind: "group",
            startsAt: madridLocalToUtc("2026-11-11", "11:00").toISOString(),
            durationMinutes: 60,
            capacity: 7,
            seatsLeft: 0,
            priceCents: 1000,
            venueLabel: "X",
            sessionLanguage: "es",
          },
        ],
        madridLocalToUtc("2026-11-01", "09:00")
      ),
      null
    );
  });

  it("keeps ISO week keys stable for the weekly slot cap", () => {
    assert.match(madridIsoWeekKey(madridLocalToUtc("2026-11-03", "12:00")), /^2026-W\d{2}$/);
  });

  it("locks group capacity at seven, one-hour sessions, and weekly create cap in SQL", () => {
    assert.match(sql, /capacity BETWEEN 1 AND 7/);
    assert.match(sql, /duration_minutes = 60/);
    assert.match(sql, /duration_minutes = 30 AND price_cents = 1000/);
    assert.match(sql, /tech_create_and_book/);
    assert.match(sql, /week_count >= 3/);
    assert.match(sql, /tech_weekly_busy/);
    assert.match(sql, /buffer_minutes/);
    assert.match(sql, /tech_slot_blocked_by_life/);
  });

  it("can offer half-hour starts for 30-minute private sessions", () => {
    const starts = computeBookableStarts({
      settings: {
        enabled: true,
        dayOpenMinute: 10 * 60,
        dayCloseMinute: 11 * 60,
        bufferMinutes: 0,
        defaultVenueLabel: "X",
      },
      busy: [],
      closed: [],
      occupied: [],
      slotsByWeek: new Map(),
      fromDate: "2026-11-10",
      toDate: "2026-11-10",
      now: madridLocalToUtc("2026-11-01", "09:00"),
      durationMinutes: 30,
      stepMinutes: 30,
    });
    assert.deepEqual(
      starts,
      [
        madridLocalToUtc("2026-11-10", "10:00").toISOString(),
        madridLocalToUtc("2026-11-10", "10:30").toISOString(),
      ]
    );
  });

  it("exposes 08:00–20:00 template hours for the admin grid", () => {
    const hours = templateHourStarts();
    assert.equal(TEMPLATE_DAY_OPEN_MINUTE, 8 * 60);
    assert.equal(TEMPLATE_DAY_CLOSE_MINUTE, 20 * 60);
    assert.equal(hours[0], 8 * 60);
    assert.equal(hours[hours.length - 1], 19 * 60);
    assert.equal(hours.length, 12);
  });

  it("toggles a single hour inside a multi-hour weekly busy block", () => {
    const busy = [
      { id: "a", weekday: 3, startMinute: 13 * 60, endMinute: 15 * 60, label: "yoga" },
    ];
    assert.equal(hourIsWeeklyBusy(busy, 3, 13 * 60), true);
    assert.equal(hourIsWeeklyBusy(busy, 3, 14 * 60), true);

    const clearMid = planBusyHourToggle(busy, 3, 13 * 60);
    assert.deepEqual(clearMid.deleteIds, []);
    assert.deepEqual(clearMid.updates, [{ id: "a", startMinute: 14 * 60, endMinute: 15 * 60 }]);
    assert.deepEqual(clearMid.inserts, []);

    const afterClear = applyBusyHourToggleLocal(busy, 3, 13 * 60, () => "x");
    assert.equal(hourIsWeeklyBusy(afterClear, 3, 13 * 60), false);
    assert.equal(hourIsWeeklyBusy(afterClear, 3, 14 * 60), true);

    const afterAdd = applyBusyHourToggleLocal(afterClear, 3, 13 * 60, () => "y");
    assert.equal(hourIsWeeklyBusy(afterAdd, 3, 13 * 60), true);
  });
});
