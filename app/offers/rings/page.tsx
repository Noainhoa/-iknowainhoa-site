import BlankPage from "@/components/BlankPage";
import { publicPages } from "@/lib/site";

const buyUrl = "https://buy.stripe.com/placeholder-rings";

const galleryItems = [
  {
    title: "Front view",
    caption: "A quiet face, kept simple.",
  },
  {
    title: "Worn on hand",
    caption: "Scaled against skin and movement.",
  },
  {
    title: "Side profile",
    caption: "A modest band with steady weight.",
  },
  {
    title: "Material detail",
    caption: "Texture, finish, and touch.",
  },
  {
    title: "Natural light",
    caption: "Seen in an ordinary, calm setting.",
  },
  {
    title: "Object study",
    caption: "Placed with cloth, stone, or wood.",
  },
];

const productFacts = [
  { label: "Price", value: "£40" },
  { label: "Material", value: "Recycled stainless steel in a warm grey tone" },
  { label: "Sizes", value: "US 6-13, with half sizes available on request" },
  { label: "Width", value: "4 mm" },
  { label: "Weight", value: "8 g" },
  { label: "Finish", value: "Matte brushed with subtle hand texture" },
  { label: "For", value: "Anyone who wants a simple object of recollection in daily life" },
  { label: "Shipping", value: "UK and EU: 1-3 business days. International: 7-12 business days" },
];

const faqItems = [
  {
    question: "What is the ring made of?",
    answer: "It is made from recycled stainless steel with a matte brushed finish.",
  },
  {
    question: "Is it adjustable?",
    answer: "No. It is a fixed-size ring, so choosing the right size matters.",
  },
  {
    question: "How do I choose a size?",
    answer: "Use a ring sizer or compare with a ring that already fits you well. If you are between sizes, sizing up is usually more comfortable.",
  },
  {
    question: "How does payment work?",
    answer: "The checkout link opens a Stripe payment page where shipping and taxes are handled before payment is completed.",
  },
  {
    question: "Where do you ship?",
    answer: "Orders can be sent within the UK, the EU, and internationally.",
  },
  {
    question: "Is this connected to any organisation?",
    answer: "No. It comes from personal experience and personal practice, not from any organisation or official tradition mark.",
  },
  {
    question: "How long does shipping take?",
    answer: "UK and EU orders usually arrive in 1-3 business days. International orders usually take 7-12 business days.",
  },
];

const palette = {
  background: "#f6f0e7",
  panel: "#fbf7f1",
  panelStrong: "#efe4d4",
  border: "#d8c9b7",
  text: "#2f2924",
  muted: "#6e6257",
  accent: "#8a6846",
  button: "#3f352c",
  buttonText: "#f8f2ea",
};

