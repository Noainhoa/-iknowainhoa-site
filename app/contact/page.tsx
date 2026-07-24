import { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { site } from "@/lib/site";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Ainhoa. Questions, collaborations, or just to say hello.",
};

export default async function ContactPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main style={{ padding: "32px 24px", fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
      <article>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 32px 0", lineHeight: 1.2 }}>
          {t.contact.title}
        </h1>

        {/* Intro Text */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ fontSize: "1.125rem", lineHeight: 1.8, opacity: 0.8, margin: 0 }}>
            {t.contact.intro}
          </p>
        </section>

        {/* Contact Methods */}
        <section style={{ marginBottom: 48 }}>
          {/* <div
            style={{
              padding: 24,
              backgroundColor: "var(--card)",
              borderRadius: 10,
              border: "1px solid var(--border)",
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              alignItems: "start",
            }}
          > */}
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", alignItems: "start", marginBottom: 48 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{t.contact.emailTitle}</h3>
              <p style={{ margin: 0, opacity: 0.7 }}>
                {t.contact.emailSubtitle}
              </p>
              <a
                href={`mailto:${site.email}`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-contrast)",
                  textDecoration: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "opacity 0.2s",
                }}
                className="hover:opacity-80"
              >
                {site.email}
              </a>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{t.contact.socialTitle}</h3>
              <p style={{ margin: 0, opacity: 0.7 }}>
                {t.contact.socialSubtitle}
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
                      color: "var(--primary-contrast)",
                      textDecoration: "none",
                      borderRadius: 6,
                      fontWeight: 600,
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
                      color: "var(--primary-contrast)",
                      textDecoration: "none",
                      borderRadius: 6,
                      fontWeight: 600,
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
        <section id="contact-form" style={{ marginBottom: 48, scrollMarginTop: 120 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 24px 0" }}>
            {t.contact.formTitle}
          </h2>
          <ContactForm />
        </section>

        {/* Response Time */}
        <section style={{ padding: 24, backgroundColor: "var(--muted)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px 0" }}>
            {t.contact.responseTitle}
          </h3>
          <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6 }}>
            {t.contact.responseBody}
          </p>
        </section>
      </article>
    </main>
  );
}
