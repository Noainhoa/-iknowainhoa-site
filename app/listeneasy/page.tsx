import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlankPage from "@/components/BlankPage";
import { externalAnchorProps } from "@/lib/links";
import {
  buildProductAppMetadata,
  getProductApp,
  productAppPaths,
} from "@/lib/productApps";
import { publicPages } from "@/lib/site";

const SLUG = "listeneasy" as const;
const TESTFLIGHT_URL = "https://testflight.apple.com/join/5uYmScxX";
const LOGO_SRC = "/images/projects/listeneasy/logo.png";

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
      <div className="le-stage">
        <Image
          src={LOGO_SRC}
          alt=""
          width={160}
          height={160}
          priority
          className="le-logo"
        />

        <h1 className="le-name">{app.name}</h1>
        <p className="le-line">{app.tagline}</p>

        <a
          className="le-cta"
          href={TESTFLIGHT_URL}
          {...externalAnchorProps(TESTFLIGHT_URL)}
        >
          Join the beta
        </a>
        <p className="le-hint">Open on iPhone with TestFlight</p>
      </div>

      <footer className="le-foot">
        <Link href={paths.support}>Support</Link>
        <span aria-hidden="true">·</span>
        <Link href={paths.privacy}>Privacy</Link>
      </footer>

      <style>{`
        .le {
          box-sizing: border-box;
          min-height: calc(100vh - var(--accent-height) - var(--site-mobile-bar-height, 72px) - 180px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(40px, 8vh, 72px) clamp(20px, 6vw, 40px) 48px;
          font-family: var(--font-geist-sans);
          color: #2a2a2a;
          text-align: center;
        }
        .le-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 28rem;
        }
        .le-logo {
          width: min(120px, 36vw);
          height: auto;
          border-radius: 22%;
          animation: le-rise 0.7s ease both;
        }
        .le-name {
          margin: 28px 0 0;
          font-size: clamp(1.85rem, 5vw, 2.35rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          animation: le-rise 0.7s ease 0.08s both;
        }
        .le-line {
          margin: 14px 0 0;
          font-size: 1.05rem;
          line-height: 1.55;
          color: #555;
          max-width: 22em;
          animation: le-rise 0.7s ease 0.14s both;
        }
        .le-cta {
          margin-top: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 22px;
          border-radius: 12px;
          background: #1c6fdc;
          color: #fff !important;
          font-size: 0.98rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-decoration: none !important;
          animation: le-rise 0.7s ease 0.2s both;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .le-cta:hover {
          background: #155bb8;
          text-decoration: none !important;
        }
        .le-cta:active {
          transform: translateY(1px);
        }
        .le-cta:focus-visible {
          outline: 2px solid #1c6fdc;
          outline-offset: 3px;
        }
        .le-hint {
          margin: 12px 0 0;
          font-size: 0.85rem;
          color: #888;
          animation: le-rise 0.7s ease 0.24s both;
        }
        .le-foot {
          margin-top: clamp(48px, 10vh, 80px);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          color: #888;
          animation: le-rise 0.7s ease 0.3s both;
        }
        .le-foot a {
          color: #555;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .le-foot a:hover {
          color: #2a2a2a;
        }
        @keyframes le-rise {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .le-logo,
          .le-name,
          .le-line,
          .le-cta,
          .le-hint,
          .le-foot {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
