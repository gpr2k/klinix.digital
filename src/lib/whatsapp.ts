/** Utilities for Brazilian WhatsApp/phone formatting. */

/** Strips everything that is not a digit. */
export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '');
}

/** Formats up to 11 digits as `(XX) XXXXX-XXXX` (or 10 as `(XX) XXXX-XXXX`).
 *  Truncates extra digits silently. */
export function formatWhatsapp(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
