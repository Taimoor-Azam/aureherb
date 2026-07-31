import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { askOilsAi } from "./ai"
import {
  sendOrderConfirmPrompt,
  sendWhatsAppList,
  sendWhatsAppText,
} from "./client"
import {
  cancelOrderViaWhatsApp,
  confirmOrderViaWhatsApp,
  findOrdersByPhone,
  findPendingConfirmOrder,
  formatMoney,
  getOrderById,
  loadOilsProductFacts,
  markWhatsAppConfirmPending,
  reorderFromHistory,
} from "./orders"
import { normalizeWhatsAppPhone } from "./phone"
import {
  clearReorderSession,
  getReorderSession,
  setReorderSession,
} from "./session"

type InboundMessage = {
  from: string
  text?: string
  buttonId?: string
  buttonTitle?: string
}

function parseActionId(id?: string): { action: string; orderId?: string } | null {
  if (!id) {
    return null
  }
  if (id.startsWith("confirm:")) {
    return { action: "confirm", orderId: id.slice("confirm:".length) }
  }
  if (id.startsWith("cancel:")) {
    return { action: "cancel", orderId: id.slice("cancel:".length) }
  }
  if (id.startsWith("reorder:")) {
    return { action: "reorder", orderId: id.slice("reorder:".length) }
  }
  return { action: id }
}

function isReorderIntent(text: string) {
  return /\b(reorder|order again|buy again|same order|repeat order)\b/i.test(
    text
  )
}

function isConfirmIntent(text: string) {
  return /^(confirm|yes|haan|han|ok|okay|✅)$/i.test(text.trim())
}

function isCancelIntent(text: string) {
  return /^(cancel|no|nah|cancel order|❌)$/i.test(text.trim())
}

async function handleConfirm(
  container: MedusaContainer,
  phone: string,
  orderId: string
) {
  const result = await confirmOrderViaWhatsApp(container, orderId, phone)
  await sendWhatsAppText(phone, result.message)
}

async function handleCancel(
  container: MedusaContainer,
  phone: string,
  orderId: string
) {
  const result = await cancelOrderViaWhatsApp(container, orderId, phone)
  await sendWhatsAppText(phone, result.message)
}

async function startReorderFlow(container: MedusaContainer, phone: string) {
  const orders = await findOrdersByPhone(container, phone, 5)
  if (!orders.length) {
    await sendWhatsAppText(
      phone,
      "I couldn't find past orders for this WhatsApp number. Place one order on www.aureherb.com using this phone in the shipping address, then message me to reorder."
    )
    return
  }

  setReorderSession(
    phone,
    orders.map((o) => o.id)
  )

  const rows = orders.map((order) => {
    const itemTitles = (order.items || [])
      .map((i) => i.title)
      .filter(Boolean)
      .slice(0, 2)
      .join(", ")
    const date =
      order.created_at != null
        ? new Date(order.created_at).toLocaleDateString("en-PK")
        : ""
    return {
      id: `reorder:${order.id}`,
      title: `#${order.display_id}`.slice(0, 24),
      description: `${date} · ${formatMoney(order.total, order.currency_code)} · ${itemTitles || "items"}`.slice(
        0,
        72
      ),
    }
  })

  try {
    await sendWhatsAppList({
      to: phone,
      body: "Pick a past order to place again (same items, address, COD):",
      buttonText: "Past orders",
      sections: [{ title: "Your orders", rows }],
    })
  } catch {
    const lines = orders
      .map(
        (o, i) =>
          `${i + 1}) #${o.display_id} — ${formatMoney(o.total, o.currency_code)}`
      )
      .join("\n")
    await sendWhatsAppText(
      phone,
      `Reply with the number of the order to reorder:\n${lines}`
    )
  }
}

