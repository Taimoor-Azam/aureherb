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
