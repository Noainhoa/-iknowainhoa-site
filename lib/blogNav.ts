import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";

export type BlogNavLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type BlogNavSection = {
  id: string;
  title: string;
  links: BlogNavLink[];
};

/** Seth-style sidebar sections (no subscribe / digest). */
export function getBlogNavSections(locale: Locale): BlogNavSection[] {
  const t = getDictionary(locale).blog;
  return [
    {
      id: "learn",
      title: t.navLearn,
      links: [
        { href: "/blog", label: t.allPosts },
        { href: "/gallery/blue", label: t.blueGallery },
        { href: "/blog/blue", label: t.blueStory },
      ],
    },
    {
      id: "connect",
      title: t.navConnect,
      links: [
        { href: "/contact", label: getDictionary(locale).header.contact },
        {
          href: site.socials.instagram,
          label: "Instagram",
          external: true,
        },
        { href: `mailto:${site.email}`, label: "Email" },
      ],
    },
    {
      id: "best",
      title: t.navBest,
      links: [
        { href: "/blog/blue", label: t.bestBlue },
        { href: "/blog/i-start-here", label: t.bestStart },
        { href: "/blog/jar-of-awesome", label: t.bestJar },
        { href: "/blog/i-get-to-keep-them", label: t.bestKeep },
      ],
    },
    {
      id: "more",
      title: t.navMore,
      links: [
        { href: "/gallery/blue", label: t.blueGallery },
        { href: "/contact", label: t.sayHello },
        { href: "/", label: t.home },
      ],
    },
  ];
}

/** @deprecated Use getBlogNavSections(locale) */
export const blogNavSections: BlogNavSection[] = getBlogNavSections("en");
