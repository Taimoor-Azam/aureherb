import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_COST_MODULE } from "../../../../../modules/product-cost"
import ProductCostModuleService from "../../../../../modules/product-cost/service"
import { marginPercent, roundMoney } from "../../../../../modules/product-cost/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id

  if (!orderId) {
    return res.status(400).json({ message: "Order id is required" })
  }

  const costService: ProductCostModuleService =
    req.scope.resolve(PRODUCT_COST_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "status", "currency_code", "canceled_at"],
    filters: { id: orderId },
  })

  const order = orders?.[0] as any
  if (!order) {
    return res.status(404).json({ message: "Order not found" })
  }

  const lines = await costService.listOrderLineCostSnapshots(
    { order_id: orderId },
    { order: { created_at: "ASC" } }
  )

  if (!lines.length) {
    return res.json({
      order_id: orderId,
      display_id: order.display_id,
      has_snapshots: false,
      lines: [],
      revenue: 0,
      cogs: 0,
      profit: 0,
      margin_percent: null,
      missing_cost_lines: 0,
      currency_code: order.currency_code || "pkr",
    })
  }

  let revenue = 0
  let cogs = 0
  let profit = 0
  let missingCostLines = 0

  const mapped = lines.map((line: any) => {
    revenue += Number(line.line_revenue) || 0
    cogs += Number(line.line_cogs) || 0
    profit += Number(line.line_profit) || 0
    if (line.missing_cost) {
      missingCostLines += 1
    }
    return {
      id: line.id,
      line_item_id: line.line_item_id,
      variant_id: line.variant_id,
      product_id: line.product_id,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
      unit_revenue: line.unit_revenue,
      line_cogs: line.line_cogs,
      line_revenue: line.line_revenue,
      line_profit: line.line_profit,
      missing_cost: line.missing_cost,
      currency_code: line.currency_code,
    }
  })

  res.json({
    order_id: orderId,
    display_id: order.display_id,
    has_snapshots: true,
    lines: mapped,
    revenue: roundMoney(revenue),
    cogs: roundMoney(cogs),
    profit: roundMoney(profit),
    margin_percent: marginPercent(profit, revenue),
    missing_cost_lines: missingCostLines,
    currency_code: order.currency_code || "pkr",
  })
}
