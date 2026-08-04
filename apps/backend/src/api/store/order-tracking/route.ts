import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { toAmountNumber } from "../../../utils/money"
import {
  formatOrderReference,
  parseOrderReference,
} from "../../../utils/order-reference"

type TrackingLookupBody = {
  reference?: string
}

export async function POST(
  req: MedusaRequest<TrackingLookupBody>,
  res: MedusaResponse
) {
  const reference = req.body?.reference?.trim()

  if (!reference) {
    return res.status(400).json({
      message: "Tracking ID is required.",
    })
  }

  const displayId = parseOrderReference(reference)

  if (!displayId) {
    return res.status(400).json({
      message: "Invalid tracking ID.",
    })
  }

  const query = req.scope.resolve("query")

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "email",
      "currency_code",
      "status",
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
      display_id: String(displayId),
    },
  })

  const order = orders?.[0] as any

  if (!order) {
    return res.status(404).json({
      message: "Order not found.",
    })
  }

  const summary = order.summary || {}

  return res.json({
    order: {
      display_id: order.display_id,
      reference: formatOrderReference(order.display_id),
      created_at: order.created_at,
      email: order.email,
      currency_code: order.currency_code,
      fulfillment_status:
        summary.fulfillment_status || order.status || null,
      subtotal: toAmountNumber(order.subtotal ?? summary.subtotal),
      item_subtotal: toAmountNumber(
        order.item_subtotal ?? summary.item_subtotal ?? order.subtotal
      ),
      shipping_total: toAmountNumber(
        order.shipping_total ?? summary.shipping_total
      ),
      total: toAmountNumber(order.total ?? summary.total),
      items: (order.items || [])
        .filter(Boolean)
        .map(
          (item: {
            title?: string | null
            quantity?: unknown
          }) => ({
            title: item.title || "Item",
            quantity: toAmountNumber(item.quantity) ?? 0,
          })
        ),
      shipping_address: order.shipping_address
        ? {
            first_name: order.shipping_address.first_name,
            last_name: order.shipping_address.last_name,
            address_1: order.shipping_address.address_1,
            address_2: order.shipping_address.address_2,
            city: order.shipping_address.city,
            province: order.shipping_address.province,
            postal_code: order.shipping_address.postal_code,
            country_code: order.shipping_address.country_code,
            phone: order.shipping_address.phone,
          }
        : null,
      shipping_methods: (order.shipping_methods || [])
        .filter(Boolean)
        .map(
          (method: {
            name?: string | null
            total?: unknown
          }) => ({
            name: method.name || "Shipping",
            total: toAmountNumber(method.total) ?? 0,
          })
        ),
    },
  })
}
