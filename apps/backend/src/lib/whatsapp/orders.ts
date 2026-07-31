import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  addShippingMethodToCartWorkflow,
  cancelOrderWorkflow,
  completeCartWorkflow,
  createCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  listShippingOptionsForCartWithPricingWorkflow,
  updateOrderWorkflow,
} from "@medusajs/medusa/core-flows"
import { normalizeWhatsAppPhone, phonesMatch } from "./phone"

export type WhatsAppOrderSummary = {
  id: string
  display_id: number | string | null
  email: string | null
  currency_code: string | null
  total: number | null
  status?: string | null
  created_at?: string | Date | null
  metadata?: Record<string, unknown> | null
  shipping_address?: Record<string, unknown> | null
  items?: Array<{
    title?: string | null
    quantity?: number | null
    variant_id?: string | null
    unit_price?: number | null
  }> | null
}

const ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "total",
  "status",
  "created_at",
  "metadata",
  "shipping_address.*",
  "items.title",
  "items.quantity",
  "items.variant_id",
  "items.unit_price",
  "region_id",
  "sales_channel_id",
] as const

export function formatMoney(
  amount: number | null | undefined,
  currencyCode?: string | null
) {
  if (amount == null || Number.isNaN(amount)) {
    return "—"
  }
  const value = amount / 100
  const code = (currencyCode || "PKR").toUpperCase()
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${code} ${value.toFixed(0)}`
  }
}

export async function getOrderById(
  container: MedusaContainer,
  orderId: string
): Promise<WhatsAppOrderSummary | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [...ORDER_FIELDS],
    filters: { id: orderId },
  })
  return (orders?.[0] as WhatsAppOrderSummary) || null
}

/**
 * Find recent orders whose shipping phone matches (after normalization).
 * Scans recent orders — fine for low WhatsApp volume.
 */
export async function findOrdersByPhone(
  container: MedusaContainer,
  phone: string,
  limit = 5
): Promise<WhatsAppOrderSummary[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [...ORDER_FIELDS],
    pagination: {
      skip: 0,
      take: 80,
      order: { created_at: "DESC" },
    },
  })

  const matched = ((orders || []) as WhatsAppOrderSummary[]).filter((order) =>
    phonesMatch(phone, (order.shipping_address as { phone?: string } | null)?.phone)
  )

  return matched.slice(0, limit)
}

export async function findPendingConfirmOrder(
  container: MedusaContainer,
  phone: string
): Promise<WhatsAppOrderSummary | null> {
  const orders = await findOrdersByPhone(container, phone, 10)
  return (
    orders.find((order) => {
      const meta = order.metadata || {}
      return (
        meta.whatsapp_confirm_pending === true &&
        !meta.whatsapp_confirmed_at &&
        order.status !== "canceled"
      )
    }) || null
  )
}

async function mergeOrderMetadata(
  container: MedusaContainer,
  orderId: string,
  patch: Record<string, unknown>
) {
  const order = await getOrderById(container, orderId)
  if (!order) {
    throw new Error(`Order ${orderId} not found`)
  }

  const metadata = {
    ...(order.metadata || {}),
    ...patch,
  }

  await updateOrderWorkflow(container).run({
    input: {
      id: orderId,
      user_id: process.env.WHATSAPP_SYSTEM_USER_ID || "whatsapp_bot",
      metadata,
    },
  })
}

export async function markWhatsAppConfirmPending(
  container: MedusaContainer,
  orderId: string
) {
  await mergeOrderMetadata(container, orderId, {
    whatsapp_confirm_pending: true,
    whatsapp_confirm_sent_at: new Date().toISOString(),
  })
}

export async function confirmOrderViaWhatsApp(
  container: MedusaContainer,
  orderId: string,
  phone: string
) {
  const order = await getOrderById(container, orderId)
  if (!order) {
    return { ok: false as const, message: "Order not found." }
  }

  if (
    !phonesMatch(
      phone,
      (order.shipping_address as { phone?: string } | null)?.phone
    )
  ) {
    return { ok: false as const, message: "That order is not linked to this WhatsApp number." }
  }

  if (order.status === "canceled") {
    return { ok: false as const, message: `Order #${order.display_id} was already cancelled.` }
  }

  await mergeOrderMetadata(container, orderId, {
    whatsapp_confirmed_at: new Date().toISOString(),
    whatsapp_confirm_pending: false,
    whatsapp_confirmed_from: normalizeWhatsAppPhone(phone),
  })

  return {
    ok: true as const,
    message: `Thank you! Order #${order.display_id} is confirmed. We'll prepare it for shipping.`,
    order,
  }
}

