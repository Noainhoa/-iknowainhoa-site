import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlankPage from "@/components/BlankPage";
import ListenEasyBetaActions from "@/components/product-apps/ListenEasyBetaActions";
import {
  buildProductAppMetadata,
  getProductApp,
  productAppPaths,
} from "@/lib/productApps";
import { publicPages } from "@/lib/site";

const SLUG = "listeneasy" as const;
const TESTFLIGHT_URL = "https://testflight.apple.com/join/5uYmScxX";
const LOGO_SRC = "/images/projects/listeneasy/logo.png";

/** Three differentiators — read first. */
const STANDOUTS = [
  {
    n: "01",
    title: "Your audiobooks, your library",
    line: "Import books you already have. No store, subscription, or account.",
  },
  {
    n: "02",
    title: "Multi-part books stay together",
    line: "CD, disc, and multi-file sets become one book—not dozens of tracks.",
  },
  {
    n: "03",
    title: "Notes made for listening",
    line: "Timestamped notes and bookmarks while you listen. Jump back to the exact moment.",
  },
] as const;

/** The rest — scannable, not essay-length. */
const MORE = [
  { title: "Easy importing", line: "Files, folders, Share, or AirDrop." },
  { title: "Never lose your place", line: "Position saved per book. Resume where you stopped." },
  { title: "Library that shows where you are", line: "Not Started, Continuing, Finished — plus search, sort, favourites, progress." },
  { title: "Chapters & parts", line: "Browse and jump to the section you want." },
  { title: "Flexible playback", line: "0.5×–3× speed, seek, custom skip intervals." },
  { title: "Sleep timer", line: "Stop automatically after 5–60 minutes." },
  { title: "Background & lock screen", line: "Listen locked; control from Lock Screen, Control Centre, or Bluetooth." },
  { title: "Covers & metadata", line: "Use embedded info, or fill in artwork when you want." },
  { title: "Companion PDFs", line: "Keep a book’s PDF with it and open from details." },
  { title: "Offline by design", line: "Books live on device. No connection needed to listen." },
  { title: "Private & account-free", line: "No login. Online metadata lookup is optional and off by default." },
  { title: "Broad formats", line: "M4B, MP3, M4A, FLAC, WAV, AIFF/AIF, and other iOS media." },
] as const;

export function generateMetadata(): Metadata {
  const app = getProductApp(SLUG);
  if (!app) return { title: "Not Found" };
  return buildProductAppMetadata(app, "product");
}