const serifStack = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
const sansStack = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function SectionHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
      {eyebrow ? (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: palette.muted,
          }}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        style={{
          margin: 0,
          fontFamily: serifStack,
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          lineHeight: 1.05,
          fontWeight: 500,
          color: palette.text,
        }}
      >
        {title}
      </h2>
      {body ? (
        <p style={{ margin: 0, maxWidth: 680, fontSize: 17, lineHeight: 1.8, color: palette.muted }}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

export const metadata = {
  title: "Token Ring – A ring born from silence",
  description: "A calm single-page object and story landing page for the Token Ring, shaped by daily practice, attention, and restraint.",
};

export default function TokenRingPage() {
  if (!publicPages.offers) return <BlankPage />;

  return (
    <main
      style={{
        background: `linear-gradient(180deg, ${palette.background} 0%, #f2eadf 100%)`,
        color: palette.text,
        fontFamily: sansStack,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 20px 96px" }}>
        <section
          style={{
            minHeight: "min(88vh, 920px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
            alignItems: "center",
            padding: "42px 0 72px",
          }}
        >
          <div style={{ display: "grid", gap: 22 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: palette.muted,
              }}
            >
              Token Ring
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: serifStack,
                fontSize: "clamp(3.2rem, 8vw, 6rem)",
                lineHeight: 0.96,
                fontWeight: 500,
                maxWidth: 620,
              }}
            >
              A ring born from silence
            </h1>
            <p style={{ margin: 0, maxWidth: 640, fontSize: 18, lineHeight: 1.9, color: palette.muted }}>
              Designed after my fourth Vipassana course, this metal token ring is a small object to carry presence,
              stillness, and remembrance into daily life.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingTop: 6 }}>
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "14px 22px",
                  borderRadius: 999,
                  background: palette.button,
                  color: palette.buttonText,
                  textDecoration: "none",
                  fontWeight: 600,
                  border: `1px solid ${palette.button}`,
                }}
              >
                Buy the ring
              </a>
              <a
                href="#story"
                style={{
                  padding: "14px 22px",
                  borderRadius: 999,
                  border: `1px solid ${palette.border}`,
                  color: palette.text,
                  textDecoration: "none",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.34)",
                }}
              >
                Read the story
              </a>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              minHeight: 580,
              borderRadius: 36,
              overflow: "hidden",
              border: `1px solid ${palette.border}`,
              background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.95), rgba(255,255,255,0) 32%), linear-gradient(160deg, ${palette.panel} 0%, ${palette.panelStrong} 100%)`,
              boxShadow: "0 30px 80px rgba(95, 71, 46, 0.12)",
              display: "grid",
              placeItems: "center",
              padding: 28,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 24,
                borderRadius: 28,
                border: "1px solid rgba(138, 104, 70, 0.18)",
              }}
            />
            <div
              style={{
                width: "min(78vw, 360px)",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                border: "18px solid rgba(92, 77, 63, 0.92)",
                boxShadow: "0 24px 40px rgba(67, 51, 36, 0.14), inset 0 0 0 2px rgba(255,255,255,0.12)",
                transform: "rotate(-8deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 28,
                right: 28,
                bottom: 26,
                paddingTop: 18,
                borderTop: "1px solid rgba(138, 104, 70, 0.28)",
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 14, color: palette.muted }}>Hero image placeholder</span>
              <span style={{ fontSize: 14, color: palette.muted }}>Add ring photography to replace this study</span>
            </div>
          </div>
        </section>

        <section style={{ padding: "24px 0 84px" }}>
          <SectionHeading
            eyebrow="Gallery"
            title="See the object before you read the explanation"
            body="This page is ready for a tactile, honest gallery. The current layout gives the ring room to feel real without turning it into glossy luxury."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
            }}
          >
            {galleryItems.map((item, index) => (
              <figure
                key={item.title}
                style={{
                  margin: 0,
                  padding: 18,
                  borderRadius: 24,
                  border: `1px solid ${palette.border}`,
                  background: index === 1 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.52)",
                  minHeight: index === 1 ? 360 : 300,
                  display: "grid",
                  gridTemplateRows: "1fr auto",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(138, 104, 70, 0.2)",
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(230,216,198,0.95)), radial-gradient(circle at top left, rgba(255,255,255,0.9), rgba(255,255,255,0))",
                    display: "grid",
                    placeItems: "center",
                    minHeight: 190,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: index % 3 === 0 ? 108 : 84,
                      height: index % 3 === 0 ? 108 : 84,
                      borderRadius: "50%",
                      border: "10px solid rgba(84, 68, 55, 0.86)",
                      transform: index % 2 === 0 ? "rotate(10deg)" : "rotate(-12deg)",
                      opacity: 0.9,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      fontSize: 12,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: palette.muted,
                    }}
                  >
                    Add photo
                  </span>
                </div>
                <figcaption style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontFamily: serifStack, fontSize: 23 }}>{item.title}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: palette.muted }}>{item.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          style={{
            padding: "0 0 84px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
            gap: 28,
            alignItems: "start",
          }}
        >
          <div
            style={{
              padding: 30,
              borderRadius: 30,
              border: `1px solid ${palette.border}`,
              background: "rgba(255,255,255,0.65)",
            }}
          >
            <SectionHeading
              eyebrow="Product"
              title="Concise details, nothing performative"
              body="A quiet reminder in metal. Clear enough for someone ready to order, restrained enough to leave the object alone."
            />
            <div style={{ display: "grid", gap: 14 }}>
              {productFacts.map((fact) => (
                <div
                  key={fact.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px minmax(0, 1fr)",
                    gap: 12,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(138, 104, 70, 0.16)",
                  }}
                >
                  <span style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: palette.muted }}>
                    {fact.label}
                  </span>
                  <span style={{ fontSize: 16, lineHeight: 1.7 }}>{fact.value}</span>
                </div>
              ))}
            </div>
          </div>

          <aside
            style={{
              position: "sticky",
              top: 24,
              padding: 28,
              borderRadius: 30,
              border: `1px solid ${palette.border}`,
              background: `linear-gradient(180deg, rgba(255,255,255,0.82), rgba(244,233,219,0.92))`,
              display: "grid",
              gap: 18,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: palette.muted }}>
              Token Ring
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              <h3 style={{ margin: 0, fontFamily: serifStack, fontSize: 34, fontWeight: 500 }}>£40</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: palette.muted }}>
                Designed as a small object of recollection, not a symbol of achievement.
              </p>
            </div>
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textAlign: "center",
                padding: "14px 18px",
                borderRadius: 999,
                background: palette.button,
                color: palette.buttonText,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Buy with Stripe
            </a>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: palette.muted }}>
              If you need help with sizing, shipping, or availability, email{" "}
              <a href="mailto:support@iknowainhoa.com" style={{ color: palette.accent }}>
                support@iknowainhoa.com
              </a>
              .
            </p>
          </aside>
        </section>

        <section id="story" style={{ padding: "0 0 84px" }}>
          <SectionHeading
            eyebrow="Story"
            title="Why I made it"
            body="This section is written as a personal reflection rather than product marketing, so the object can stand inside lived experience instead of explanation alone."
          />
          <div style={{ display: "grid", gap: 24, maxWidth: 760 }}>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.95 }}>
              I made this ring because silence can be clear in retreat and elusive in ordinary life. After my fourth
              Vipassana course, I noticed how quickly attention could be dispersed again by conversation, movement,
              errands, plans, and screens.
            </p>
            <div
              style={{
                minHeight: 360,
                borderRadius: 30,
                border: `1px solid ${palette.border}`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)), linear-gradient(135deg, #ddd0bf, #f7f0e7)",
                display: "grid",
                placeItems: "center",
                padding: 24,
              }}
            >
              <p
                style={{
                  margin: 0,
                  maxWidth: 520,
                  textAlign: "center",
                  fontFamily: serifStack,
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "#5e5146",
                }}
              >
                Full-width story image placeholder for a hand, a table, natural light, and the ring in use.
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.95 }}>
              The ring came from that gap. Not as a talisman, not as an answer, and not as a spiritual badge. Just as
              a small piece of metal that can gather attention for a second and return it to what is already happening.
            </p>
            <blockquote
              style={{
                margin: 0,
                padding: "0 0 0 22px",
                borderLeft: `2px solid ${palette.accent}`,
                fontFamily: serifStack,
                fontSize: 29,
                lineHeight: 1.45,
                color: "#5e5146",
              }}
            >
              It is less about wearing a symbol than about meeting the moment you are already in.
            </blockquote>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.95 }}>
              A ring felt right because it lives close to touch. It can be felt without display. It can be ordinary.
              That was important to me. I wanted something quiet enough to accompany practice without trying to define
              it.
            </p>
          </div>
        </section>

        <section
          style={{
            padding: "0 0 84px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
          }}
        >
          <div
            style={{
              padding: 28,
              borderRadius: 28,
              border: `1px solid ${palette.border}`,
              background: "rgba(255,255,255,0.62)",
            }}
          >
            <SectionHeading eyebrow="Meaning" title="What this ring is" />
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 12, lineHeight: 1.8 }}>
              <li>a physical reminder</li>
              <li>a simple object of recollection</li>
              <li>something to carry into ordinary life</li>
              <li>an honest piece of metal designed with restraint</li>
            </ul>
          </div>
          <div
            style={{
              padding: 28,
              borderRadius: 28,
              border: `1px solid ${palette.border}`,
              background: "rgba(255,255,255,0.46)",
            }}
          >
            <SectionHeading eyebrow="Restraint" title="What this ring is not" />
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 12, lineHeight: 1.8 }}>
              <li>not a promise</li>
              <li>not a spiritual shortcut</li>
              <li>not an official symbol of any tradition</li>
              <li>not a claim that an object can do the work for you</li>
            </ul>
          </div>
        </section>

        <section
          style={{
            padding: "0 0 84px",
            maxWidth: 760,
          }}
        >
          <SectionHeading eyebrow="Reflection" title="A simple line instead of testimonials" />
          <p style={{ margin: 0, fontSize: 23, lineHeight: 1.7, fontFamily: serifStack, color: "#5e5146" }}>
            Made for those learning to sit with their own thoughts, sensations, and inner weather.
          </p>
        </section>

        <section style={{ padding: "0 0 84px" }}>
          <SectionHeading
            eyebrow="FAQ"
            title="Practical details before checkout"
            body="This keeps friction low for someone who understands the object and only needs clarity."
          />
          <div style={{ display: "grid", gap: 14, maxWidth: 860 }}>
            {faqItems.map((item) => (
              <details
                key={item.question}
                style={{
                  padding: "18px 22px",
                  borderRadius: 22,
                  border: `1px solid ${palette.border}`,
                  background: "rgba(255,255,255,0.58)",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 600, listStyle: "none" }}>{item.question}</summary>
                <p style={{ margin: "12px 0 0", lineHeight: 1.8, color: palette.muted }}>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          style={{
            padding: 32,
            borderRadius: 34,
            border: `1px solid ${palette.border}`,
            background: `linear-gradient(135deg, rgba(255,255,255,0.76), rgba(237,226,212,0.92))`,
            display: "grid",
            gap: 18,
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: palette.muted,
            }}
          >
            Final Call
          </p>
          <h2 style={{ margin: 0, fontFamily: serifStack, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 500, lineHeight: 1.08 }}>
            If this object speaks to your practice, you can order one here.
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "14px 22px",
                borderRadius: 999,
                background: palette.button,
                color: palette.buttonText,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Buy the ring
            </a>
            <a
              href="#story"
              style={{
                padding: "14px 22px",
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                color: palette.text,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Read the story again
            </a>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: palette.muted }}>
            Contact{" "}
            <a href="mailto:support@iknowainhoa.com" style={{ color: palette.accent }}>
              support@iknowainhoa.com
            </a>{" "}
            for shipping, privacy, or terms questions.
          </p>
        </section>
      </div>
    </main>
  );
}
