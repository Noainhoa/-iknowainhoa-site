/**
 * Verified Life canvas demo ledger — real events only.
 * Dates/places are editable; treat as working source until sheet sync lands.
 */

export type DemoMarkKind = "event" | "home";

export type DemoImportance = "major" | "medium" | "light";

export type DemoSubject =
  | "birth"
  | "home"
  | "education"
  | "skill"
  | "pet"
  | "health"
  | "work"
  | "achievement"
  | "joy";

export type VerifiedDemoMark = {
  id: string;
  /** ISO-ish: YYYY | YYYY-MM | YYYY-MM-DD */
  date: string;
  precision: "exact" | "month" | "year";
  kind: DemoMarkKind;
  subject: DemoSubject;
  importance: DemoImportance;
  title: string;
  place?: string;
  notes?: string;
};

/**
 * Chronological working set from conversation + address note (Sep 2026).
 * Gaps intentionally left sparse.
 */
export const VERIFIED_DEMO_MARKS: VerifiedDemoMark[] = [
  {
    id: "birth",
    date: "1986-02-19",
    precision: "exact",
    kind: "event",
    subject: "birth",
    importance: "major",
    title: "Born",
    place: "Madrid",
  },
  {
    id: "home-madrid-1986",
    date: "1986-02",
    precision: "month",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Madrid",
    place: "Madrid",
    notes: "~3 months, then Villalba de la Sierra",
  },
  {
    id: "home-villalba-1986",
    date: "1986-05",
    precision: "month",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Villalba de la Sierra",
    place: "Villalba de la Sierra, Cuenca",
    notes: "Until ~1994; month of move after Madrid is approximate",
  },
  {
    id: "home-cuenca-1994",
    date: "1994",
    precision: "year",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Cuenca",
    place: "Cuenca",
    notes: "Through ~2005 for now",
  },
  {
    id: "home-grancanaria-2005",
    date: "2005",
    precision: "year",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Gran Canaria",
    place: "Gran Canaria",
    notes: "2005–2010",
  },
  {
    id: "home-madrid-2010",
    date: "2010",
    precision: "year",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Madrid",
    place: "Madrid",
    notes: "2010–2013",
  },
  {
    id: "edu-ied-grad",
    date: "2013",
    precision: "year",
    kind: "event",
    subject: "education",
    importance: "medium",
    title: "IED Industrial Product Design — graduated",
    place: "Madrid",
    notes: "Studied 2010–2013; mark is graduation only",
  },
  {
    id: "home-ireland-naas-2013",
    date: "2013",
    precision: "year",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Naas, Kildare",
    place: "Naas, County Kildare, Ireland",
    notes: "Ireland 2013–2016 (with Kildangan)",
  },
  {
    id: "home-ireland-kildangan",
    date: "2014",
    precision: "year",
    kind: "home",
    subject: "home",
    importance: "light",
    title: "Kildangan, Kildare",
    place: "Kildangan, County Kildare, Ireland",
    notes: "Year within Ireland chapter is approximate / editable",
  },
  {
    id: "pet-blue-arrived",
    date: "2015-08",
    precision: "month",
    kind: "event",
    subject: "pet",
    importance: "medium",
    title: "Blue arrived",
    notes: "Great Dane",
  },
  {
    id: "home-henley-2016",
    date: "2016-09-28",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Arrived UK · Henley-on-Thames",
    place: "Beechwood Lodge, Lambridge Lane, Henley-on-Thames RG9 4NR",
  },
  {
    id: "home-hoddesdon",
    date: "2016-09-28",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "light",
    title: "Hoddesdon",
    place: "Roselea, Riverside Road, Hoddesdon EN11 0BJ",
    notes: "Date tentative (same day as UK arrival in notes) — editable",
  },
  {
    id: "pet-blue-died",
    date: "2019-08",
    precision: "month",
    kind: "event",
    subject: "pet",
    importance: "major",
    title: "Blue died",
    notes: "Great Dane · ~4 years",
  },
  {
    id: "home-leighton-buzzard",
    date: "2019-08-16",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Leighton Buzzard",
    place: "11 Kendal Gardens, Leighton Buzzard LU7 2QZ",
  },
  {
    id: "skill-piano-started",
    date: "2019",
    precision: "year",
    kind: "event",
    subject: "skill",
    importance: "medium",
    title: "Started piano",
  },
  {
    id: "home-dunstable",
    date: "2020-08-10",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Dunstable",
    place: "44 Spoondell, Dunstable LU6 3JE",
  },
  {
    id: "home-ridgmont",
    date: "2021-12-10",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Ridgmont",
    place: "85 High St, Ridgmont, Bedford MK43 0TY",
  },
  {
    id: "skill-cycling",
    date: "2022-03",
    precision: "month",
    kind: "event",
    subject: "skill",
    importance: "medium",
    title: "Road cycling",
    notes: "Misogi / one skill a year",
  },
  {
    id: "health-cancer-diagnosis",
    date: "2022-06-08",
    precision: "exact",
    kind: "event",
    subject: "health",
    importance: "major",
    title: "Breast Cancer diagnosis",
  },
  {
    id: "home-broughton",
    date: "2023-01-02",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Broughton, Milton Keynes",
    place: "43 Countess Way, Broughton, Milton Keynes MK10 7DB",
  },
  {
    id: "work-fired",
    date: "2023-06-06",
    precision: "exact",
    kind: "event",
    subject: "work",
    importance: "major",
    title: "Fired",
  },
  {
    id: "home-conniburrow",
    date: "2023-07-15",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Conniburrow, Milton Keynes",
    place: "14 Marigold Place, Conniburrow, Milton Keynes MK14 7AB",
  },
  {
    id: "home-luton",
    date: "2023-12-27",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Luton",
    place: "157 Buckingham Drive, Luton LU2 9RE",
  },
  {
    id: "edu-celta",
    date: "2024-03",
    precision: "month",
    kind: "event",
    subject: "education",
    importance: "medium",
    title: "CELTA finalised",
  },
  {
    id: "achievement-citizenship",
    date: "2024-04-22",
    precision: "exact",
    kind: "event",
    subject: "achievement",
    importance: "major",
    title: "British citizenship ceremony",
  },
  {
    id: "home-leys",
    date: "2024-06-30",
    precision: "exact",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "The Leys, Cambridge",
    place: "The Leys, Cambridge",
    notes: "30 Jun 2024 → ~Sep 2024",
  },
  {
    id: "joy-grand-piano-leys",
    date: "2024-07-12",
    precision: "exact",
    kind: "event",
    subject: "joy",
    importance: "major",
    title: "Played a grand piano at The Leys",
    place: "The Leys, Cambridge",
  },
  {
    id: "home-trumpington",
    date: "2024-09",
    precision: "month",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Trumpington, Cambridge",
    place: "3 Allen Court, Hauxton Road, Trumpington, Cambridge CB2 9LU",
    notes: "After The Leys (~Sep 2024); day editable — supersedes older 27 Jul note",
  },
  {
    id: "home-villalba-angus-2025",
    date: "2025-11",
    precision: "month",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Villalba de la Sierra · Angus",
    place: "Villalba de la Sierra, Cuenca",
  },
  {
    id: "home-cuenca-2026",
    date: "2026-03",
    precision: "month",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Cuenca",
    place: "Cuenca",
  },
  {
    id: "skill-scuba",
    date: "2026-03",
    precision: "month",
    kind: "event",
    subject: "skill",
    importance: "medium",
    title: "Scuba diving",
    notes: "Misogi / one skill a year",
  },
  {
    id: "home-guardamar",
    date: "2026-06",
    precision: "month",
    kind: "home",
    subject: "home",
    importance: "medium",
    title: "Guardamar",
    place: "Guardamar, Alicante",
  },
];

export const DEMO_CANVAS_RULES = {
  birthYear: 1986,
  birthDate: "1986-02-19",
  homesAsMoveMarks: true,
  timeProportional: true,
  laneMode: "single-with-split-rules" as const,
  splitWhenBusy:
    "Prefer one midline; split into Places / Learning / Life only if marks stack unreadably (~3+ different subjects in ~6–12 months at current zoom).",
  importanceLegend: {
    major: "Large filled — milestones you’d name in one sentence to a stranger",
    medium: "Medium filled — solid chapter marks (moves, graduation, skills)",
    light: "Medium empty ring — lighter / tentative / secondary home in a chapter",
    home: "House glyph — new address (not an open period bar)",
  },
} as const;
