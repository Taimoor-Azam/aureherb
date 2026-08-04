import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { buildOrderPlacedEmail } from "../utils/order-emails"
import {
  isWhatsAppConfigured,
  sendOrderConfirmPrompt,
} from "../lib/whatsapp/client"
import {
  formatMoney,
  markWhatsAppConfirmPending,
} from "../lib/whatsapp/orders"
import { normalizeWhatsAppPhone } from "../lib/whatsapp/phone"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(
    Modules.NOTIFICATION
  ) as INotificationModuleService

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "subtotal",
        "item_subtotal",
        "shipping_total",
        "items.*",
        "shipping_methods.*",
        "summary.*",
        "shipping_address.*",
      ],
      filters: {
        id: data.id,
      },
    })

    const order = orders?.[0] as any
    if (!order) {
      logger.warn(`order.placed: order ${data.id} not found`)
      return
    }

    if (order.email) {
      const content = buildOrderPlacedEmail({
        id: order.id,
        display_id: order.display_id,
        email: order.email,
        currency_code: order.currency_code,
        total: order.total,
        item_subtotal: order.item_subtotal,
        shipping_total: order.shipping_total,
        items: order.items,
        shipping_address: order.shipping_address,
      })

      await notificationModuleService.createNotifications({
        to: order.email,
        channel: "email",
        template: "order-placed",
        content,
      })

      logger.info(`order.placed: confirmation email sent for ${order.id}`)
    } else {
      logger.warn(`order.placed: no email for order ${data.id}, skipping email`)
    }

    const phone = normalizeWhatsAppPhone(order.shipping_address?.phone)

    if (phone && isWhatsAppConfigured()) {
      try {
        const totalLabel = formatMoney(order.total, order.currency_code)
        await sendOrderConfirmPrompt({
          to: phone,
          displayId: order.display_id ?? order.id,
          orderId: order.id,
          totalLabel,
        })
        await markWhatsAppConfirmPending(container, order.id)
        logger.info(`order.placed: WhatsApp confirm prompt sent for ${order.id}`)
      } catch (waError) {
        logger.error(
          `order.placed: WhatsApp notify failed for ${order.id}`,
          waError
        )
      }
    }
  } catch (error) {
    logger.error(
      `order.placed: failed to send confirmation for ${data.id}`,
      error
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
