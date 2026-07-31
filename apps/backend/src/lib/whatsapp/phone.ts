/**
 * Normalize phone numbers for WhatsApp Cloud API (digits only, Pakistan default).
 * Examples: "+92 313 7022646" → "923137022646", "03137022646" → "923137022646"
 */
export function normalizeWhatsAppPhone(input?: string | null): string | null {
  if (!input) {
    return null
  }

  let digits = input.replace(/\D/g, "")
  if (!digits) {
    return null
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2)
  }

  // Local PK mobile: 03XXXXXXXXX → 923XXXXXXXXX
  if (digits.length === 11 && digits.startsWith("03")) {
    digits = `92${digits.slice(1)}`
  }

  // Missing country code: 3XXXXXXXXX (10 digits after leading 3)
  if (digits.length === 10 && digits.startsWith("3")) {
    digits = `92${digits}`
  }

  if (digits.length < 10) {
    return null
  }

  return digits
}

export function phonesMatch(a?: string | null, b?: string | null): boolean {
  const na = normalizeWhatsAppPhone(a)
  const nb = normalizeWhatsAppPhone(b)
  return Boolean(na && nb && na === nb)
}
