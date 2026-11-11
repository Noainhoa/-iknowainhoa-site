import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { buildIcs } from "./ics";
import { getTechCopy } from "./i18n";
import { resolveTechLocale } from "./locale";
import { customerBookingEmail, ownerBookingEmail, ownerRequestEmail } from "./messages";
import { normalizePhone } from "./phone";
import { parseAdminFocus, shouldStripTechLangParam, techAdminFocusUrl, techBookingManageUrl } from "./seo";
import { hashToken, isReference, newCancelToken, newReference } from "./tokens";
import {
  approvalBlocked,
  canCancelFree,
  intervalsOverlap,
  madridLocalToUtc,
  requestTimeAllowed,
  seatAvailable,
} from "./time";
import { notificationOutcome, readSource, validateBooking, validateTestimonial } from "./validate";

const sql = readFileSync(new URL("../../supabase/tech-sessions.sql", import.meta.url), "utf8");

const validInput = {
  contactName: "María",
  attendeeName: "",
  bookingForOther: false,
  phone: "+34 636 67 01 03",
  email: "",
  question: "El móvil no abre el correo",
  acceptTerms: true,
  company: "",
  source: "flyer",
  locale: "es" as const,
  sessionLanguage: "es" as const,
};

describe("tech booking rules", () => {
  it("keeps a group open until the seventh confirmed place", () => {
    assert.equal(seatAvailable(6, 7), true);
    assert.equal(seatAvailable(7, 7), false);
    assert.equal(seatAvailable(0, 1), true);
    assert.equal(seatAvailable(1, 1), false);
  });

  it("treats touching session times as free", () => {
    const group = { startMs: 0, endMs: 60 * 60 * 1000 };
    const next = { startMs: 60 * 60 * 1000, endMs: 120 * 60 * 1000 };
    assert.equal(intervalsOverlap(group, next), false);
    assert.equal(intervalsOverlap(group, { startMs: 30 * 60 * 1000, endMs: 90 * 60 * 1000 }), true);
  });

  it("blocks approval when a confirmed session already occupies the hour", () => {
    const existing = [{ startMs: Date.parse("2026-07-07T08:00:00Z"), endMs: Date.parse("2026-07-07T09:00:00Z") }];
    const clash = { startMs: Date.parse("2026-07-07T08:30:00Z"), endMs: Date.parse("2026-07-07T09:30:00Z") };
    const later = { startMs: Date.parse("2026-07-07T09:00:00Z"), endMs: Date.parse("2026-07-07T10:00:00Z") };
    assert.equal(approvalBlocked(existing, clash), true);
    assert.equal(approvalBlocked(existing, later), false);
  });

  it("allows free cancellation until exactly 24 hours before, including across the spring clock change", () => {
    const starts = madridLocalToUtc("2026-03-29", "10:00");
    assert.equal(starts.toISOString(), "2026-03-29T08:00:00.000Z");
    const exactly = new Date(starts.getTime() - 24 * 60 * 60 * 1000);
    assert.equal(canCancelFree(starts, exactly), true);
    assert.equal(canCancelFree(starts, new Date(exactly.getTime() + 1000)), false);
    assert.equal(exactly.toISOString(), "2026-03-28T08:00:00.000Z");
  });

  it("converts Madrid winter and summer times to the right UTC instant", () => {
    assert.equal(madridLocalToUtc("2026-01-15", "10:00").toISOString(), "2026-01-15T09:00:00.000Z");
    assert.equal(madridLocalToUtc("2026-07-15", "10:00").toISOString(), "2026-07-15T08:00:00.000Z");
    assert.equal(madridLocalToUtc("2026-10-25", "10:00").toISOString(), "2026-10-25T09:00:00.000Z");
  });

  it("rejects alternative times that are too soon or overnight", () => {
    const now = madridLocalToUtc("2026-06-02", "09:00");
    assert.equal(requestTimeAllowed(madridLocalToUtc("2026-06-02", "09:30"), now), false);
    assert.equal(requestTimeAllowed(madridLocalToUtc("2026-06-02", "11:00"), now), true);
    assert.equal(requestTimeAllowed(madridLocalToUtc("2026-06-03", "03:00"), now), false);
  });

  it("normalises phones and rejects secrets, missing consent, and unknown sources", () => {
    assert.equal(normalizePhone("+44 7700 900123"), "447700900123");
    const ok = validateBooking(validInput);
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.value.phoneKey, "34636670103");
    const secret = validateBooking({ ...validInput, question: "password: 1234" });
    assert.equal(secret.ok, false);
    const consent = validateBooking({ ...validInput, acceptTerms: false });
    assert.equal(consent.ok, false);
    assert.equal(readSource("Instagram"), "instagram");
    assert.equal(readSource("newsletter"), null);
  });

  it("keeps the booking when the email notification fails", () => {
    const result = notificationOutcome(false);
    assert.equal(result.bookingKept, true);
    assert.equal(result.notification, "failed");
  });

  it("stores only a hash of the cancellation token and keeps it out of the owner email", () => {
    const token = newCancelToken();
    const hash = hashToken(token);
    assert.equal(hash.length, 64);
    assert.equal(hash.includes(token), false);
    assert.equal(isReference(newReference()), true);
    const mail = ownerBookingEmail({
      reference: "AB23CD45",
      kind: "group",
      startsAt: madridLocalToUtc("2026-06-02", "10:00"),
      contactName: "María",
      attendeeName: "María",
      phone: "636670103",
      email: null,
      question: null,
      venue: "Biblioteca",
    });
    assert.match(mail.body, /AB23CD45/);
    assert.equal(mail.body.includes(token), false);
    assert.equal(mail.body.includes("/reserva/"), false);
    assert.match(mail.body, /https:\/\/iknowainhoa\.com\/guardamar-click\/admin\?focus=booking&ref=AB23CD45/);
    assert.match(mail.subject, /Nueva reserva/);
  });

  it("adds an admin deep link to owner request emails without manage tokens", () => {
    const token = newCancelToken();
    const mail = ownerRequestEmail({
      reference: "XY89KLMN",
      startsAt: madridLocalToUtc("2026-06-03", "11:00"),
      contactName: "Pepe",
      attendeeName: "Pepe",
      phone: "636670103",
      email: "pepe@example.com",
      question: null,
    });
    assert.match(mail.body, /focus=request&ref=XY89KLMN/);
    assert.equal(mail.body.includes(token), false);
    assert.equal(mail.body.includes("/reserva/"), false);
  });

  it("builds ES and EN customer confirmation emails with the private manage link", () => {
    const token = newCancelToken();
    const manageUrl = techBookingManageUrl(token);
    const es = customerBookingEmail({
      locale: "es",
      reference: "AB23CD45",
      kind: "group",
      startsAt: madridLocalToUtc("2026-06-02", "10:00"),
      durationMinutes: 60,
      priceCents: 1000,
      venue: "Biblioteca",
      manageToken: token,
    });
    const en = customerBookingEmail({
      locale: "en",
      reference: "AB23CD45",
      kind: "individual",
      startsAt: madridLocalToUtc("2026-06-02", "10:00"),
      durationMinutes: 60,
      priceCents: 2500,
      venue: "Biblioteca",
      manageToken: token,
    });
    assert.match(es.subject, /AB23CD45/);
    assert.match(es.body, /no lo compartas/i);
    assert.match(es.body, /636 67 01 03/);
    assert.equal(es.body.includes(manageUrl), true);
    assert.match(en.body, /do not share/i);
    assert.equal(en.body.includes(manageUrl), true);
    assert.match(en.body, /Individual/);
  });

  it("parses admin focus query params and rejects invalid references", () => {
    assert.deepEqual(parseAdminFocus("booking", "ab23cd45"), { focus: "booking", ref: "AB23CD45" });
    assert.equal(parseAdminFocus("request", "bad"), null);
    assert.equal(parseAdminFocus("session", "AB23CD45"), null);
    assert.match(techAdminFocusUrl("booking", "AB23CD45"), /^https:\/\/iknowainhoa\.com\/guardamar-click\/admin\?/);
  });

  it("builds a calendar file in UTC", () => {
    const ics = buildIcs({
      reference: "AB23CD45",
      title: "Guardamar Click",
      startsAt: new Date("2026-06-02T08:00:00.000Z"),
      endsAt: new Date("2026-06-02T09:15:00.000Z"),
      location: "Biblioteca, Guardamar",
      description: "Plaza AB23CD45",
    });
    assert.match(ics, /DTSTART:20260602T080000Z/);
    assert.match(ics, /LOCATION:Biblioteca\\, Guardamar/);
  });

  it("uses Spanish, English, and Dutch for this service", () => {
    assert.equal(resolveTechLocale(undefined, undefined), "es");
    assert.equal(resolveTechLocale(undefined, "en"), "en");
    assert.equal(resolveTechLocale(undefined, "nl"), "nl");
    assert.equal(resolveTechLocale(undefined, "fr"), "es");
    assert.equal(resolveTechLocale("en", "es"), "en");
    assert.equal(resolveTechLocale("nl", "en"), "nl");
    assert.equal(getTechCopy("es").headlineEm, "sin miedo");
    assert.equal(getTechCopy("en").headlineEm, "without fear");
    assert.equal(getTechCopy("nl").headlineEm, "zonder angst");
    assert.equal(shouldStripTechLangParam("/guardamar-click", "es"), true);
    assert.equal(shouldStripTechLangParam("/guardamar-click", "en"), false);
    assert.equal(shouldStripTechLangParam("/guardamar-click", "nl"), false);
    assert.equal(shouldStripTechLangParam("/guardamar-click", "fr"), true);
    assert.equal(shouldStripTechLangParam("/guardamar-click", "de"), true);
    assert.equal(shouldStripTechLangParam("/guardamar-click/admin", "es"), false);
  });
});