export async function cancelOrderViaWhatsApp(
  container: MedusaContainer,
  orderId: string,
  phone: string
) {
  const order = await getOrderById(container, orderId)
  if (!order) {
    return { ok: false as const, message: "Order not found." }
  }

  if (
    !phonesMatch(
      phone,
      (order.shipping_address as { phone?: string } | null)?.phone
    )
  ) {
    return { ok: false as const, message: "That order is not linked to this WhatsApp number." }
  }

  if (order.status === "canceled") {
    return { ok: true as const, message: `Order #${order.display_id} is already cancelled.` }
  }

  try {
    await cancelOrderWorkflow(container).run({
      input: {
        order_id: orderId,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Could not cancel order"
    return {
      ok: false as const,
      message: `Sorry — we couldn't cancel order #${order.display_id}: ${msg}. Please message us on the website WhatsApp if it was already packed.`,
    }
  }

  await mergeOrderMetadata(container, orderId, {
    whatsapp_cancelled_at: new Date().toISOString(),
    whatsapp_confirm_pending: false,
    whatsapp_cancelled_from: normalizeWhatsAppPhone(phone),
  }).catch(() => undefined)

  return {
    ok: true as const,
    message: `Order #${order.display_id} has been cancelled. If you paid anything online (you shouldn't for COD), contact support.`,
    order,
  }
}

function addressFromOrder(order: WhatsAppOrderSummary) {
  const a = (order.shipping_address || {}) as Record<string, unknown>
  return {
    first_name: String(a.first_name || "Customer"),
    last_name: String(a.last_name || ""),
    address_1: String(a.address_1 || ""),
    address_2: a.address_2 ? String(a.address_2) : undefined,
    city: String(a.city || ""),
    province: a.province ? String(a.province) : undefined,
    postal_code: a.postal_code ? String(a.postal_code) : undefined,
    country_code: String(a.country_code || "pk").toLowerCase(),
    phone: a.phone ? String(a.phone) : undefined,
  }
}

/**
 * Recreate a COD order from a prior order's line items + shipping address.
 */
export async function reorderFromHistory(
  container: MedusaContainer,
  sourceOrderId: string,
  phone: string
): Promise<{ ok: true; orderId: string; displayId: string | number | null } | { ok: false; message: string }> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const source = await getOrderById(container, sourceOrderId)

  if (!source) {
    return { ok: false, message: "Order not found." }
  }

  if (
    !phonesMatch(
      phone,
      (source.shipping_address as { phone?: string } | null)?.phone
    )
  ) {
    return { ok: false, message: "That order is not linked to this WhatsApp number." }
  }

  const items = (source.items || [])
    .filter((item) => item.variant_id && (item.quantity || 0) > 0)
    .map((item) => ({
      variant_id: String(item.variant_id),
      quantity: Number(item.quantity),
    }))

  if (!items.length) {
    return {
      ok: false,
      message:
        "We couldn't read items from that order. Please reorder on www.aureherb.com.",
    }
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  let regionId = (source as { region_id?: string }).region_id
  let salesChannelId = (source as { sales_channel_id?: string }).sales_channel_id

  if (!regionId) {
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      filters: { currency_code: "pkr" },
    })
    regionId = regions?.[0]?.id
  }

  if (!salesChannelId) {
    const { data: channels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
    })
    salesChannelId = channels?.[0]?.id
  }

  if (!regionId) {
    return { ok: false, message: "Store region is not configured. Please order on the website." }
  }

  const email =
    source.email ||
    `whatsapp+${normalizeWhatsAppPhone(phone)}@orders.aureherb.com`

  try {
    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id: regionId,
        sales_channel_id: salesChannelId,
        email,
        shipping_address: addressFromOrder(source),
        billing_address: addressFromOrder(source),
        items,
        metadata: {
          source: "whatsapp_reorder",
          source_order_id: sourceOrderId,
        },
      },
    })

    const cartId = cart.id

    const { result: shippingOptions } =
      await listShippingOptionsForCartWithPricingWorkflow(container).run({
        input: { cart_id: cartId },
      })

    const option = shippingOptions?.[0]
    if (!option?.id) {
      return {
        ok: false,
        message:
          "No shipping option available for that address. Please order on www.aureherb.com.",
      }
    }

    await addShippingMethodToCartWorkflow(container).run({
      input: {
        cart_id: cartId,
        options: [{ id: option.id }],
      },
    })

    const { result: paymentCollection } =
      await createPaymentCollectionForCartWorkflow(container).run({
        input: { cart_id: cartId },
      })

    await createPaymentSessionsWorkflow(container).run({
      input: {
        payment_collection_id: paymentCollection.id,
        provider_id: "pp_system_default",
      },
    })

    const { result: completed } = await completeCartWorkflow(container).run({
      input: { id: cartId },
    })

    const newOrderId = completed.id
    const newOrder = await getOrderById(container, newOrderId)

    logger.info(
      `whatsapp reorder: ${sourceOrderId} → ${newOrderId} for ${normalizeWhatsAppPhone(phone)}`
    )

    return {
      ok: true,
      orderId: newOrderId,
      displayId: newOrder?.display_id ?? null,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    logger.error(`whatsapp reorder failed for ${sourceOrderId}: ${msg}`, error)
    return {
      ok: false,
      message: `Could not place reorder (${msg}). Stock may be unavailable — please try www.aureherb.com.`,
    }
  }
}

/** Load short product facts for the oils AI prompt. */
export async function loadOilsProductFacts(
  container: MedusaContainer
): Promise<string> {
  const staticFaq = [
    "- Hair Growth Oil: herbal scalp oil for massage. Warm a little, apply to scalp/roots, massage gently, leave overnight or 1–2 hours, then wash.",
    "- Payment: Cash on delivery (COD) in Pakistan. Shop: www.aureherb.com",
    "- Not a pharmaceutical drug; keep claims gentle and practical.",
  ].join("\n")

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "title",
        "handle",
        "description",
        "status",
      ],
      filters: {
        status: "published",
      },
    })

    const lines = (products || []).slice(0, 12).map((p: any) => {
      const desc = String(p.description || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 280)
      return `- ${p.title} (handle: ${p.handle}): ${desc || "AureHerb hair oil."}`
    })

    if (!lines.length) {
      return staticFaq
    }

    return `${staticFaq}\n${lines.join("\n")}`
  } catch {
    return staticFaq
  }
}
