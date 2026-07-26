/**
 * Blog avatar moon shapes.
 * SVG sources also live in public/images/blog/moon/{moon,moon1,moon2}.svg
 */

export type BlogMoonId = "moon" | "moon1" | "moon2";

type MoonShape = {
  id: BlogMoonId;
  viewBox: string;
  /** Path used for fill mask + stroke outline */
  path: string;
  /** Optional transform applied around the path */
  transform?: string;
  strokeWidth: number;
};

/** Oldest design (Heroicons-style, rotated). */
export const moon1: MoonShape = {
  id: "moon1",
  viewBox: "0 0 24 24",
  transform: "rotate(38 12 12)",
  path: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  strokeWidth: 0.32,
};

/** Previous crescent — more open tips / thinner midsection. */
export const moon2: MoonShape = {
  id: "moon2",
  viewBox: "0 0 100 100",
  transform: "rotate(-16 50 50)",
  path: "M72 20 A38 38 0 1 0 72 80 A26 26 0 1 1 72 20 Z",
  strokeWidth: 1,
};

/**
 * Active design — fatter body, smaller aperture (tips closer),
 * open side facing the title.
 */
export const moon: MoonShape = {
  id: "moon",
  viewBox: "0 0 100 100",
  transform: "rotate(-20 -5 38)",
  path: "M75 37 A45 45 0 1 0 78 83 A14 26 0 1 1 72 37 Z",
  strokeWidth: 0.6,
};

export const blogMoonShapes = { moon, moon1, moon2 } as const;

/** Active moon for the blog brand avatar. */
export const activeBlogMoon = moon;

/** CSS mask data-URI for the active moon fill. */
export function moonMaskDataUri(shape: MoonShape = activeBlogMoon): string {
  const transformAttr = shape.transform ? ` transform='${shape.transform}'` : "";
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${shape.viewBox}'>` +
    `<g${transformAttr}>` +
    `<path fill='black' d='${shape.path}'/>` +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27")}")`;
}
