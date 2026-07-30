import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { buildOrderShippedEmail } from "../utils/order-emails"

type ShipmentCreatedPayload = {
  id: string
  no_notification?: boolean
}

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<ShipmentCreatedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (data.no_notification) {
    logger.info(
      `shipment.created: notifications disabled for fulfillment ${data.id}`
    )
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(
    Modules.NOTIFICATION
  ) as INotificationModuleService

  try {
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: [
        "id",
        "tracking_numbers",
        "order.id",
        "order.display_id",
        "order.email",
        "order.currency_code",
        "order.total",
        "order.items.title",
        "order.items.quantity",
        "order.items.unit_price",
        "order.items.subtitle",
        "order.shipping_address.*",
      ],
      filters: {
        id: data.id,
      },
    })

    const fulfillment = fulfillments?.[0]
    const order = fulfillment?.order as
      | {
          id?: string
          display_id?: number | null
          email?: string | null
          currency_code?: string | null
          total?: number | null
          items?: Array<{
            title?: string | null
            quantity?: number | null
            unit_price?: number | null
            subtitle?: string | null
          }> | null
          shipping_address?: Record<string, unknown> | null
        }
      | undefined

    // Fallback: some graphs expose order via order_link / separate query
    let resolvedOrder = order
    if (!resolvedOrder?.email) {
      const { data: orderFulfillments } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "email",
          "currency_code",
          "total",
          "items.title",
          "items.quantity",
          "items.unit_price",
          "items.subtitle",
          "shipping_address.*",
          "fulfillments.id",
        ],
        filters: {
          fulfillments: {
            id: data.id,
          },
        },
      })
      resolvedOrder = orderFulfillments?.[0]
    }

    if (!resolvedOrder?.email) {
      logger.warn(
        `shipment.created: could not resolve order email for fulfillment ${data.id}`
      )
      return
    }

    const trackingNumbers = Array.isArray(fulfillment?.tracking_numbers)
      ? (fulfillment.tracking_numbers as string[])
      : []

    const content = buildOrderShippedEmail({
      id: resolvedOrder.id || data.id,
      display_id: resolvedOrder.display_id,
      email: resolvedOrder.email,
      currency_code: resolvedOrder.currency_code,
      total: resolvedOrder.total,
      items: resolvedOrder.items,
      shipping_address: resolvedOrder.shipping_address as any,
      tracking_numbers: trackingNumbers,
    })

    await notificationModuleService.createNotifications({
      to: resolvedOrder.email,
      channel: "email",
      template: "order-shipped",
      content,
    })

    logger.info(
      `shipment.created: shipped email sent for order ${resolvedOrder.id}`
    )
  } catch (error) {
    logger.error(
      `shipment.created: failed to send shipped email for fulfillment ${data.id}`,
      error
    )
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
