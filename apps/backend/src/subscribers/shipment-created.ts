import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { buildOrderShippedEmail } from "../utils/order-emails"
import {
  isWhatsAppConfigured,
  sendOrderShippedNotice,
} from "../lib/whatsapp/client"
import { normalizeWhatsAppPhone } from "../lib/whatsapp/phone"

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
        "order.item_subtotal",
        "order.shipping_total",
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

    const fulfillment = fulfillments?.[0] as any
    let resolvedOrder = fulfillment?.order as any

    if (!resolvedOrder?.email && !resolvedOrder?.shipping_address) {
      const { data: orderFulfillments } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "email",
          "currency_code",
          "total",
          "item_subtotal",
          "shipping_total",
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
        } as any,
      })
      resolvedOrder = orderFulfillments?.[0] as any
    }

    const trackingNumbers = Array.isArray(fulfillment?.tracking_numbers)
      ? (fulfillment.tracking_numbers as string[])
      : []

    if (resolvedOrder?.email) {
      const content = buildOrderShippedEmail({
        id: resolvedOrder.id || data.id,
        display_id: resolvedOrder.display_id,
        email: resolvedOrder.email,
        currency_code: resolvedOrder.currency_code,
        total: resolvedOrder.total,
        item_subtotal: resolvedOrder.item_subtotal,
        shipping_total: resolvedOrder.shipping_total,
        items: resolvedOrder.items,
        shipping_address: resolvedOrder.shipping_address,
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
    } else {
      logger.warn(
        `shipment.created: could not resolve order email for fulfillment ${data.id}`
      )
    }

    const phone = normalizeWhatsAppPhone(resolvedOrder?.shipping_address?.phone)

    if (phone && isWhatsAppConfigured() && resolvedOrder) {
      try {
        await sendOrderShippedNotice({
          to: phone,
          displayId: resolvedOrder.display_id ?? resolvedOrder.id ?? data.id,
          tracking: trackingNumbers[0],
        })
        logger.info(
          `shipment.created: WhatsApp shipped notice sent for order ${resolvedOrder.id}`
        )
      } catch (waError) {
        logger.error(
          `shipment.created: WhatsApp notify failed for fulfillment ${data.id}`,
          waError
        )
      }
    }
  } catch (error) {
    logger.error(
      `shipment.created: failed to send shipped notice for fulfillment ${data.id}`,
      error
    )
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
