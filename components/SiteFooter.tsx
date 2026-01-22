import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

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
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 16px 0" }}>
              Get in Touch
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
                <a
                  href={`mailto:${site.email}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                  className="hover:opacity-100"
                >
                  Email
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                  className="hover:opacity-100"
                >
                  Contact Page
                </Link>
              </li>
              {site.socials?.linkedin && (
                <li>
                  <a
                    href={site.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      opacity: 0.7,
                      transition: "opacity 0.2s",
                    }}
                    className="hover:opacity-100"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              {site.socials?.instagram && (
                <li>
                  <a
                    href={site.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      opacity: 0.7,
                      transition: "opacity 0.2s",
                    }}
                    className="hover:opacity-100"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
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
