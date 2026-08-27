import {
  getAllBlog,
  getBlogPost,
  type ContentIndexItem,
  type ContentItem,
} from "@/lib/content";
import {
  markdownToHtml,
  pickLocalizedField,
  pickLocalizedMarkdown,
} from "@/lib/contentLocale";
import type { Locale } from "@/lib/i18n/shared";
import { openExternalLinksInNewTab } from "@/lib/links";

export function localizeBlogIndexItem(
  post: ContentIndexItem,
  locale: Locale
): ContentIndexItem {
  const meta = (post.metadata || {}) as Record<string, unknown>;
  return {
    ...post,
    title: pickLocalizedField(meta, "title", locale, post.title) || post.title,
    description: pickLocalizedField(meta, "description", locale, post.description),
  };
}

export async function getLocalizedBlogPost(
  slug: string,
  locale: Locale
): Promise<ContentItem | null> {
  const post = await getBlogPost(slug);
  if (!post) return null;

  const meta = (post.metadata || {}) as Record<string, unknown>;
  const title = pickLocalizedField(meta, "title", locale, post.title) || post.title;
  const description = pickLocalizedField(meta, "description", locale, post.description);
  const markdown = pickLocalizedMarkdown(post.body || "", locale);
  const html = markdown
    ? openExternalLinksInNewTab(await markdownToHtml(markdown))
    : post.html;

  return {
    ...post,
    title,
    description,
    body: markdown || post.body,
    html,
  };
}

export async function getLocalizedBlogIndex(locale: Locale): Promise<ContentIndexItem[]> {
  const posts = await getAllBlog();
  return posts.map((post) => localizeBlogIndexItem(post, locale));
}
