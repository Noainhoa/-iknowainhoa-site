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
    assert.equal(t.title, "Parking privado en el centro de Guardamar");
    assert.match(t.intro, /agosto/i);
    assert.equal(t.spaceWidth, "Ancho: 240 cm");
    assert.equal(t.spaceLength, "Largo: 490 cm");
    assert.match(t.metaTitle, /agosto/i);
    assert.equal(t.pricesTitle, "Tarifas");
    assert.equal(t.pricesSupport, "Elige tus fechas para consultar la tarifa.");
    assert.equal(t.pricesDisclaimer, "Precio final sujeto a confirmación.");
    assert.equal(t.vehicle, "Modelo");
    assert.equal(t.vehiclePlaceholder, "Opcional");
    assert.equal(t.commentsPlaceholder, "Horario de llegada, dudas…");
    assert.equal(t.announceCleared, "Selección de fechas eliminada.");
    assert.equal(t.changeDates, "Cambiar fechas");
    assert.equal(t.whatsappCta, "Solicitar por WhatsApp");
    assert.equal(t.whatsappSentTitle, "Mensaje enviado");
    assert.ok(t.weekdays.includes("Lun"));
  });

  it("returns concise English copy", () => {
    const t = getParkingCopy("en");
    assert.equal(t.title, "Private parking in central Guardamar");
    assert.match(t.intro, /August/i);
    assert.equal(t.spaceWidth, "Width: 240 cm");
    assert.match(t.metaTitle, /August/i);
    assert.equal(t.pricesTitle, "Prices");
    assert.equal(t.pricesSupport, "Select your dates to check the rate.");
    assert.equal(t.pricesDisclaimer, "Final price subject to confirmation.");
    assert.equal(t.registration, "Registration");
    assert.equal(t.vehicle, "Vehicle model");
    assert.equal(t.changeDates, "Change dates");
    assert.equal(t.announceCleared, "Date selection cleared.");
    assert.equal(t.whatsappCta, "Enquire through WhatsApp");
    assert.equal(t.whatsappSentTitle, "Message sent");
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

  it("maps registration and vehicle model into the English message", () => {
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
    assert.match(msg, /Vehicle registration: ABC 123/);
    assert.match(msg, /Vehicle: Golf/);
    assert.match(msg, /not confirmed until you reply/i);
  });

  it("URL-encodes WhatsApp href", () => {
    const href = whatsAppHref("Hola Ainhoa\nEntrada: 25");
    assert.match(href, /whatsapp/);
    assert.match(href, /text=/);
    assert.ok(href.includes(encodeURIComponent("Hola Ainhoa")));
  });
});
