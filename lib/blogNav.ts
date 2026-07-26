import { site } from "@/lib/site";

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
export const blogNavSections: BlogNavSection[] = [
  {
    id: "learn",
    title: "Learn",
    links: [
      { href: "/blog", label: "All posts" },
      { href: "/gallery/blue", label: "Blue gallery" },
      { href: "/blog/blue", label: "Blue — the story" },
    ],
  },
  {
    id: "connect",
    title: "Connect",
    links: [
      { href: "/contact", label: "Contact" },
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
    title: "Best of",
    links: [
      { href: "/blog/blue", label: "Blue" },
      { href: "/blog/i-start-here", label: "I start here" },
      { href: "/blog/jar-of-awesome", label: "Jar of awesome" },
      { href: "/blog/i-get-to-keep-them", label: "I get to keep them" },
    ],
  },
  {
    id: "more",
    title: "More",
    links: [
      { href: "/gallery/blue", label: "Gallery" },
      { href: "/contact", label: "Say hello" },
      { href: "/", label: "Home" },
    ],
  },
];
