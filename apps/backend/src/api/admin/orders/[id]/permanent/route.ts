import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { PRODUCT_COST_MODULE } from "../../../../../modules/product-cost"
import ProductCostModuleService from "../../../../../modules/product-cost/service"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id

  if (!orderId) {
    return res.status(400).json({ message: "Order id is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "status", "canceled_at"],
    filters: { id: orderId },
  })

  const order = orders?.[0] as
    | { id: string; status?: string; canceled_at?: string | Date | null }
    | undefined

  if (!order) {
    return res.status(404).json({ message: "Order not found" })
  }

  const isCanceled =
    order.status === "canceled" || Boolean(order.canceled_at)

  if (!isCanceled) {
    return res.status(409).json({
      message: "Cancel the order first, then permanently delete it.",
    })
  }

  const costService: ProductCostModuleService =
    req.scope.resolve(PRODUCT_COST_MODULE)
  const snapshots = await costService.listOrderLineCostSnapshots({
    order_id: orderId,
  })

  if (snapshots.length) {
    await costService.deleteOrderLineCostSnapshots(
      snapshots.map((row: { id: string }) => row.id)
    )
  }

  const orderModule: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  await orderModule.deleteOrders(orderId)

  res.json({ deleted: true, id: orderId })
}
