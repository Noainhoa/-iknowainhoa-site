const LOGO_SRC = "/images/tech/guardamar-click-badge.png";

export function TechBrandLink({ href, name }: { href: string; name: string }) {
  return (
    <a className="tme-brand" href={href}>
      <img className="tme-brand-logo" src={LOGO_SRC} alt={name} width={112} height={112} decoding="async" />
    </a>
  );
}