describe("tech database migration", () => {
  it("locks the session row, caps the group at seven, and blocks overlapping confirmed time", () => {
    assert.match(sql, /FOR UPDATE/);
    assert.match(sql, /taken >= sess\.capacity/);
    assert.match(sql, /tech_sessions_no_overlap/);
    assert.match(sql, /capacity BETWEEN 1 AND 7/);
    assert.match(sql, /kind = 'individual'[\s\S]*capacity = 1/);
  });

  it("keeps customer rows and booking functions away from the public", () => {
    assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
    assert.match(sql, /REVOKE ALL ON tech_bookings FROM PUBLIC, anon/);
    assert.match(sql, /cancel_token_hash/);
    assert.equal(/cancel_token text/i.test(sql), false);
    assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.tech_place_booking\(JSONB\) TO service_role/);
    assert.match(sql, /REVOKE ALL ON FUNCTION public\.tech_place_booking\(JSONB\) FROM PUBLIC, anon, authenticated/);
    assert.match(sql, /is_tech_admin/);
    assert.match(sql, /tech_bump_rate/);
  });

  it("does not reserve a pending request", () => {
    const requestFn = sql.slice(sql.indexOf("FUNCTION public.tech_place_request"), sql.indexOf("FUNCTION public.tech_access_by_token"));
    assert.equal(/INSERT INTO tech_sessions/.test(requestFn), false);
    assert.match(requestFn, /INSERT INTO tech_requests/);
  });

  it("cancels a session and its confirmed bookings in one admin RPC", () => {
    const cancelFn = sql.slice(sql.indexOf("FUNCTION public.tech_cancel_session"), sql.indexOf("ALTER TABLE tech_sessions ENABLE ROW LEVEL SECURITY"));
    assert.match(cancelFn, /SECURITY DEFINER/);
    assert.match(cancelFn, /SET search_path = public/);
    assert.match(cancelFn, /is_tech_admin/);
    assert.match(cancelFn, /FOR UPDATE/);
    assert.match(cancelFn, /status = 'cancelled'/);
    assert.match(cancelFn, /cancelled_at/);
    assert.match(cancelFn, /cancelled_bookings/);
    assert.match(cancelFn, /already_cancelled/);
    assert.match(cancelFn, /tech_forbidden/);
    assert.match(cancelFn, /REVOKE ALL ON FUNCTION public\.tech_cancel_session\(JSONB\) FROM PUBLIC, anon/);
    assert.match(cancelFn, /GRANT EXECUTE ON FUNCTION public\.tech_cancel_session\(JSONB\) TO authenticated/);
    assert.equal(/\bCOMMIT\b/i.test(cancelFn), false);
    assert.equal(/autonomous/i.test(cancelFn), false);
  });
});

