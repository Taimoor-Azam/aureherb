import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  aggregateByOrder,
  loadReportSnapshots,
  parseDateRange,
} from "../../../../utils/profit-loss"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const range = parseDateRange(
    req.query.from as string | undefined,
    req.query.to as string | undefined
  )

  if (!range) {
    return res.status(400).json({
      message: "from and to query parameters (ISO dates) are required",
    })
  }

  const snapshots = await loadReportSnapshots(req.scope, range)
  const ordersAgg = aggregateByOrder(snapshots)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const orderIds = ordersAgg.map((o) => o.order_id)
  let displayIds = new Map<string, number | string>()

  if (orderIds.length) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "created_at"],
      filters: { id: orderIds },
    })
    displayIds = new Map(
      (data || []).map((o: any) => [o.id as string, o.display_id])
    )
  }

  res.json({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    orders: ordersAgg.map((o) => ({
      ...o,
      display_id: displayIds.get(o.order_id) ?? null,
    })),
  })
}
