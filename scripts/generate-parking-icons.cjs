/**
 * Generate parking Home Screen / PWA icons from the Guardamar logo.
 *
 * Source: public/images/parking/guardamar-parking-logo.png
 * (circular badge; transparent corners currently render black on iOS)
 *
 * Fills a square canvas with the logo's outer blue and centres the badge
 * with ~7.5% safe padding so iOS can apply its own rounded mask.
 *
 * Usage: node scripts/generate-parking-icons.mjs
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(
  ROOT,
  "public/images/parking/guardamar-parking-logo.png"
);
const OUT_DIR = path.join(ROOT, "public/parking-icons/v2");
const MASTER_DIR = path.join(ROOT, "scripts/parking-icons");

/** Sampled from the outer blue ring / Untitled corner average. */
const BLUE = { r: 4, g: 92, b: 146 }; // #045C92
/** Fraction of canvas edge kept as safe padding around the badge. */
const PAD = 0.075;

const SIZES = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-1024.png", size: 1024 },
];

async function sampleOuterBlue(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  const cy = Math.floor(h / 2);
  // Walk inward from the left edge to the first opaque blue-ish pixel on the ring.
  for (let x = 0; x < Math.floor(w * 0.2); x++) {
    const i = (cy * w + x) * ch;
    const a = data[i + 3];
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (a > 200 && b > r + 40 && g > 40) {
      return { r, g, b };
    }
  }
  return BLUE;
}

async function makeIcon(sourcePath, size, blue) {
  const badgeSize = Math.round(size * (1 - 2 * PAD));
  const left = Math.round((size - badgeSize) / 2);
  const top = Math.round((size - badgeSize) / 2);

  const badge = await sharp(sourcePath)
    .resize(badgeSize, badgeSize, {
      fit: "contain",
      background: { r: blue.r, g: blue.g, b: blue.b, alpha: 1 },
    })
    .ensureAlpha()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: blue,
    },
  })
    .composite([{ input: badge, left, top }])
    .flatten({ background: blue })
    .removeAlpha()
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Missing source logo: ${SOURCE}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(MASTER_DIR, { recursive: true });

  const blue = await sampleOuterBlue(SOURCE);
  console.log(
    `Blue background: rgb(${blue.r}, ${blue.g}, ${blue.b}) / #${[blue.r, blue.g, blue.b]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")}`
  );
  console.log(`Padding: ${(PAD * 100).toFixed(1)}%`);
  console.log(`Source: ${SOURCE}`);

  const master = await makeIcon(SOURCE, 1024, blue);
  const masterPath = path.join(MASTER_DIR, "icon-master-1024.png");
  fs.writeFileSync(masterPath, master);

  for (const { name, size } of SIZES) {
    const buf = await makeIcon(SOURCE, size, blue);
    const out = path.join(OUT_DIR, name);
    fs.writeFileSync(out, buf);
    const meta = await sharp(buf).metadata();
    const { data, info } = await sharp(buf)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const corner = [data[0], data[1], data[2]];
    const hasAlpha = meta.hasAlpha === true;
    console.log(
      `Wrote ${name} ${meta.width}x${meta.height} channels=${info.channels} alpha=${hasAlpha} corner=${corner.join(",")}`
    );
  }

  // Keep App Router file conventions in sync (same art, cache-bust via /parking-icons/v2 in metadata).
  const copies = [
    ["apple-touch-icon.png", "app/parking-guardamar-centro/apple-icon.png"],
    ["icon-512.png", "app/parking-guardamar-centro/icon.png"],
    ["apple-touch-icon.png", "app/parking-guardamar-centro/admin/apple-icon.png"],
    ["icon-512.png", "app/parking-guardamar-centro/admin/icon.png"],
  ];
  for (const [from, to] of copies) {
    fs.copyFileSync(path.join(OUT_DIR, from), path.join(ROOT, to));
    console.log(`Synced ${to}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
