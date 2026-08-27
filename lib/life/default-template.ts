/** Seed structure for first-time Life initialization — no personal data. */
export type LifeTrackTemplate = {
  name: string;
  order: number;
};

export type LifeGroupTemplate = {
  name: string;
  order: number;
  tracks: LifeTrackTemplate[];
};

export const LIFE_DEFAULT_TEMPLATE: LifeGroupTemplate[] = [
  {
    name: "PLACES",
    order: 1,
    tracks: [
      { name: "Home", order: 1 },
      { name: "Country / Base", order: 2 },
      { name: "Where I was", order: 3 },
    ],
  },
  {
    name: "WORK",
    order: 2,
    tracks: [{ name: "Work", order: 1 }],
  },
  {
    name: "EDUCATION",
    order: 3,
    tracks: [{ name: "Education", order: 1 }],
  },
  {
    name: "LANGUAGES",
    order: 4,
    tracks: [{ name: "Languages", order: 1 }],
  },
  {
    name: "SKILLS",
    order: 5,
    tracks: [{ name: "Skills", order: 1 }],
  },
  {
    name: "PROJECTS / BUILT",
    order: 6,
    tracks: [{ name: "Projects / Built", order: 1 }],
  },
  {
    name: "MONEY",
    order: 7,
    tracks: [{ name: "Money", order: 1 }],
  },
  {
    name: "THINGS OWNED",
    order: 8,
    tracks: [{ name: "Things owned", order: 1 }],
  },
  {
    name: "EXPERIENCES",
    order: 9,
    tracks: [{ name: "Experiences", order: 1 }],
  },
  {
    name: "LIFE EVENTS",
    order: 10,
    tracks: [{ name: "Life events", order: 1 }],
  },
];
