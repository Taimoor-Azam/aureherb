import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { phonesMatch } from "../../../lib/whatsapp/phone"
import { formatOrderReference, parseOrderReference } from "../../../utils/order-reference"

type TrackingLookupBody = {
  reference?: string
  emailOrPhone?: string
}

function normalizedEmail(value?: string | null) {
  return value?.trim().toLowerCase() || null
}

export async function POST(
  req: MedusaRequest<TrackingLookupBody>,
  res: MedusaResponse
) {
  const reference = req.body?.reference?.trim()
  const emailOrPhone = req.body?.emailOrPhone?.trim()

  if (!reference || !emailOrPhone) {
    return res.status(400).json({
      message: "Order reference and email or phone are required.",
    })
  }

  const displayId = parseOrderReference(reference)

  if (!displayId) {
    return res.status(400).json({
      message: "Invalid order reference.",
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
      "summary.*",
      "subtotal",
      "item_subtotal",
      "shipping_total",
      "total",
      "items.id",
      "items.title",
      "items.quantity",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.address_2",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_address.postal_code",
      "shipping_address.country_code",
      "shipping_address.phone",
      "shipping_methods.name",
      "shipping_methods.total",
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

  const matchesEmail =
    normalizedEmail(emailOrPhone) != null &&
    normalizedEmail(emailOrPhone) === normalizedEmail(order.email)

  const matchesPhone = phonesMatch(emailOrPhone, order.shipping_address?.phone)

  if (!matchesEmail && !matchesPhone) {
    return res.status(403).json({
      message: "We could not verify this order with that email or phone.",
    })
  }

  return res.json({
    order: {
      display_id: order.display_id,
      reference: formatOrderReference(order.display_id),
      created_at: order.created_at,
      email: order.email,
      currency_code: order.currency_code,
      fulfillment_status: order.summary?.fulfillment_status || order.status || null,
      payment_status: order.summary?.payment_status || null,
      subtotal: order.subtotal,
      item_subtotal: order.item_subtotal,
      shipping_total: order.shipping_total,
      total: order.total,
      items: (order.items || [])
        .filter(Boolean)
        .map((item: { title?: string | null; quantity?: number | null }) => ({
          title: item.title || "Item",
          quantity: item.quantity || 0,
        })),
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
        (method: { name?: string | null; total?: number | null }) => ({
          name: method.name || "Shipping",
          total: method.total || 0,
        })
      ),
    },
  })
}
