import Link from "next/link";
import BlankPage from "@/components/BlankPage";
import { publicPages } from "@/lib/site";

export default function ShopPage() {
  if (!publicPages.shop) return <BlankPage />;

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 880, margin: "0 auto" }}>
      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 24,
          background: "var(--card)",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", opacity: 0.65 }}>
          Product Landing
        </p>
        <h1 style={{ margin: "10px 0 10px", fontSize: 42, lineHeight: 1.1 }}>
          Carry your 10-day retreat into everyday life.
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.85, maxWidth: 760 }}>
          A hand-stamped metal token engraved with a simple reminder - Anicca, Metta, or your own words - so you remember the practice when life gets loud.
        </p>

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="#inscription"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 16px",
              borderRadius: 10,
              background: "var(--foreground)",
              color: "var(--background)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Choose your phrase
          </a>
          <a
            href="#inscription"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              textDecoration: "none",
              fontWeight: 600,
              color: "inherit",
            }}
          >
            Personalise mine
          </a>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ margin: "0 0 12px" }}>Why people choose it</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>A pause button in your pocket - touch it, breathe, feel.</li>
          <li>A symbol of what you completed - discipline, silence, insight.</li>
          <li>A daily cue for equanimity - not just a memory, a practice.</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ margin: "0 0 10px" }}>Why it matters</h2>
        <p style={{ margin: 0, lineHeight: 1.75 }}>
          You did not do 10 days to go back to autopilot. This token is a small, durable anchor - so meetings, commutes, and hard conversations become invitations to observe and accept.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ margin: "0 0 10px" }}>How it works</h2>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Keep it on your keys / bag / cord / pocket.</li>
          <li>When you notice it, take one mindful breath.</li>
          <li>Repeat your reminder: Anicca / This too shall pass / your phrase.</li>
        </ol>
      </section>

      <section id="inscription" style={{ marginTop: 28 }}>
        <h2 style={{ margin: "0 0 10px" }}>Choose your inscription</h2>
        <p style={{ margin: "0 0 12px", opacity: 0.8 }}>Pick a mantra:</p>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Anicca</li>
          <li>Metta</li>
          <li>Equanimity</li>
          <li>This too shall pass</li>
          <li>Personalised (your phrase + optional year)</li>
        </ul>
        <p style={{ margin: "12px 0 0", opacity: 0.8 }}>
          Character limit for clean stamping: 24 characters (including spaces).
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ margin: "0 0 10px" }}>Product details</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Hand-stamped metal token.</li>
          <li>Each piece is slightly unique (handmade character).</li>
          <li>Optional: keyring / cord / gift pouch.</li>
          <li>Dimensions, weight, and material will be listed here once measured.</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ margin: "0 0 10px" }}>Micro-testimonials</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>&quot;I touched it before a tough call and it worked like a reset.&quot;</li>
          <li>&quot;It reminds me why I sat the course.&quot;</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ margin: "0 0 10px" }}>FAQ</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Is it affiliated with any Vipassana centre?</h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>No. This is an independent product and not affiliated with any centre or organisation.</p>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Will the stamping be perfectly uniform?</h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>No. It is handmade, so slight variations are expected and part of the character.</p>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Can I customise text?</h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>Yes. You can choose a personalised phrase within the character limit.</p>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Shipping, returns, and gift packaging?</h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>Shipping times, returns, and gift packaging options will be listed before checkout.</p>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: 34,
          borderTop: "1px solid var(--border)",
          paddingTop: 24,
          display: "grid",
          gap: 10,
        }}
      >
        <h2 style={{ margin: 0 }}>Keep the practice close.</h2>
        <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.85 }}>
          Choose your reminder and carry it into the moments that matter.
        </p>
        <div>
          <Link
            href="#inscription"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "11px 18px",
              borderRadius: 10,
              background: "var(--foreground)",
              color: "var(--background)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Order your token
          </Link>
        </div>
      </section>
    </main>
  );
}
