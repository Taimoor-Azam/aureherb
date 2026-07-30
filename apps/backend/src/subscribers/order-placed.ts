import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { buildOrderPlacedEmail } from "../utils/order-emails"

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
        "items.title",
        "items.quantity",
        "items.unit_price",
        "items.subtitle",
        "shipping_address.*",
      ],
      filters: {
        id: data.id,
      },
    })

    const order = orders?.[0]
    if (!order?.email) {
      logger.warn(`order.placed: no email for order ${data.id}, skipping email`)
      return
    }

    const content = buildOrderPlacedEmail({
      id: order.id,
      display_id: order.display_id,
      email: order.email,
      currency_code: order.currency_code,
      total: order.total,
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
  } catch (error) {
    logger.error(
      `order.placed: failed to send confirmation email for ${data.id}`,
      error
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
