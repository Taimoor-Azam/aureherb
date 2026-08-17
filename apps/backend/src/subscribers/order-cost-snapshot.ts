import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_COST_MODULE } from "../modules/product-cost"
import ProductCostModuleService from "../modules/product-cost/service"
import { roundMoney } from "../modules/product-cost/utils"
import { lineRevenueFromItem } from "../utils/profit-loss"

export default async function orderCostSnapshotHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const costService: ProductCostModuleService =
    container.resolve(PRODUCT_COST_MODULE)

  try {
    const existing = await costService.listOrderLineCostSnapshots({
      order_id: data.id,
    })

    if (existing.length > 0) {
      logger.info(
        `order.placed cost snapshot: already exists for ${data.id}, skipping`
      )
      return
    }

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "currency_code",
        "items.id",
        "items.quantity",
        "items.unit_price",
        "items.total",
        "items.variant_id",
        "items.product_id",
      ],
      filters: {
        id: data.id,
      },
    })

    const order = orders?.[0] as any
    if (!order) {
      logger.warn(`order.placed cost snapshot: order ${data.id} not found`)
      return
    }

    const items = (order.items || []).filter(Boolean)
    if (!items.length) {
      logger.info(
        `order.placed cost snapshot: no items on order ${data.id}`
      )
      return
    }

    const variantIds = [
      ...new Set(
        items
          .map((item: any) => item.variant_id as string | null)
          .filter(Boolean)
      ),
    ] as string[]

    const costs =
      variantIds.length > 0
        ? await costService.listVariantCosts({
            variant_id: variantIds,
          })
        : []

    const costByVariant = new Map(
      costs.map((c: any) => [c.variant_id as string, c])
    )

    const currency = (order.currency_code || "pkr").toLowerCase()

    const snapshots = items.map((item: any) => {
      const { lineRevenue, unitRevenue, quantity } = lineRevenueFromItem(item)
      const cost = item.variant_id
        ? costByVariant.get(item.variant_id)
        : undefined
      const missingCost = !cost
      const unitCost = missingCost ? 0 : Number(cost.unit_cost) || 0
      const lineCogs = roundMoney(unitCost * quantity)
      const lineProfit = roundMoney(lineRevenue - lineCogs)

      return {
        order_id: order.id,
        line_item_id: item.id,
        variant_id: item.variant_id || null,
        product_id: item.product_id || null,
        quantity,
        unit_cost: unitCost,
        unit_revenue: unitRevenue,
        currency_code: currency,
        line_cogs: lineCogs,
        line_revenue: lineRevenue,
        line_profit: lineProfit,
        missing_cost: missingCost,
      }
    })

    await costService.createOrderLineCostSnapshots(snapshots)

    logger.info(
      `order.placed cost snapshot: saved ${snapshots.length} lines for ${order.id}`
    )
  } catch (error) {
    logger.error(
      `order.placed cost snapshot: failed for ${data.id}`,
      error
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
