import { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Ainhoa. Questions, collaborations, or just to say hello.",
};

export default function ContactPage() {
  return (
    <main style={{ padding: "32px 24px", fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
      <article>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 32px 0", lineHeight: 1.2 }}>
          Get in Touch
        </h1>

        {/* Intro Text */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ fontSize: "1.125rem", lineHeight: 1.8, opacity: 0.8, margin: 0 }}>
            I'm always interested in hearing from you—whether it's about a project idea, a collaboration opportunity,
            feedback on something I've written, or just to connect.
          </p>
        </section>

        {/* Contact Methods */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 24px 0" }}>
            Ways to Reach Me
          </h2>

          <div style={{ display: "grid", gap: 32, marginBottom: 32 }}>
            {/* Email */}
            <div style={{ padding: 24, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px 0" }}>
                Email
              </h3>
              <p style={{ margin: "0 0 12px 0", opacity: 0.7 }}>
                The most direct way to reach me:
              </p>
              <a
                href={`mailto:${site.email}`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  backgroundColor: "#000",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 4,
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  transition: "opacity 0.2s",
                }}
                className="hover:opacity-80"
              >
                {site.email}
              </a>
            </div>

            {/* Socials */}
            <div style={{ padding: 24, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px 0" }}>
                Social Media
              </h3>
              <p style={{ margin: "0 0 12px 0", opacity: 0.7 }}>
                Connect or follow along:
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {site.socials?.linkedin && (
                  <a
                    href={site.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 16px",
                      backgroundColor: "#0A66C2",
                      color: "#fff",
                      textDecoration: "none",
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      transition: "opacity 0.2s",
                    }}
                    className="hover:opacity-80"
                  >
                    LinkedIn
                  </a>
                )}
                {site.socials?.instagram && (
                  <a
                    href={site.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 16px",
                      background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                      color: "#fff",
                      textDecoration: "none",
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      transition: "opacity 0.2s",
                    }}
                    className="hover:opacity-80"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 24px 0" }}>
            Send a Message
          </h2>
          <p style={{ opacity: 0.7, marginBottom: 24, lineHeight: 1.6 }}>
            Prefer a contact form? Fill out the details below and I'll get back to you as soon as I can.
          </p>

          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: 24,
              backgroundColor: "#f9f9f9",
              borderRadius: 8,
            }}
            action={`mailto:${site.email}`}
            method="POST"
            encType="text/plain"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label htmlFor="name" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 4,
                  fontFamily: "inherit",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label htmlFor="email" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 4,
                  fontFamily: "inherit",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label htmlFor="subject" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 4,
                  fontFamily: "inherit",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label htmlFor="message" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 4,
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 24px",
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "opacity 0.2s",
                alignSelf: "flex-start",
              }}
              className="hover:opacity-80"
            >
              Send Message
            </button>
          </form>

          <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: 16 }}>
            Note: This form uses the mailto: protocol. Your email client will open with your message, or you can
            email me directly at{" "}
            <a href={`mailto:${site.email}`} style={{ color: "inherit", textDecoration: "underline" }}>
              {site.email}
            </a>
            .
          </p>
        </section>

        {/* Response Time */}
        <section style={{ padding: 24, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px 0" }}>
            Response Time
          </h3>
          <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6 }}>
            I try to respond to all messages within 48 hours. If it's urgent, feel free to reach out on social media
            or LinkedIn as well.
          </p>
        </section>
      </article>
    </main>
  );
}
