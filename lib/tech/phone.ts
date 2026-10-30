import { site } from "@/lib/site";

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function formatNationalPhone(digits = site.whatsapp): string {
  const national = digits.startsWith("34") && digits.length === 11 ? digits.slice(2) : digits;
  return national.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
}

export function telHref(digits = site.whatsapp): string {
  return `tel:+${digits}`;
}
