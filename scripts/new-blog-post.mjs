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

const now = new Date();
const year = String(now.getFullYear());
const month = now.toLocaleString("en-US", { month: "long" });
const date = now.toISOString().slice(0, 10);
const slug = slugify(title);

const templatePath = path.join(process.cwd(), "content", "_templates", "blog.md");
const targetDir = path.join(process.cwd(), "content", "blog", year, month);
const targetPath = path.join(targetDir, `${slug}.md`);

const template = await fs.readFile(templatePath, "utf8");
const filled = template
  .replace('title: ""', `title: "${title.replace(/"/g, '\\"')}"`)
  .replace('date: "YYYY-MM-DD"', `date: "${date}"`)
  .replace('slug: ""', `slug: "${slug}"`)
  .replaceAll("YYYY", year)
  .replaceAll("Month", month);

await fs.mkdir(targetDir, { recursive: true });

try {
  await fs.access(targetPath);
  console.error(`Post already exists: ${path.relative(process.cwd(), targetPath)}`);
  process.exit(1);
} catch {
  await fs.writeFile(targetPath, filled, "utf8");
}

console.log(`Created ${path.relative(process.cwd(), targetPath)}`);
