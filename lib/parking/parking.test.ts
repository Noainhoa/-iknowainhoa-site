import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMonthRangeLabel,
  formatParkingDate,
  getParkingCopy,
  PRICE_DASH,
} from "./i18n";
import {
  buildWhatsAppMessage,
  countInclusiveDays,
  isDateUnavailable,
  rangeContainsUnavailable,
  whatsAppHref,
  type ParkingUnavailableRange,
} from "./types";

describe("parking i18n", () => {
  it("returns Spanish copy by default dictionary", () => {
    const t = getParkingCopy("es");
    assert.equal(t.title, "Parking privado en el centro de Guardamar");
    assert.equal(t.whatsappCta, "Solicitar por WhatsApp");
    assert.equal(t.priceColSeason, "Temporada");
    assert.ok(t.weekdays.includes("Lun"));
  });

  it("returns English copy", () => {
    const t = getParkingCopy("en");
    assert.equal(t.title, "Private parking in central Guardamar");
    assert.equal(t.whatsappCta, "Enquire through WhatsApp");
    assert.equal(t.priceColQuincena, "Fortnight");
    assert.ok(t.weekdays.includes("Mon"));
  });

  it("formats Spanish and British dates", () => {
    assert.match(formatParkingDate("2026-07-25", "es"), /25.*julio.*2026/i);
    assert.match(formatParkingDate("2026-07-25", "en"), /25.*July.*2026/i);
  });

  it("includes year in month range labels", () => {
    const start = new Date(2026, 6, 1);
    const end = new Date(2026, 8, 1);
    assert.match(formatMonthRangeLabel(start, end, "es"), /2026/);
    assert.match(formatMonthRangeLabel(start, end, "en"), /2026/);
  });

  it("keeps dash for unavailable price cells", () => {
    const row = getParkingCopy("es").priceRows[0];
    assert.equal(row.quincena, PRICE_DASH);
    assert.equal(row.month, PRICE_DASH);
  });
});

describe("parking availability rules", () => {
  const ranges: ParkingUnavailableRange[] = [
    {
      id: "1",
      start_date: "2026-08-10",
      end_date: "2026-08-15",
      availability: "unavailable",
    },
  ];

  it("treats occupied days as unavailable and checkout day as free", () => {
    assert.equal(isDateUnavailable("2026-08-10", ranges), true);
    assert.equal(isDateUnavailable("2026-08-14", ranges), true);
    assert.equal(isDateUnavailable("2026-08-15", ranges), false);
  });

  it("rejects ranges that cross unavailable dates", () => {
    assert.equal(
      rangeContainsUnavailable("2026-08-09", "2026-08-12", ranges),
      true
    );
    assert.equal(
      rangeContainsUnavailable("2026-08-15", "2026-08-18", ranges),
      false
    );
  });

  it("counts inclusive duration including same-day", () => {
    assert.equal(countInclusiveDays("2026-07-25", "2026-07-25"), 1);
    assert.equal(countInclusiveDays("2026-07-25", "2026-07-27"), 3);
  });
});

describe("WhatsApp message", () => {
  it("builds Spanish message with long dates and placeholders", () => {
    const msg = buildWhatsAppMessage({
      locale: "es",
      arrival: "2026-07-25",
      departure: "2026-07-27",
      name: "Ana",
    });
    assert.match(msg, /Hola, Ainhoa/);
    assert.match(msg, /Entrada:.*25.*julio.*2026/i);
    assert.match(msg, /Duración: 3 días/);
    assert.match(msg, /Matrícula: No indicada/);
    assert.match(msg, /no queda confirmada/);
    assert.doesNotMatch(msg, /\d{2}\/\d{2}\/\d{2}/);
  });

  it("builds English message and uppercases registration", () => {
    const msg = buildWhatsAppMessage({
      locale: "en",
      arrival: "2026-07-25",
      departure: "2026-07-26",
      name: "Sam",
      registration: "abc 123",
      vehicle: "Golf",
      comments: "Evening arrival",
    });
    assert.match(msg, /Hello Ainhoa/);
    assert.match(msg, /Arrival:.*25.*July.*2026/i);
    assert.match(msg, /Vehicle registration: ABC 123/);
    assert.match(msg, /not confirmed until you reply/i);
  });

  it("URL-encodes WhatsApp href", () => {
    const href = whatsAppHref("Hola Ainhoa\nEntrada: 25");
    assert.match(href, /whatsapp/);
    assert.match(href, /text=/);
    assert.ok(href.includes(encodeURIComponent("Hola Ainhoa")));
  });
});