export default function ListenEasyProductPage() {
  if (!publicPages.listeneasy) return <BlankPage />;

  const app = getProductApp(SLUG);
  if (!app) return notFound();

  const paths = productAppPaths(SLUG);

  return (
    <main className="le">
      <header className="le-hero">
        <Image
          src={LOGO_SRC}
          alt=""
          width={160}
          height={160}
          priority
          className="le-logo"
        />

        <h1 className="le-name">{app.name}</h1>
        <p className="le-prop">For the audiobooks you already own.</p>
        <p className="le-line">
          Turns your audiobook files into an organised listening library on iPhone —
          progress, chapters, notes, and the controls a real audiobook player should have.
        </p>

        <ListenEasyBetaActions testFlightUrl={TESTFLIGHT_URL} appName={app.name} />
      </header>

      <section className="le-standouts" aria-labelledby="le-standouts-heading">
        <h2 id="le-standouts-heading" className="le-section-label">
          What stands out
        </h2>
        <ol className="le-standout-list">
          {STANDOUTS.map((item, i) => (
            <li
              key={item.n}
              className="le-standout"
              style={{ animationDelay: `${0.28 + i * 0.08}s` }}
            >
              <span className="le-n" aria-hidden="true">
                {item.n}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="le-more" aria-labelledby="le-more-heading">
        <h2 id="le-more-heading" className="le-section-label">
          Also in the beta
        </h2>
        <ul className="le-more-grid">
          {MORE.map((item, i) => (
            <li
              key={item.title}
              className="le-more-item"
              style={{ animationDelay: `${0.45 + i * 0.03}s` }}
            >
              <h3>{item.title}</h3>
              <p>{item.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="le-foot">
        <Link href={paths.support}>Support</Link>
        <span aria-hidden="true">·</span>
        <Link href={paths.privacy}>Privacy</Link>
      </footer>

      <style>{`
        .le {
          --le-blue: #1c6fdc;
          --le-ink: #2a2a2a;
          --le-muted: #5a5a5a;
          --le-soft: #8a8a8a;
          box-sizing: border-box;
          padding: clamp(36px, 7vh, 64px) clamp(20px, 5vw, 40px) 56px;
          font-family: var(--font-geist-sans);
          color: var(--le-ink);
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(28, 111, 220, 0.12), transparent 55%),
            #fff;
        }
        .le-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 36rem;
          margin: 0 auto;
        }
        .le-logo {
          width: min(112px, 34vw);
          height: auto;
          border-radius: 22%;
          animation: le-rise 0.7s ease both;
        }
        .le-name {
          margin: 24px 0 0;
          font-size: clamp(1.85rem, 5vw, 2.4rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          animation: le-rise 0.7s ease 0.06s both;
        }
        .le-prop {
          margin: 18px 0 0;
          font-size: clamp(1.2rem, 3.2vw, 1.45rem);
          font-weight: 650;
          letter-spacing: -0.025em;
          line-height: 1.25;
          color: var(--le-blue);
          animation: le-rise 0.7s ease 0.1s both;
        }
        .le-line {
          margin: 12px 0 0;
          font-size: 1.02rem;
          line-height: 1.55;
          color: var(--le-muted);
          max-width: 32em;
          animation: le-rise 0.7s ease 0.14s both;
        }
        .le-actions {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
          animation: le-rise 0.7s ease 0.18s both;
        }
        .le-cta,
        .le-share {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          min-width: min(100%, 220px);
          padding: 0 22px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 0.98rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
        }
        .le-cta {
          background: var(--le-blue);
          color: #fff !important;
          text-decoration: none !important;
          border: none;
        }
        .le-cta:hover {
          background: #155bb8;
          text-decoration: none !important;
        }
        .le-share {
          background: transparent;
          color: var(--le-ink);
          border: 1px solid #c8c8c8;
        }
        .le-share:hover {
          border-color: var(--le-ink);
        }
        .le-cta:active,
        .le-share:active {
          transform: translateY(1px);
        }
        .le-cta:focus-visible,
        .le-share:focus-visible {
          outline: 2px solid var(--le-blue);
          outline-offset: 3px;
        }
        .le-hint {
          margin: 4px 0 0;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--le-soft);
          max-width: 24em;
        }
        .le-section-label {
          margin: 0 0 22px;
          font-size: 0.78rem;
          font-weight: 650;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--le-soft);
        }
        .le-standouts {
          max-width: 40rem;
          margin: clamp(56px, 10vh, 88px) auto 0;
          width: 100%;
        }
        .le-standout-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0;
        }
        .le-standout {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 18px;
          align-items: start;
          padding: 22px 0;
          border-top: 1px solid rgba(28, 111, 220, 0.18);
          text-align: left;
          animation: le-rise 0.7s ease both;
        }
        .le-standout:last-child {
          border-bottom: 1px solid rgba(28, 111, 220, 0.18);
        }
        .le-n {
          font-size: clamp(1.6rem, 4vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--le-blue);
          font-variant-numeric: tabular-nums;
          padding-top: 2px;
        }
        .le-standout h3 {
          margin: 0;
          font-size: clamp(1.15rem, 2.8vw, 1.35rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }
        .le-standout p {
          margin: 8px 0 0;
          font-size: 0.98rem;
          line-height: 1.5;
          color: var(--le-muted);
        }
        .le-more {
          max-width: 52rem;
          margin: clamp(48px, 9vh, 72px) auto 0;
          width: 100%;
        }
        .le-more-grid {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        .le-more-item {
          text-align: left;
          padding: 14px 0;
          border-top: 1px solid #ebebeb;
          animation: le-rise 0.65s ease both;
        }
        .le-more-item:last-child {
          border-bottom: 1px solid #ebebeb;
        }
        .le-more-item h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 650;
          letter-spacing: -0.015em;
          color: var(--le-ink);
        }
        .le-more-item p {
          margin: 4px 0 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: var(--le-soft);
        }
        .le-foot {
          margin-top: clamp(48px, 10vh, 72px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--le-soft);
          animation: le-rise 0.7s ease 0.55s both;
        }
        .le-foot a {
          color: #555;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .le-foot a:hover {
          color: var(--le-ink);
        }
        @keyframes le-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (min-width: 720px) {
          .le-more-grid {
            grid-template-columns: 1fr 1fr;
            column-gap: 36px;
          }
          .le-more-item {
            border-top: none;
            padding: 16px 0;
            border-bottom: 1px solid #ebebeb;
          }
          .le-more-item:last-child {
            border-bottom: 1px solid #ebebeb;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .le-logo,
          .le-name,
          .le-prop,
          .le-line,
          .le-actions,
          .le-standout,
          .le-more-item,
          .le-foot {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