describe("tech testimonials", () => {
  const storiesSql = readFileSync(new URL("../../supabase/tech-testimonials.sql", import.meta.url), "utf8");

  it("keeps visitor opinions behind admin RLS and the service role", () => {
    assert.match(storiesSql, /ENABLE ROW LEVEL SECURITY/);
    assert.match(storiesSql, /is_tech_admin\(\)/);
    assert.match(storiesSql, /REVOKE ALL ON tech_testimonials FROM PUBLIC, anon/);
    assert.match(storiesSql, /GRANT SELECT, INSERT, UPDATE, DELETE ON tech_testimonials TO authenticated, service_role/);
    assert.equal(/TO anon/.test(storiesSql), false);
  });

  it("accepts a short signed quote", () => {
    const result = validateTestimonial({
      displayName: "  María  ",
      body: "  Por fin mandé la foto.  ",
      place: "Guardamar",
      consent: true,
      locale: "es",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.displayName, "María");
      assert.equal(result.value.body, "Por fin mandé la foto.");
      assert.equal(result.value.place, "Guardamar");
    }
  });

  it("rejects a quote without consent or enough words", () => {
    const result = validateTestimonial({
      displayName: "Ana",
      body: "Bien",
      place: "",
      consent: false,
      locale: "en",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, ["quote", "consent"]);
    }
  });
});
