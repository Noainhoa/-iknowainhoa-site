#!/usr/bin/env node
/**
 * Publish a blog post: set draft:false, commit, and push to main.
 * Vercel production auto-deploys from main after the push.
 *
 * Usage:
 *   npm run post:publish -- content/blog/2026/07-july/my-post.md
 *   npm run post:publish -- my-post.md
 *   npm run post:publish -- my-post
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [, , ...rawArgs] = process.argv;
const input = rawArgs.join(" ").trim();

if (!input) {
  console.error(
    'Usage: npm run post:publish -- content/blog/YYYY/MM-month/your-post.md'
  );
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(
      detail || `${command} ${args.join(" ")} failed with exit ${result.status}`
    );
  }
  return (result.stdout || "").trim();
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findPost(query) {
  const cwd = process.cwd();
  const direct = path.resolve(cwd, query);
  if (await exists(direct)) return direct;

  const withMd = query.endsWith(".md") ? query : `${query}.md`;
  const blogRoot = path.join(cwd, "content", "blog");
  const matches = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      if (
        entry.name === withMd ||
        entry.name === path.basename(withMd) ||
        full.endsWith(withMd)
      ) {
        matches.push(full);
      }
    }
  }

  if (await exists(blogRoot)) await walk(blogRoot);

  if (matches.length === 0) {
    throw new Error(`Could not find blog post matching "${query}"`);
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple posts match "${query}":\n${matches
        .map((m) => `  - ${path.relative(cwd, m)}`)
        .join("\n")}`
    );
  }
  return matches[0];
}

function setDraftFalse(raw) {
  if (/^draft:\s*false\s*$/m.test(raw)) {
    return { content: raw, changed: false };
  }
  if (/^draft:\s*true\s*$/m.test(raw)) {
    return {
      content: raw.replace(/^draft:\s*true\s*$/m, "draft: false"),
      changed: true,
    };
  }
  // Insert draft: false after frontmatter opening if missing.
  if (raw.startsWith("---\n")) {
    return {
      content: raw.replace(/^---\n/, "---\ndraft: false\n"),
      changed: true,
    };
  }
  throw new Error("Post is missing YAML frontmatter");
}

function readSlug(raw) {
  const match = raw.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
  return match?.[1]?.trim() || null;
}

const postPath = await findPost(input);
const relativePost = path.relative(process.cwd(), postPath);
const raw = await fs.readFile(postPath, "utf8");
const { content, changed } = setDraftFalse(raw);
const slug = readSlug(content) || path.basename(postPath, ".md");

if (changed) {
  await fs.writeFile(postPath, content, "utf8");
  console.log(`Set draft: false in ${relativePost}`);
} else {
  console.log(`Already published (draft: false): ${relativePost}`);
}

const yearMonthMatch = relativePost.match(
  /^content\/blog\/(\d{4})\/([^/]+)\//
);
const imageDirs = [];
if (yearMonthMatch) {
  const [, year, monthFolder] = yearMonthMatch;
  const numberedDir = path.join("public", "images", "blog", year, monthFolder);
  // Some older assets use capital month folders (e.g. February)
  const plainMonth = monthFolder.replace(/^\d{2}-/, "");
  const capitalMonth =
    plainMonth.charAt(0).toUpperCase() + plainMonth.slice(1);
  const legacyDir = path.join(
    "public",
    "images",
    "blog",
    year,
    capitalMonth
  );
  for (const dir of [numberedDir, legacyDir]) {
    if (await exists(dir)) imageDirs.push(dir);
  }
}

const filesToAdd = [relativePost, ...imageDirs];
run("git", ["add", "--", ...filesToAdd]);

const staged = run("git", ["diff", "--cached", "--name-only"]);
if (!staged) {
  console.log("Nothing new to commit. Checking whether a push is still needed…");
} else {
  run("git", ["commit", "-m", `Publish blog post: ${slug}`]);
  console.log(`Committed: Publish blog post: ${slug}`);
}

const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
run("git", ["push", "-u", "origin", "HEAD"]);
console.log(`Pushed ${branch} → origin`);
console.log(`Vercel will auto-deploy production from main.`);
console.log(`Live URL (after deploy): https://iknowainhoa.com/blog/${slug}`);
