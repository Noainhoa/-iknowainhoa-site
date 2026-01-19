import Link from "next/link";

export default function SiteHeader() {
  const navLinkStyle = {
    textDecoration: "none" as const,
    color: "inherit",
    transition: "opacity 0.2s",
  };

  return (
    <header style={{
      borderBottom: "1px solid #e5e5e5",
      padding: "16px 32px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <nav style={{
        maxWidth: 1000,
        margin: "0 auto",
        display: "flex",
        gap: 32,
        alignItems: "center",
      }}>
        <Link href="/" className="hover:opacity-60" style={{
          fontSize: 18,
          fontWeight: 600,
          ...navLinkStyle,
        }}>
          Home
        </Link>
        <Link href="/blog" className="hover:opacity-60" style={navLinkStyle}>
          Blog
        </Link>
        <Link href="/projects" className="hover:opacity-60" style={navLinkStyle}>
          Projects
        </Link>
        <Link href="/products" className="hover:opacity-60" style={navLinkStyle}>
          Products
        </Link>
        <Link href="/contact" className="hover:opacity-60" style={navLinkStyle}>
          Contact
        </Link>
      </nav>
    </header>
  );
}
