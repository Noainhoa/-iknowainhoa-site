import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMonthRangeLabel,
  formatParkingDate,
  formatShortParkingDate,
  getParkingCopy,
  PRICE_DASH,
} from "./i18n";
import {
  estimateParkingPrice,
  estimateSeasonDays,
} from "./pricing";
import {
  buildWhatsAppMessage,
  countInclusiveDays,
  isDateUnavailable,
  rangeContainsUnavailable,
  whatsAppHref,
  type ParkingUnavailableRange,
} from "./types";

describe("parking i18n", () => {
  it("returns concise Spanish copy", () => {
    const t = getParkingCopy("es");
    assert.equal(t.title, "Parking privado en Guardamar");
    assert.match(t.intro, /agosto/i);
    assert.equal(t.spaceFact, "Garaje cubierto · 4,90 m × 2,40 m");
    assert.match(t.metaTitle, /agosto/i);
    assert.equal(t.priceColSeason, "Tarifas por temporada");
    assert.equal(t.addPeriod, "Añadir estas fechas");
    assert.equal(t.multiModeOr, "Cualquiera de estas opciones (alternativas)");
    assert.equal(t.labelEstimate, "Estimación");
    assert.equal(t.whatsappCta, "Solicitar por WhatsApp");
    assert.ok(t.weekdays.includes("Lun"));
  });

  it("returns concise English copy", () => {
    const t = getParkingCopy("en");
    assert.equal(t.title, "Private parking in Guardamar");
    assert.match(t.intro, /August/i);
    assert.equal(t.addPeriod, "Add these dates");
    assert.equal(t.labelEstimate, "Estimate");
    assert.equal(t.whatsappCta, "Enquire through WhatsApp");
    assert.ok(t.weekdays.includes("Mon"));
  });

  it("keeps past label for accessible calendar cells but legend uses other states", () => {
    const es = getParkingCopy("es");
    const en = getParkingCopy("en");
    assert.equal(es.past, "Pasado");
    assert.equal(en.past, "Past");
    assert.equal(es.available, "Disponible");
    assert.equal(es.unavailable, "No disponible");
    assert.equal(es.selected, "Seleccionado");
  });

  it("formats long WhatsApp dates and short UI dates", () => {
    assert.match(formatParkingDate("2026-07-25", "es"), /25.*julio.*2026/i);
    assert.match(formatParkingDate("2026-07-25", "en"), /25.*July.*2026/i);
    assert.match(formatShortParkingDate("2026-07-25", "es"), /25.*jul.*2026/i);
    assert.match(formatShortParkingDate("2026-07-25", "en"), /25.*Jul.*2026/i);
  });

  it("includes year in month range labels without Spanish de", () => {
    const start = new Date(2026, 6, 1);
    const end = new Date(2026, 8, 1);
    assert.equal(formatMonthRangeLabel(start, end, "es"), "Julio–septiembre 2026");
    assert.equal(formatMonthRangeLabel(start, end, "en"), "July–September 2026");
    assert.equal(formatMonthRangeLabel(start, start, "es"), "Julio 2026");
  });

  it("keeps dash for unavailable price cells and unchanged amounts", () => {
    const rows = getParkingCopy("es").priceRows;
    assert.equal(rows[0].day, "€10");
    assert.equal(rows[0].week, "€70");
    assert.equal(rows[0].quincena, PRICE_DASH);
    assert.equal(rows[1].week, "€50");
    assert.equal(rows[2].quincena, "€40");
    assert.equal(rows[2].month, "€75");
  });
});

describe("parking price estimates", () => {
  it("packs June–August as weeks plus leftover days", () => {
    assert.equal(estimateSeasonDays("summer", 6), 60);
    assert.equal(estimateSeasonDays("summer", 7), 70);
    assert.equal(estimateSeasonDays("summer", 8), 80);
    assert.equal(estimateParkingPrice("2026-07-01", "2026-07-06"), 60);
    assert.equal(estimateParkingPrice("2026-07-01", "2026-07-07"), 70);
    assert.equal(estimateParkingPrice("2026-07-01", "2026-07-08"), 80);
  });

  it("uses September week units", () => {
    assert.equal(estimateSeasonDays("september", 3), 50);
    assert.equal(estimateSeasonDays("september", 7), 50);
    assert.equal(estimateSeasonDays("september", 8), 100);
    assert.equal(estimateParkingPrice("2026-09-01", "2026-09-03"), 50);
  });

  it("packs October–May with months and fortnights", () => {
    assert.equal(estimateSeasonDays("winter", 14), 40);
    assert.equal(estimateSeasonDays("winter", 30), 75);
    assert.equal(estimateSeasonDays("winter", 7), 40);
    assert.equal(estimateParkingPrice("2026-11-01", "2026-11-14"), 40);
  });

  it("sums cross-season stays", () => {
    // 30–31 Aug + 1–2 Sep = 2 summer days + 2 september days
    assert.equal(estimateParkingPrice("2026-08-30", "2026-09-02"), 20 + 50);
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
  it("builds Spanish message with estimate after duration", () => {
    const msg = buildWhatsAppMessage({
      locale: "es",
      periods: [{ arrival: "2026-07-25", departure: "2026-07-27" }],
      mode: "single",
      name: "Ana",
    });
    assert.match(msg, /Hola, Ainhoa/);
    assert.match(msg, /Entrada:.*25.*julio.*2026/i);
    assert.match(msg, /Duración: 3 días/);
    assert.match(msg, /Estimación: €30/);
    assert.match(msg, /Matrícula: No indicada/);
    assert.match(msg, /no queda confirmada/);
  });

  it("maps registration and vehicle model into the English message", () => {
    const msg = buildWhatsAppMessage({
      locale: "en",
      periods: [{ arrival: "2026-07-25", departure: "2026-07-26" }],
      mode: "single",
      name: "Sam",
      registration: "abc 123",
      vehicle: "Golf",
      comments: "Evening arrival",
    });
    assert.match(msg, /Hello Ainhoa/);
    assert.match(msg, /Duration: 2 days/);
    assert.match(msg, /Estimate: €20/);
    assert.match(msg, /Vehicle registration: ABC 123/);
    assert.match(msg, /Vehicle: Golf/);
  });

  it("builds OR alternatives with per-option estimates", () => {
    const msg = buildWhatsAppMessage({
      locale: "es",
      mode: "or",
      periods: [
        { arrival: "2026-07-01", departure: "2026-07-03" },
        { arrival: "2026-08-01", departure: "2026-08-06" },
      ],
      name: "Ana",
    });
    assert.match(msg, /Opciones alternativas/);
    assert.match(msg, /1\) Entrada:/);
    assert.match(msg, /Estimación: €30/);
    assert.match(msg, /Estimación: €60/);
    assert.doesNotMatch(msg, /Estimación total/);
  });

  it("builds AND message with total days and total estimate", () => {
    const msg = buildWhatsAppMessage({
      locale: "en",
      mode: "and",
      periods: [
        { arrival: "2026-07-01", departure: "2026-07-03" },
        { arrival: "2026-08-01", departure: "2026-08-06" },
      ],
      name: "Sam",
    });
    assert.match(msg, /I need all of these stays/);
    assert.match(msg, /Total: 9 days/);
    assert.match(msg, /Total estimate: €90/);
  });

  it("URL-encodes WhatsApp href", () => {
    const href = whatsAppHref("Hola Ainhoa\nEntrada: 25");
    assert.match(href, /whatsapp/);
    assert.match(href, /text=/);
    assert.ok(href.includes(encodeURIComponent("Hola Ainhoa")));
  });
});
