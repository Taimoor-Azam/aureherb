import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_COST_MODULE } from "../modules/product-cost"
import ProductCostModuleService from "../modules/product-cost/service"
import { marginPercent, roundMoney } from "../modules/product-cost/utils"
import { toAmountNumber } from "./money"

export type SnapshotRow = {
  id: string
  order_id: string
  line_item_id: string
  variant_id: string | null
  product_id: string | null
  quantity: number
  unit_cost: number
  unit_revenue: number
  currency_code: string
  line_cogs: number
  line_revenue: number
  line_profit: number
  missing_cost: boolean
  created_at: string | Date
}

export type DateRange = {
  from: Date
  to: Date
}

export function parseDateRange(from?: string, to?: string): DateRange | null {
  if (!from || !to) {
    return null
  }
  const fromDate = new Date(from)
  const toDate = new Date(to)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return null
  }
  return { from: fromDate, to: toDate }
}

/**
 * Load cost snapshots in a date range, excluding canceled orders.
 */
export async function loadReportSnapshots(
  container: MedusaContainer,
  range: DateRange
): Promise<SnapshotRow[]> {
  const costService: ProductCostModuleService =
    container.resolve(PRODUCT_COST_MODULE)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const snapshots = (await costService.listOrderLineCostSnapshots(
    {
      created_at: {
        $gte: range.from.toISOString(),
        $lte: range.to.toISOString(),
      },
    },
    {
      order: { created_at: "DESC" },
    }
  )) as SnapshotRow[]

  if (!snapshots.length) {
    return []
  }

  const orderIds = [...new Set(snapshots.map((s) => s.order_id))]

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "status", "canceled_at"],
    filters: {
      id: orderIds,
    },
  })

  const canceledIds = new Set(
    (orders || [])
      .filter(
        (o: any) =>
          o.status === "canceled" ||
          o.canceled_at != null
      )
      .map((o: any) => o.id as string)
  )

  return snapshots.filter((s) => !canceledIds.has(s.order_id))
}

export function summarizeSnapshots(snapshots: SnapshotRow[]) {
  let revenue = 0
  let cogs = 0
  let profit = 0
  let missingCostLines = 0
  const orderIds = new Set<string>()

  for (const row of snapshots) {
    orderIds.add(row.order_id)
    revenue += Number(row.line_revenue) || 0
    cogs += Number(row.line_cogs) || 0
    profit += Number(row.line_profit) || 0
    if (row.missing_cost) {
      missingCostLines += 1
    }
  }

  return {
    revenue: roundMoney(revenue),
    cogs: roundMoney(cogs),
    profit: roundMoney(profit),
    margin_percent: marginPercent(profit, revenue),
    order_count: orderIds.size,
    line_count: snapshots.length,
    missing_cost_lines: missingCostLines,
    currency_code: "pkr",
  }
}

export function aggregateByProduct(snapshots: SnapshotRow[]) {
  const map = new Map<
    string,
    {
      product_id: string
      revenue: number
      cogs: number
      profit: number
      quantity: number
      missing_cost_lines: number
      order_ids: Set<string>
    }
  >()

  for (const row of snapshots) {
    const key = row.product_id || "unknown"
    let entry = map.get(key)
    if (!entry) {
      entry = {
        product_id: key,
        revenue: 0,
        cogs: 0,
        profit: 0,
        quantity: 0,
        missing_cost_lines: 0,
        order_ids: new Set(),
      }
      map.set(key, entry)
    }
    entry.revenue += Number(row.line_revenue) || 0
    entry.cogs += Number(row.line_cogs) || 0
    entry.profit += Number(row.line_profit) || 0
    entry.quantity += Number(row.quantity) || 0
    entry.order_ids.add(row.order_id)
    if (row.missing_cost) {
      entry.missing_cost_lines += 1
    }
  }

  return [...map.values()]
    .map((e) => ({
      product_id: e.product_id,
      revenue: roundMoney(e.revenue),
      cogs: roundMoney(e.cogs),
      profit: roundMoney(e.profit),
      margin_percent: marginPercent(e.profit, e.revenue),
      quantity: e.quantity,
      order_count: e.order_ids.size,
      missing_cost_lines: e.missing_cost_lines,
      currency_code: "pkr",
    }))
    .sort((a, b) => b.profit - a.profit)
}

export function aggregateByOrder(snapshots: SnapshotRow[]) {
  const map = new Map<
    string,
    {
      order_id: string
      revenue: number
      cogs: number
      profit: number
      missing_cost_lines: number
      created_at: string | Date
    }
  >()

  for (const row of snapshots) {
    let entry = map.get(row.order_id)
    if (!entry) {
      entry = {
        order_id: row.order_id,
        revenue: 0,
        cogs: 0,
        profit: 0,
        missing_cost_lines: 0,
        created_at: row.created_at,
      }
      map.set(row.order_id, entry)
    }
    entry.revenue += Number(row.line_revenue) || 0
    entry.cogs += Number(row.line_cogs) || 0
    entry.profit += Number(row.line_profit) || 0
    if (row.missing_cost) {
      entry.missing_cost_lines += 1
    }
  }

  return [...map.values()]
    .map((e) => ({
      order_id: e.order_id,
      revenue: roundMoney(e.revenue),
      cogs: roundMoney(e.cogs),
      profit: roundMoney(e.profit),
      margin_percent: marginPercent(e.profit, e.revenue),
      missing_cost_lines: e.missing_cost_lines,
      created_at: e.created_at,
      currency_code: "pkr",
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}

export function lineRevenueFromItem(item: {
  total?: unknown
  unit_price?: unknown
  quantity?: number | null
}): { lineRevenue: number; unitRevenue: number; quantity: number } {
  const quantity = Number(item.quantity) || 0
  const lineRevenue =
    toAmountNumber(item.total) ??
    (toAmountNumber(item.unit_price) ?? 0) * quantity
  const unitRevenue =
    quantity > 0
      ? roundMoney(lineRevenue / quantity)
      : toAmountNumber(item.unit_price) ?? 0

  return {
    lineRevenue: roundMoney(lineRevenue),
    unitRevenue,
    quantity,
  }
}
