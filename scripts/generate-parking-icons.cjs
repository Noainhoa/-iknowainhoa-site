/**
 * Home Screen / tab icons for Guardamar Parking and Guardamar Click.
 *
 * Parking + Click: keep the circular badge with transparent corners
 * (browser tab / favicon reads as a round badge, not a filled square).
 *
 * Usage: npm run icons:parking
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const sharp = require(path.join(ROOT, "node_modules/next/node_modules/sharp"));

const SIZES = [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-1024.png", 1024],
];

const JOBS = [
  {
    source: "public/images/parking/guardamar-parking-badge.png",
    outDir: "public/parking-icons/v2",
    mode: "circle",
    copies: [
      ["apple-touch-icon.png", "app/parking-guardamar-centro/apple-icon.png"],
      ["icon-512.png", "app/parking-guardamar-centro/icon.png"],
      ["apple-touch-icon.png", "app/parking-guardamar-centro/admin/apple-icon.png"],
      ["icon-512.png", "app/parking-guardamar-centro/admin/icon.png"],
    ],
  },
  {
    source: "public/images/tech/guardamar-click-badge-v2.png",
    outDir: "public/tech-icons/v2",
    mode: "circle",
    copies: [
      ["apple-touch-icon.png", "app/guardamar-click/apple-icon.png"],
      ["icon-512.png", "app/guardamar-click/icon.png"],
    ],
  },
];

async function extendRim(sourcePath, size) {
  const { data, info } = await sharp(sourcePath)
    .resize(size, size, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  let radius = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * ch + 3] > 200) {
        radius = Math.max(radius, Math.hypot(x - cx, y - cy));
      }
    }
  }
  const out = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const o = (y * w + x) * 3;
      if (data[i + 3] > 240) {
        out[o] = data[i];
        out[o + 1] = data[i + 1];
        out[o + 2] = data[i + 2];
        continue;
      }
      const dx = x - cx;
      const dy = y - cy;
      const len = Math.hypot(dx, dy) || 1;
      let si = i;
      for (let step = 0.9; step >= 0.72; step -= 0.03) {
        const sx = Math.max(0, Math.min(w - 1, Math.round(cx + (dx / len) * radius * step)));
        const sy = Math.max(0, Math.min(h - 1, Math.round(cy + (dy / len) * radius * step)));
        si = (sy * w + sx) * ch;
        if (data[si + 3] > 250) break;
      }
      out[o] = data[si];
      out[o + 1] = data[si + 1];
      out[o + 2] = data[si + 2];
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function circularTransparent(sourcePath, size) {
  const inset = Math.max(1, Math.round(size * 0.02));
  const inner = size - inset * 2;
  return sharp(sourcePath)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .extend({
      top: inset,
      bottom: inset,
      left: inset,
      right: inset,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  for (const job of JOBS) {
    const source = path.join(ROOT, job.source);
    const outDir = path.join(ROOT, job.outDir);
    if (!fs.existsSync(source)) throw new Error(`Missing source logo: ${source}`);
    fs.mkdirSync(outDir, { recursive: true });
    for (const [name, size] of SIZES) {
      const buf =
        job.mode === "circle" ? await circularTransparent(source, size) : await extendRim(source, size);
      fs.writeFileSync(path.join(outDir, name), buf);
      console.log(`Wrote ${job.outDir}/${name}`);
    }
    for (const [from, to] of job.copies) {
      fs.copyFileSync(path.join(outDir, from), path.join(ROOT, to));
      console.log(`Synced ${to}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
