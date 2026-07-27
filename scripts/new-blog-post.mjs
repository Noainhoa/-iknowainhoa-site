import fs from "node:fs/promises";
import path from "node:path";

const [, , ...rawArgs] = process.argv;
const title = rawArgs.join(" ").trim();

if (!title) {
  console.error('Usage: npm run post:new -- "Your Post Title"');
  process.exit(1);
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Matches existing posts: 01-january, 02-february, … */
function monthFolderName(date) {
  const monthNumber = String(date.getMonth() + 1).padStart(2, "0");
  const monthName = date
    .toLocaleString("en-US", { month: "long" })
    .toLowerCase();
  return `${monthNumber}-${monthName}`;
}

const now = new Date();
const year = String(now.getFullYear());
const monthFolder = monthFolderName(now);
const date = now.toISOString().slice(0, 10);
const slug = slugify(title);

const templatePath = path.join(process.cwd(), "content", "_templates", "blog.md");
const targetDir = path.join(process.cwd(), "content", "blog", year, monthFolder);
const targetPath = path.join(targetDir, `${slug}.md`);

const template = await fs.readFile(templatePath, "utf8");
const filled = template
  .replace('title: ""', `title: "${title.replace(/"/g, '\\"')}"`)
  .replace('date: "YYYY-MM-DD"', `date: "${date}"`)
  .replace('slug: ""', `slug: "${slug}"`)
  .replaceAll("YYYY", year)
  .replaceAll("MM-month", monthFolder)
  .replaceAll("Month", monthFolder);

await fs.mkdir(targetDir, { recursive: true });

try {
  await fs.access(targetPath);
  console.error(`Post already exists: ${path.relative(process.cwd(), targetPath)}`);
  process.exit(1);
} catch {
  await fs.writeFile(targetPath, filled, "utf8");
}

console.log(`Created ${path.relative(process.cwd(), targetPath)}`);
console.log(`URL when published: /blog/${slug}`);
