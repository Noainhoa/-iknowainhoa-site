import Image from "next/image";
import HomeFeatureCarousel from "@/components/home/HomeFeatureCarousel";
import { getLocalizedBlogIndex } from "@/lib/blogLocale";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";
import { externalAnchorProps } from "@/lib/links";
import { site, siteWhatsAppEnquiryHref } from "@/lib/site";
import { getListedWork } from "@/lib/work";

/** Prefer these writing slides when they are in the public blog index. */
const HOME_FEATURED_BLOG_SLUGS = ["blue", "piano-joy", "exactness"];

const WA_ICON_PATH =
  "M12.04 2a9.9 9.9 0 0 0-9.9 9.9c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01a9.9 9.9 0 0 0 9.9-9.9 9.86 9.86 0 0 0-9.91-9.92Zm5.76 14.07c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.29.59-.37.79-.37h.57c.18 0 .42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.3.39-.43.52-.14.14-.29.3-.12.58.16.29.73 1.2 1.56 1.94 1.08.96 1.98 1.26 2.27 1.4.28.14.45.12.61-.07.17-.2.7-.82.89-1.1.19-.29.38-.24.64-.14.26.1 1.66.78 1.95.92.28.15.47.21.54.33.07.12.07.68-.17 1.36Z";

/** Brand-first portal — projects live on /work. */
export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const whatsappHref = siteWhatsAppEnquiryHref();
  const [work, posts] = await Promise.all([
    getListedWork(locale),
    getLocalizedBlogIndex(locale),
  ]);
  const workSlides = work.map((item) => ({
    id: item.slug,
    kicker: t.work.sections[item.category],
    title: item.title,
    summary: item.summary,
    href: item.href,
    image: item.coverImage,
    imageContain: Boolean(item.logo && item.coverImage === item.logo),
  }));
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const featuredPost = HOME_FEATURED_BLOG_SLUGS.map((slug) => bySlug.get(slug)).find(
    (post) => post && (post.description || post.title)
  );
  const slides = [
    ...(featuredPost
      ? [
          {
            id: featuredPost.slug,
            kicker: t.header.blog,
            title: featuredPost.title,
            summary: featuredPost.description?.trim() || featuredPost.title,
            href: `/blog/${featuredPost.slug}`,
            image: featuredPost.coverImage,
            imageContain: false,
          },
        ]
      : []),
    ...workSlides,
  ];

  return (
    <main className="home">
      <section className="home-hero" aria-label={site.name}>
        <div className="home-hero-media" aria-hidden>
          <Image
            src="/images/blog/avatar/03.png"
            alt=""
            fill
            priority
            sizes="(min-width: 860px) 58vw, 100vw"
            className="home-hero-img"
          />
        </div>
        <div className="home-hero-shade" aria-hidden />

        <div className="home-hero-copy">
          <p className="home-lead">{t.home.lead}</p>
          <HomeFeatureCarousel
            slides={slides}
            previousLabel={t.home.previous}
            nextLabel={t.home.next}
            openLabel={t.home.open}
            regionLabel={t.home.featuresLabel}
          />
        </div>
      </section>

      <a
        className="home-wa-fab"
        href={whatsappHref}
        {...externalAnchorProps(whatsappHref)}
        aria-label={t.header.whatsAppAria}
      >
        <svg viewBox="0 0 24 24" width="52" height="52" aria-hidden="true" focusable="false">
          <path fill="var(--accent-yellow)" d={WA_ICON_PATH} />
        </svg>
      </a>

      <style>{`
        .home {
          box-sizing: border-box;
          width: 100%;
          margin: 0;
          padding: 0;
          font-family: var(--font-geist-sans);
          background: #08080a;
        }
        .home-hero {
          position: relative;
          isolation: isolate;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100svh;
          overflow: hidden;
          color: #f7f4ef;
        }
        .home-hero-media {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .home-hero-img {
          object-fit: cover;
          object-position: center 12%;
        }
        .home-hero-shade {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(
              180deg,
              rgba(8, 8, 10, 0.42) 0%,
              rgba(8, 8, 10, 0.08) 22%,
              rgba(8, 8, 10, 0.2) 48%,
              rgba(8, 8, 10, 0.82) 100%
            );
          pointer-events: none;
        }
        .home-hero-copy {
          position: relative;
          z-index: 2;
          width: min(100%, 560px);
          padding: clamp(88px, 14vh, 120px) clamp(20px, 5vw, 40px)
            clamp(36px, 7vh, 56px);
        }
        .home-lead {
          margin: 0 0 clamp(22px, 4vh, 36px);
          max-width: 22ch;
          font-family: var(--font-serif);
          font-size: clamp(1.05rem, 2.6vw, 1.4rem);
          font-weight: 400;
          line-height: 1.4;
          color: rgba(247, 244, 239, 0.92);
          text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
        }
        .home-wa-fab {
          position: fixed;
          z-index: 45;
          right: max(16px, env(safe-area-inset-right, 0px));
          bottom: max(16px, env(safe-area-inset-bottom, 0px));
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          background: transparent;
          text-decoration: none !important;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.28));
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .home-wa-fab:hover svg path {
          fill: var(--accent-orange);
        }
        .home-wa-fab:focus-visible {
          outline: 2px solid var(--accent-orange);
          outline-offset: 3px;
        }
        @keyframes home-media-settle {
          from {
            transform: scale(1.08);
          }
          to {
            transform: scale(1.04);
          }
        }
        @keyframes home-rise {
          from {
            transform: translateY(14px);
          }
          to {
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: no-preference) {
          .home-hero-img {
            transform: scale(1.04);
            animation: home-media-settle 1.6s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .home-hero-copy {
            animation: home-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both;
          }
        }
        @media (min-width: 860px) {
          .home-hero {
            justify-content: center;
          }
          .home-hero-media {
            right: auto;
            width: 58%;
          }
          .home-hero-img {
            object-position: center 16%;
          }
          .home-hero-shade {
            background:
              linear-gradient(
                90deg,
                rgba(8, 8, 10, 0.08) 0%,
                rgba(8, 8, 10, 0.12) 38%,
                rgba(8, 8, 10, 0.72) 58%,
                #08080a 78%
              ),
              linear-gradient(
                180deg,
                rgba(8, 8, 10, 0.38) 0%,
                transparent 24%,
                transparent 100%
              );
          }
          .home-hero-copy {
            margin-left: auto;
            width: min(46%, 540px);
            padding: clamp(96px, 12vh, 120px) clamp(36px, 5vw, 64px)
              clamp(48px, 8vh, 72px);
          }
          .home-lead {
            max-width: 24ch;
          }
          .home-wa-fab {
            right: max(24px, env(safe-area-inset-right, 0px));
            bottom: max(24px, env(safe-area-inset-bottom, 0px));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .home-hero-img {
            transform: none;
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
