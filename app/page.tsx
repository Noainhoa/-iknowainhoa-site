import Image from "next/image";
import Link from "next/link";
import { externalAnchorProps } from "@/lib/links";

/** Home stays sparse — content is added piece by piece. */
export default function Home() {
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
      </ul>

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
        /* Natural proportions — same column width, no forced equal height */
        .home-logo-img--parking {
          width: min(112px, 46vw);
          height: auto;
        }
        .home-logo-img--begui {
          width: min(168px, 70vw);
          height: auto;
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
        }
      `}</style>
    </main>
  );
}
