import { site } from "@/lib/site";

/**
 * Digits-only key for storage / rate limits.
 * Accepts Spanish mobiles as 9 digits (6… / 7…) or with +34 / 0034.
 * Other international numbers stay as dialled digits (8–15).
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (!digits) return null;

  // 0034… → 34…
  if (digits.startsWith("0034")) digits = digits.slice(2);

  // National Spanish mobile (9 digits, starts with 6 or 7).
  if (/^[67]\d{8}$/.test(digits)) digits = `34${digits}`;

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
