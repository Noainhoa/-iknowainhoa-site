import fs from "node:fs/promises";
import path from "node:path";

const AVATAR_DIR = path.join(process.cwd(), "public", "images", "blog", "avatar");
const PUBLIC_PREFIX = "/images/blog/avatar";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

/**
 * Files present in public/images/blog/avatar become the blog oval loop.
 * Add or remove files there — no code change needed.
 */
export async function getBlogAvatarSources(): Promise<string[]> {
  try {
    const entries = await fs.readdir(AVATAR_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => `${PUBLIC_PREFIX}/${name}`);
  } catch {
    return [];
  }
}
