import Image from "next/image";
import Link from "next/link";
import { externalAnchorProps } from "@/lib/links";
import { siteWhatsAppEnquiryHref } from "@/lib/site";

const WA_ICON_PATH =
  "M12.04 2a9.9 9.9 0 0 0-9.9 9.9c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01a9.9 9.9 0 0 0 9.9-9.9 9.86 9.86 0 0 0-9.91-9.92Zm5.76 14.07c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.29.59-.37.79-.37h.57c.18 0 .42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.3.39-.43.52-.14.14-.29.3-.12.58.16.29.73 1.2 1.56 1.94 1.08.96 1.98 1.26 2.27 1.4.28.14.45.12.61-.07.17-.2.7-.82.89-1.1.19-.29.38-.24.64-.14.26.1 1.66.78 1.95.92.28.15.47.21.54.33.07.12.07.68-.17 1.36Z";

/** Home stays sparse — content is added piece by piece. */
export default function Home() {
  const whatsappHref = siteWhatsAppEnquiryHref();

  return (
    <main className="home">
      <ul className="home-logos">
        <li>
          <Link
            href="/parking-guardamar-centro"
            aria-label="Guardamar Parking"
            className="home-logo"
          >
            <Image
              src="/images/parking/guardamar-parking-badge.png"
              alt="Guardamar Parking"
              width={160}
              height={160}
              priority
              className="home-logo-img home-logo-img--parking"
            />
          </Link>
        </li>
        <li>
          <a
            href="https://mueblesbegui.es/"
            {...externalAnchorProps("https://mueblesbegui.es/")}
            aria-label="Muebles Begui"
            className="home-logo"
          >
            <Image
              src="/images/projects/muebles-begui/logo.png"
              alt="Muebles Begui"
              width={220}
              height={125}
              priority
              className="home-logo-img home-logo-img--begui"
            />
          </a>
        </li>
        <li>
          <Link href="/anicca" aria-label="Anicca" className="home-logo">
            <Image
              src="/images/projects/anicca/logo.png"
              alt="Anicca"
              width={160}
              height={156}
              priority
              className="home-logo-img home-logo-img--anicca"
            />
          </Link>
        </li>
      </ul>

      <a
        className="home-wa-fab"
        href={whatsappHref}
        {...externalAnchorProps(whatsappHref)}
        aria-label="WhatsApp enquiry"
      >
        <svg viewBox="0 0 24 24" width="52" height="52" aria-hidden="true" focusable="false">
          <path fill="var(--accent-yellow)" d={WA_ICON_PATH} />
        </svg>
      </a>

      <style>{`
        .home {
          box-sizing: border-box;
          width: 100%;
          min-height: calc(100vh - var(--accent-height) - var(--site-mobile-bar-height, 72px) - 180px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(40px, 8vh, 72px) clamp(20px, 6vw, 40px);
          font-family: var(--font-geist-sans);
        }
        .home-logos {
          list-style: none;
          margin: 0;
          padding: 0;
          width: min(100%, 240px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(40px, 7vh, 64px);
        }
        .home-logo {
          display: block;
          line-height: 0;
          width: 100%;
          text-align: center;
          background: transparent;
        }
        .home-logo-img {
          display: block;
          margin: 0 auto;
          width: auto;
          height: auto;
          max-width: 100%;
          object-fit: contain;
        }
        .home-logo-img--parking {
          width: min(112px, 46vw);
          height: auto;
        }
        .home-logo-img--begui {
          width: min(168px, 70vw);
          height: auto;
        }
        .home-logo-img--anicca {
          width: min(112px, 46vw);
          height: auto;
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
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
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
        @media (min-width: 720px) {
          .home-logos {
            width: min(100%, 280px);
            gap: clamp(48px, 8vh, 80px);
          }
          .home-logo-img--parking {
            width: 120px;
          }
          .home-logo-img--begui {
            width: 180px;
          }
          .home-logo-img--anicca {
            width: 120px;
          }
          .home-wa-fab {
            right: max(24px, env(safe-area-inset-right, 0px));
            bottom: max(24px, env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </main>
  );
}
