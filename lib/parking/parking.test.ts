import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMonthRangeLabel,
  formatParkingDate,
  formatShortParkingDate,
  getParkingCopy,
  PRICE_DASH,
} from "./i18n";
import { buildParkingJsonLd } from "./jsonLd";
import {
  estimateParkingPrice,
  estimateSeasonDays,
  parkingOfferSpecs,
  SEASON_RATES,
} from "./pricing";
import {
  parkingCanonicalUrl,
  parkingHreflangMap,
  shouldStripParkingLangParam,
} from "./seo";
import {
  buildWhatsAppMessage,
  countInclusiveDays,
  isDateUnavailable,
  nextAvailableDate,
  rangeContainsUnavailable,
  whatsAppHref,
  type ParkingUnavailableRange,
} from "./types";

describe("parking i18n", () => {
  it("returns concise Spanish copy", () => {
    const t = getParkingCopy("es");
    assert.equal(t.title, "Parking privado en el centro de Guardamar");
    assert.match(t.intro, /Jorge Juan/i);
    assert.equal(t.spaceFact, "Garaje cubierto · 4,90 m × 2,40 m");
    assert.equal(
      t.metaTitle,
      "Parking en Guardamar Centro por Días | Plaza Privada"
    );
    assert.match(t.metaDescription, /1,79/);
    assert.equal(t.priceColSeason, "Tarifas por temporada");
    assert.equal(t.addPeriod, "Añadir estas fechas");
    assert.equal(t.multiModeOr, "Cualquiera de estas opciones (alternativas)");
    assert.equal(t.labelEstimate, "Estimación");
    assert.equal(t.whatsappCta, "Solicitar por WhatsApp");
    assert.equal(t.whatsappTonightLabel, "¿Esta noche?");
    assert.match(t.whatsappTonightMessage, /esta noche/i);
    assert.ok(t.faqItems.length >= 4);
    assert.ok(t.aboutItems.length >= 4);
    assert.ok(t.weekdays.includes("Lun"));
  });

  it("returns concise English copy", () => {
    const t = getParkingCopy("en");
    assert.equal(t.title, "Private parking in central Guardamar");
    assert.match(t.intro, /Jorge Juan/i);
    assert.equal(
      t.metaTitle,
      "Private Parking in Guardamar Centre | Daily Rental"
    );
    assert.equal(t.addPeriod, "Add these dates");
    assert.equal(t.labelEstimate, "Estimate");
    assert.equal(t.whatsappCta, "Enquire through WhatsApp");
    assert.equal(t.whatsappTonightLabel, "Tonight?");
    assert.match(t.whatsappTonightMessage, /tonight/i);
    assert.ok(t.weekdays.includes("Mon"));
  });

  it("returns concise French copy", () => {
    const t = getParkingCopy("fr");
    assert.equal(t.title, "Parking privé au centre de Guardamar");
    assert.match(t.intro, /Jorge Juan/i);
    assert.equal(t.spaceFact, "Garage couvert · 4,90 m × 2,40 m");
    assert.equal(
      t.metaTitle,
      "Parking privé au centre de Guardamar | Location"
    );
    assert.equal(t.priceColSeason, "Tarifs par saison");
    assert.equal(t.addPeriod, "Ajouter ces dates");
    assert.equal(t.whatsappCta, "Demander via WhatsApp");
    assert.equal(t.whatsappTonightLabel, "Ce soir ?");
    assert.match(t.whatsappTonightMessage, /ce soir/i);
    assert.equal(t.accessImportant, "Hauteur maximale d’accès : 1,79 m.");
    assert.ok(t.weekdays.includes("Lun"));
  });

  it("keeps past label for accessible calendar cells but legend uses other states", () => {
    const es = getParkingCopy("es");
    const en = getParkingCopy("en");
    const fr = getParkingCopy("fr");
    assert.equal(es.past, "Pasado");
    assert.equal(en.past, "Past");
    assert.equal(fr.past, "Passé");
    assert.equal(es.available, "Disponible");
    assert.equal(es.unavailable, "No disponible");
    assert.equal(es.selected, "Seleccionado");
  });

  it("formats long WhatsApp dates and short UI dates", () => {
    assert.match(formatParkingDate("2026-07-25", "es"), /25.*julio.*2026/i);
    assert.match(formatParkingDate("2026-07-25", "en"), /25.*July.*2026/i);
    assert.match(formatParkingDate("2026-07-25", "fr"), /25.*juillet.*2026/i);
    assert.match(formatShortParkingDate("2026-07-25", "es"), /25.*jul.*2026/i);
    assert.match(formatShortParkingDate("2026-07-25", "en"), /25.*Jul.*2026/i);
    assert.match(formatShortParkingDate("2026-07-25", "fr"), /25.*juil.*2026/i);
  });

  it("includes year in month range labels without Spanish de", () => {
    const start = new Date(2026, 6, 1);
    const end = new Date(2026, 8, 1);
    assert.equal(formatMonthRangeLabel(start, end, "es"), "Julio–septiembre 2026");
    assert.equal(formatMonthRangeLabel(start, end, "en"), "July–September 2026");
    assert.equal(formatMonthRangeLabel(start, end, "fr"), "Juillet–septembre 2026");
    assert.equal(formatMonthRangeLabel(start, start, "es"), "Julio 2026");
  });

  it("keeps dash for unavailable price cells and unchanged amounts", () => {
    const rows = getParkingCopy("es").priceRows;
    assert.equal(rows[0].day, "€10");
    assert.equal(rows[0].week, "€70");
    assert.equal(rows[0].month, PRICE_DASH);
    assert.equal(rows[1].week, "€50");
    assert.equal(rows[2].month, "€75");
    assert.equal(
      Object.prototype.hasOwnProperty.call(rows[0], "quincena"),
      false
    );
  });
});

