const ORDER_REFERENCE_PREFIX = "AH-"
const ORDER_REFERENCE_WIDTH = 6

export function formatOrderReference(displayId?: string | number | null): string | null {
  if (displayId == null) {
    return null
  }

  const numericDisplayId =
    typeof displayId === "number" ? displayId : Number.parseInt(String(displayId), 10)

  if (!Number.isFinite(numericDisplayId) || numericDisplayId <= 0) {
    return null
  }

  return `${ORDER_REFERENCE_PREFIX}${String(Math.trunc(numericDisplayId)).padStart(ORDER_REFERENCE_WIDTH, "0")}`
}

export function parseOrderReference(reference?: string | null): number | null {
  if (!reference) {
    return null
  }

  const normalized = reference.trim().toUpperCase()

  if (!normalized.startsWith(ORDER_REFERENCE_PREFIX)) {
    return null
  }

  const numericPart = normalized.slice(ORDER_REFERENCE_PREFIX.length).replace(/\s+/g, "")

  if (!/^\d+$/.test(numericPart)) {
    return null
  }

  const displayId = Number.parseInt(numericPart, 10)
  return Number.isFinite(displayId) && displayId > 0 ? displayId : null
}
