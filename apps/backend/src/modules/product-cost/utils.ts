/**
 * Shared helpers for product cost / P&L calculations.
 * Amounts use major currency units (e.g. 1250 = PKR 1,250).
 */

export function marginPercent(profit: number, revenue: number): number | null {
  if (!revenue || revenue <= 0) {
    return null
  }
  return (profit / revenue) * 100
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}