async function finishReorder(
  container: MedusaContainer,
  phone: string,
  orderId: string
) {
  clearReorderSession(phone)
  await sendWhatsAppText(phone, "Placing your COD reorder…")

  const result = await reorderFromHistory(container, orderId, phone)
  if (!result.ok) {
    await sendWhatsAppText(phone, result.message)
    return
  }

  const newOrder = await getOrderById(container, result.orderId)
  const totalLabel = formatMoney(newOrder?.total, newOrder?.currency_code)

  try {
    await markWhatsAppConfirmPending(container, result.orderId)
  } catch {
    // non-fatal
  }

  await sendOrderConfirmPrompt({
    to: phone,
    displayId: result.displayId ?? result.orderId,
    orderId: result.orderId,
    totalLabel,
  })
}

export async function handleInboundWhatsApp(
  container: MedusaContainer,
  message: InboundMessage
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const phone = normalizeWhatsAppPhone(message.from)
  if (!phone) {
    logger.warn("whatsapp inbound: missing from phone")
    return
  }

  const buttonParsed = parseActionId(message.buttonId)
  const text = (message.text || message.buttonTitle || "").trim()

  try {
    if (buttonParsed?.action === "confirm" && buttonParsed.orderId) {
      await handleConfirm(container, phone, buttonParsed.orderId)
      return
    }
    if (buttonParsed?.action === "cancel" && buttonParsed.orderId) {
      await handleCancel(container, phone, buttonParsed.orderId)
      return
    }
    if (buttonParsed?.action === "reorder" && buttonParsed.orderId) {
      await finishReorder(container, phone, buttonParsed.orderId)
      return
    }

    const session = getReorderSession(phone)
    if (session?.step === "awaiting_reorder_pick") {
      const pick = Number.parseInt(text, 10)
      if (pick >= 1 && pick <= session.orderIds.length) {
        await finishReorder(container, phone, session.orderIds[pick - 1])
        return
      }
      if (isCancelIntent(text)) {
        clearReorderSession(phone)
        await sendWhatsAppText(phone, "Reorder cancelled. How else can I help?")
        return
      }
      await sendWhatsAppText(
        phone,
        `Reply with a number 1–${session.orderIds.length} to pick an order, or say cancel.`
      )
      return
    }

    if (isReorderIntent(text)) {
      await startReorderFlow(container, phone)
      return
    }

    if (isConfirmIntent(text)) {
      const pending = await findPendingConfirmOrder(container, phone)
      if (pending) {
        await handleConfirm(container, phone, pending.id)
        return
      }
    }

    if (isCancelIntent(text)) {
      const pending = await findPendingConfirmOrder(container, phone)
      if (pending) {
        await handleCancel(container, phone, pending.id)
        return
      }
    }

    // Oils-only AI for free-form chat
    const facts = await loadOilsProductFacts(container)
    const reply = await askOilsAi({ question: text || "hello", productFacts: facts })
    await sendWhatsAppText(phone, reply)
  } catch (error) {
    logger.error("whatsapp inbound handler failed", error)
    try {
      await sendWhatsAppText(
        phone,
        "Sorry — something went wrong. Please try again or order at www.aureherb.com."
      )
    } catch {
      // ignore
    }
  }
}

export function extractInboundMessages(body: any): InboundMessage[] {
  const messages: InboundMessage[] = []
  const entries = body?.entry || []
  for (const entry of entries) {
    for (const change of entry?.changes || []) {
      const value = change?.value
      if (!value?.messages) {
        continue
      }
      for (const msg of value.messages) {
        const from = msg.from as string
        if (msg.type === "text") {
          messages.push({ from, text: msg.text?.body })
        } else if (msg.type === "interactive") {
          const reply = msg.interactive?.button_reply || msg.interactive?.list_reply
          messages.push({
            from,
            buttonId: reply?.id,
            buttonTitle: reply?.title,
            text: reply?.title,
          })
        } else if (msg.type === "button") {
          messages.push({
            from,
            buttonId: msg.button?.payload,
            buttonTitle: msg.button?.text,
            text: msg.button?.text,
          })
        }
      }
    }
  }
  return messages
}
