import { externalAnchorProps } from "@/lib/links";
import { siteWhatsAppEnquiryHref } from "@/lib/site";
import type { TechCopy } from "@/lib/tech/i18n";
import { formatNationalPhone, telHref } from "@/lib/tech/phone";
import WhatsAppMark from "@/components/tech/WhatsAppMark";
import { IconPhone } from "@/components/tech/TechIllustrations";

export default function TechContactLinks({
  copy,
  message,
  className = "tme-contact-row",
  showWhatsApp = true,
  preferCallLabel,
}: {
  copy: TechCopy;
  message?: string;
  className?: string;
  showWhatsApp?: boolean;
  /** When set, shows a single-line call CTA (e.g. “Prefiero llamar”) instead of label + number stack. */
  preferCallLabel?: string;
}) {
  const whatsappHref = siteWhatsAppEnquiryHref(message);
  const phone = formatNationalPhone();
  return (
    <div className={className}>
      {preferCallLabel ? (
        <a className="tme-btn tme-btn-teal" href={telHref()}>
          <IconPhone />
          {preferCallLabel}
        </a>
      ) : (
        <a className="tme-btn tme-btn-teal tme-call" href={telHref()}>
          <span className="tme-call-label">{copy.call}</span>
          <span className="tme-call-number">{phone}</span>
        </a>
      )}
      {showWhatsApp ? (
        <a className="tme-btn tme-btn-wa" href={whatsappHref} {...externalAnchorProps(whatsappHref)}>
          <WhatsAppMark />
          <span>{copy.whatsapp}</span>
        </a>
      ) : null}
    </div>
  );
}
