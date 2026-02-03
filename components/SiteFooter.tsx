import Link from "next/link";
import { site } from "@/lib/site";
import { headers } from "next/headers";
import LikeCounter from "@/components/LikeCounter";
import { Mail, Linkedin, Instagram, Send, type LucideIcon } from "lucide-react";

export default async function SiteFooter() {
  const hdrs = await headers();
  const countryHeader = hdrs.get("x-vercel-ip-country");
  const countryCode = countryHeader && countryHeader.length === 2 ? countryHeader.toUpperCase() : "US";
  const flag = codeToFlag(countryCode);
  const currentYear = new Date().getFullYear();

  const contactLinks: {
    key: string;
    href: string;
    label: string;
    Icon: LucideIcon;
    external?: boolean;
  }[] = [
    { key: "email", href: `mailto:${site.email}`, label: "Email", Icon: Mail },
    { key: "contact", href: "/contact#contact-form", label: "Contact form", Icon: Send },
    site.socials?.linkedin
      ? { key: "linkedin", href: site.socials.linkedin, label: "LinkedIn", Icon: Linkedin, external: true }
      : null,
    site.socials?.instagram
      ? { key: "instagram", href: site.socials.instagram, label: "Instagram", Icon: Instagram, external: true }
      : null,
  ].filter(Boolean) as {
    key: string;
    href: string;
    label: string;
    Icon: LucideIcon;
    external?: boolean;
  }[];

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "48px 32px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "var(--muted)",
        marginTop: 64,
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* About Column */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 16px 0" }}>
              {site.name}
            </h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
              {site.description}
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 16px 0" }}>
              Pages
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <li>
                <Link
                  href="/"
                  style={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}
                  className="hover:opacity-100"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  style={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}
                  className="hover:opacity-100"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  style={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}
                  className="hover:opacity-100"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  style={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}
                  className="hover:opacity-100"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  style={{ textDecoration: "none", color: "inherit", opacity: 0.7, display: "inline-flex", alignItems: "center", gap: 6 }}
                  className="hover:opacity-100"
                >
                  Support <span aria-hidden="true" style={{ fontSize: "1.05em" }}>♥</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px 0" }}>
              Get in Touch
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {contactLinks.map(({ key, href, label, Icon, external }) =>
                external ? (
                  <a
                    key={key}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      opacity: 0.9,
                      display: "inline-flex",
                      transition: "opacity 0.2s, transform 0.2s",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--muted)",
                      color: "inherit",
                      border: "1px solid var(--border)",
                    }}
                    className="hover:opacity-100"
                  >
                    <Icon size={20} />
                  </a>
                ) : (
                  <Link
                    key={key}
                    href={href}
                    aria-label={label}
                    style={{
                      opacity: 0.9,
                      display: "inline-flex",
                      transition: "opacity 0.2s, transform 0.2s",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--muted)",
                      color: "inherit",
                      border: "1px solid var(--border)",
                    }}
                    className="hover:opacity-100"
                  >
                    <Icon size={20} />
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Fun Counter */}
          <div>
            <LikeCounter flag={flag} countryCode={countryCode} variant="inline" />
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            textAlign: "center",
            fontSize: "0.85rem",
            opacity: 0.7,
          }}
        >
          <p style={{ margin: 0 }}>
            © {currentYear} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function codeToFlag(code: string | null) {
  if (!code || code.length !== 2) return "🌐";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + code.charCodeAt(0) - 65,
    A + code.charCodeAt(1) - 65
  );
}
