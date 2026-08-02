import Image from "next/image";
import Link from "next/link";

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
          target="_blank"
          rel="noopener noreferrer"
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

      <style jsx>{`
        .home {
          min-height: 60vh;
          display: grid;
          place-items: center;
          padding: 48px 24px;
          font-family: var(--font-geist-sans);
        }
        .home-logos {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 40px;
          max-width: 100%;
        }
        .home-logo {
          display: block;
          line-height: 0;
          flex-shrink: 0;
        }
        .home-logo :global(img) {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
        }
        .home-logo--parking :global(img) {
          width: 160px;
          height: 160px;
        }
        .home-logo--begui :global(img) {
          width: 220px;
          height: auto;
        }
        @media (max-width: 480px) {
          .home {
            padding: 40px 20px;
          }
          .home-logos {
            flex-direction: column;
            gap: 28px;
          }
          .home-logo--parking :global(img) {
            width: 140px;
            height: 140px;
          }
          .home-logo--begui :global(img) {
            width: 200px;
          }
        }
      `}</style>
    </main>
  );
}
