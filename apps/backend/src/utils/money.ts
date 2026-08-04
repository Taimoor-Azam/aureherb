/**
 * Medusa v2 stores monetary amounts in major currency units (e.g. 1250 = PKR 1,250).
 * Do not divide by 100 (that was Medusa v1 / cents behavior).
 */
export function toAmountNumber(amount: unknown): number | null {
  if (amount == null) {
    return null
  }
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : null
  }
  if (typeof amount === "string" && amount.trim() !== "") {
    const n = Number(amount)
    return Number.isFinite(n) ? n : null
  }
  if (typeof amount === "object") {
    const maybe = amount as { numeric?: unknown; value?: unknown }
    if (maybe.numeric != null) {
      return toAmountNumber(maybe.numeric)
    }
    if (maybe.value != null) {
      return toAmountNumber(maybe.value)
    }
  }
  return null
}

export function formatMoney(
  amount: unknown,
  currencyCode?: string | null
): string {
  const value = toAmountNumber(amount)
  if (value == null || Number.isNaN(value)) {
    return "—"
  }
  const code = (currencyCode || "PKR").toUpperCase()
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${code} ${value.toFixed(0)}`
  }
}
