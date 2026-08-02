import Image from "next/image";
import Link from "next/link";
import { externalAnchorProps } from "@/lib/links";

/** Home stays sparse — content is added piece by piece. */
export default function Home() {
  return (
    <main className="home">
      <div className="home-logos">
        <Link
          href="/parking-guardamar-centro"
          aria-label="Guardamar Parking"
          className="home-logo home-logo--parking"
        >
          <Image
            src="/images/parking/guardamar-parking-badge.png"
            alt="Guardamar Parking"
            width={160}
            height={160}
            priority
          />
        </Link>

        <a
          href="https://mueblesbegui.es/"
          {...externalAnchorProps("https://mueblesbegui.es/")}
          aria-label="Muebles Begui"
          className="home-logo home-logo--begui"
        >
          <Image
            src="/images/projects/muebles-begui/logo.png"
            alt="Muebles Begui"
            width={220}
            height={125}
            priority
          />
        </a>
      </div>

      <style>{`
        .home {
          min-height: 60vh;
          display: grid;
          place-items: center;
          padding: 48px 24px;
          font-family: var(--font-geist-sans);
        }
        .home-logos {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: center;
          justify-items: center;
          gap: 28px 40px;
          width: min(100%, 420px);
        }
        .home-logo {
          display: grid;
          place-items: center;
          width: 100%;
          height: 160px;
          line-height: 0;
          background: transparent;
        }
        .home-logo img {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        @media (max-width: 520px) {
          .home {
            padding: 36px 20px;
          }
          .home-logos {
            grid-template-columns: 1fr;
            width: min(100%, 220px);
            gap: 28px;
          }
          .home-logo {
            height: 148px;
          }
        }
      `}</style>
    </main>
  );
}