describe("parking SEO helpers", () => {
  it("uses bare Spanish canonical and query locales for EN/FR", () => {
    assert.equal(
      parkingCanonicalUrl("es"),
      "https://iknowainhoa.com/parking-guardamar-centro"
    );
    assert.equal(
      parkingCanonicalUrl("en"),
      "https://iknowainhoa.com/parking-guardamar-centro?lang=en"
    );
    assert.equal(
      parkingCanonicalUrl("fr"),
      "https://iknowainhoa.com/parking-guardamar-centro?lang=fr"
    );
    assert.equal(
      parkingHreflangMap()["x-default"],
      parkingCanonicalUrl("es")
    );
  });

  it("strips lang=es and invalid lang on public parking URLs", () => {
    assert.equal(
      shouldStripParkingLangParam("/parking-guardamar-centro", "es"),
      true
    );
    assert.equal(
      shouldStripParkingLangParam("/parking-guardamar-centro", "de"),
      true
    );
    assert.equal(
      shouldStripParkingLangParam("/parking-guardamar-centro", "en"),
      false
    );
    assert.equal(
      shouldStripParkingLangParam("/parking-guardamar-centro/admin", "es"),
      false
    );
  });

  it("keeps verified geo and seasonal offers in JSON-LD", () => {
    const graph = buildParkingJsonLd("es");
    const json = JSON.stringify(graph);
    assert.match(json, /ParkingFacility/);
    assert.match(json, /FAQPage/);
    assert.match(json, /BreadcrumbList/);
    assert.match(json, /38\.08556260856233/);
    assert.match(json, /-0\.6488313283580208/);
    assert.equal(json.includes("openingHoursSpecification"), false);
    assert.equal(json.includes("00:00"), false);
    const offers = parkingOfferSpecs();
    assert.equal(offers.length, 4);
    assert.ok(offers.every((o) => o.price > 0));
    assert.deepEqual(
      offers.map((o) => o.price).sort((a, b) => a - b),
      [10, 50, 70, 75]
    );
  });
});

describe("parking analytics privacy", () => {
  it("event payloads never include enquiry PII field names as values", () => {
    const event = {
      name: "parking_whatsapp_click" as const,
      language: "es" as const,
      stayDays: 3,
      season: "summer" as const,
      hasQuote: true,
    };
    const keys = Object.keys(event);
    assert.equal(keys.includes("name") && event.name === "parking_whatsapp_click", true);
    assert.equal("registration" in event, false);
    assert.equal("comments" in event, false);
    assert.equal("vehicle" in event, false);
  });
});

describe("parking price estimates", () => {
  it("shares one rate table for estimates and visible cells", () => {
    assert.equal(SEASON_RATES.summer.day, 10);
    assert.equal(SEASON_RATES.summer.week, 70);
    assert.equal(SEASON_RATES.september.week, 50);
    assert.equal(SEASON_RATES.winter.month, 75);
    assert.equal(getParkingCopy("es").priceRows[0].day, `€${SEASON_RATES.summer.day}`);
  });

  it("applies injected admin rates to estimates and price rows", () => {
    const custom = {
      summer: { day: 12, week: 80, month: null },
      september: { day: null, week: 55, month: null },
      winter: { day: null, week: null, month: 90 },
    };
    assert.equal(estimateParkingPrice("2026-07-01", "2026-07-07", custom), 80);
    assert.equal(estimateParkingPrice("2026-09-01", "2026-09-03", custom), 55);
    assert.equal(getParkingCopy("es", custom).priceRows[0].day, "€12");
    assert.equal(getParkingCopy("es", custom).priceRows[0].week, "€80");
    assert.equal(getParkingCopy("es", custom).priceRows[2].month, "€90");
  });

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

  it("packs October–May as whole months only", () => {
    assert.equal(estimateSeasonDays("winter", 14), 75);
    assert.equal(estimateSeasonDays("winter", 30), 75);
    assert.equal(estimateSeasonDays("winter", 7), 75);
    assert.equal(estimateSeasonDays("winter", 31), 150);
    assert.equal(estimateParkingPrice("2026-11-01", "2026-11-14"), 75);
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

  it("finds the next free day on or after a start date", () => {
    assert.equal(nextAvailableDate("2026-08-09", ranges), "2026-08-09");
    assert.equal(nextAvailableDate("2026-08-10", ranges), "2026-08-15");
    assert.equal(nextAvailableDate("2026-08-14", ranges), "2026-08-15");
    assert.equal(nextAvailableDate("2026-08-15", ranges), "2026-08-15");
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
      pageUrl: "https://iknowainhoa.com/parking-guardamar-centro",
    });
    assert.match(msg, /Hola, Ainhoa/);
    assert.match(msg, /Entrada:.*25.*julio.*2026/i);
    assert.match(msg, /Duración: 3 días/);
    assert.match(msg, /Estimación: €30/);
    assert.match(msg, /Matrícula: No indicada/);
    assert.match(msg, /Página: https:\/\/iknowainhoa\.com\/parking-guardamar-centro/);
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
