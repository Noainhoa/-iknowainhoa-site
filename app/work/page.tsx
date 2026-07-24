import Link from "next/link";
import Image from "next/image";
import BlankPage from "@/components/BlankPage";
import { getAllWork } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";
import { publicPages } from "@/lib/site";

export default async function WorkPage() {
  if (!publicPages.work) return <BlankPage />;

  const locale = await getLocale();
  const t = getDictionary(locale);
  const work = await getAllWork();

  return (
    <main className="work-main" style={{ fontFamily: "system-ui", maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>{t.work.title}</h1>
        <p style={{ marginTop: 8, fontSize: 15, opacity: 0.75, maxWidth: 520, lineHeight: 1.5 }}>
          {t.work.subtitle}
        </p>
      </header>

      {work.length === 0 ? (
        <div style={{ marginTop: 64, textAlign: "center", opacity: 0.6 }}>
          <p style={{ fontSize: 18 }}>{t.work.empty}</p>
        </div>
      ) : (
        <section
          className="work-grid"
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {work.map((item, index) => {
            const isWebsite = item.kind === "Website";
            const isPlacesProject = item.href === "/projects/places";

            const Card = (
              <div
                className="work-media"
                style={{
                  // Places uses a wide banner-style cover; keep the background neutral
                  // so letterboxing doesn't look like a "black block".
                  backgroundColor: isWebsite || isPlacesProject ? "rgba(255,255,255,0.04)" : "var(--muted)",
                }}
              >
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    priority={index < 3}
                    loading={index < 3 ? "eager" : "lazy"}
                    style={{
                      objectFit: isWebsite || isPlacesProject ? "contain" : "cover",
                      objectPosition: isWebsite || isPlacesProject ? "50% 0%" : "50% 50%",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.4, textAlign: "center" }}>No image</div>
                )}

                {/* Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.12,
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    pointerEvents: "none",
                  }}
                >
                  {item.kind}
                </span>

                {/* Subtle bottom gradient */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isPlacesProject
                      ? "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.25) 100%)"
                      : "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.42) 100%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Title overlay */}
                <div
                  style={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: 10,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 10,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 650,
                      lineHeight: 1.15,
                      color: "#fff",
                      textShadow: "0 1px 10px rgba(0,0,0,0.25)",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              </div>
            );

            return (
              <Link
                key={`${item.kind}-${item.href}`}
                href={item.href}
                className="work-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {Card}
              </Link>
            );
          })}
        </section>
      )}

      <style>{`
        .work-main {
          padding: 32px;
        }

        @media (max-width: 640px) {
          .work-main {
            padding: 18px 14px;
          }

          .work-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        .work-card {
          display: block;
          border: 1px solid var(--border);
          background: var(--card);
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .work-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 640px) {
          .work-card {
            border: none;
            background: transparent;
            border-radius: 0;
            box-shadow: none;
          }

          .work-card:hover {
            transform: none;
            box-shadow: none;
          }
        }

        .work-media {
          position: relative;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 4 / 3;
        }

        @media (max-width: 640px) {
          .work-media {
            aspect-ratio: 3 / 2;
          }
        }
      `}</style>
    </main>
  );
}

