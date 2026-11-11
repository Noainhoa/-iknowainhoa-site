const LOGO_SRC = "/images/tech/guardamar-click-badge-v2.png";

export function TechBrandLink({ href, name }: { href: string; name: string }) {
  return (
    <a className="tme-brand" href={href}>
      <img className="tme-brand-logo" src={LOGO_SRC} alt={name} width={72} height={72} decoding="async" />
    </a>
  );
}
