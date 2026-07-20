import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

export type PhotoArcPage = {
  title: string;
  description?: string;
  date?: string;
  html: string;
};

const PHOTOARC_DIR = path.join(process.cwd(), "content", "photoarc");

async function loadMarkdown(fileName: string): Promise<PhotoArcPage | null> {
  const filePath = path.join(PHOTOARC_DIR, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const rendered = await remark().use(remarkGfm).use(html).process(content);
    return {
      title: typeof data.title === "string" ? data.title : "PhotoArc",
      description: typeof data.description === "string" ? data.description : undefined,
      date: typeof data.date === "string" ? data.date : undefined,
      html: String(rendered),
    };
  } catch {
    return null;
  }
}

export async function getPhotoArcSupportPage() {
  return loadMarkdown("index.md");
}

export async function getPhotoArcPrivacyPage() {
  return loadMarkdown("privacy.md");
}
