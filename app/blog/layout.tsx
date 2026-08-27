import BlogShell from "@/components/blog/BlogShell";
import { getBlogAvatarSources } from "@/lib/blogAvatar";
import { getLocale } from "@/lib/i18n";

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const [avatarSources, locale] = await Promise.all([
    getBlogAvatarSources(),
    getLocale(),
  ]);

  return (
    <>
      <BlogShell locale={locale} avatarSources={avatarSources}>
        {children}
      </BlogShell>
      <style>{`
        .blog-prose {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          line-height: 1.75;
          color: var(--foreground);
        }
        .blog-prose h1,
        .blog-prose h2,
        .blog-prose h3 {
          font-family: var(--font-geist-sans);
          font-weight: 750;
          letter-spacing: -0.02em;
          color: var(--foreground);
        }
        .blog-prose a {
          color: var(--link);
        }
      `}</style>
    </>
  );
}
