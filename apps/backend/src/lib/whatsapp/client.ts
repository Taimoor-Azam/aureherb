import { formatOrderReference } from "../../utils/order-reference"

type WhatsAppConfig = {
  token: string
  phoneNumberId: string
  apiVersion: string
}

function getConfig(): WhatsAppConfig | null {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) {
    return null
  }
  return {
    token,
    phoneNumberId,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
  }
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(getConfig())
}

async function graphPost(path: string, body: Record<string, unknown>) {
  const config = getConfig()
  if (!config) {
    throw new Error("WhatsApp is not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID).")
  }

  const url = `https://graph.facebook.com/${config.apiVersion}/${path}`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string }
    messages?: Array<{ id?: string }>
  }

  if (!response.ok) {
    throw new Error(
      payload.error?.message || `WhatsApp API error (${response.status})`
    )
  }

  return payload
}

export async function sendWhatsAppText(to: string, body: string) {
  const config = getConfig()!
  return graphPost(`${config.phoneNumberId}/messages`, {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: false, body },
  })
}

export async function sendWhatsAppButtons(opts: {
  to: string
  body: string
  buttons: Array<{ id: string; title: string }>
}) {
  const config = getConfig()!
  return graphPost(`${config.phoneNumberId}/messages`, {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: opts.body },
      action: {
        buttons: opts.buttons.slice(0, 3).map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title.slice(0, 20),
          },
        })),
      },
    },
  })
}

export async function sendWhatsAppList(opts: {
  to: string
  body: string
  buttonText: string
  sections: Array<{
    title: string
    rows: Array<{ id: string; title: string; description?: string }>
  }>
}) {
  const config = getConfig()!
  return graphPost(`${config.phoneNumberId}/messages`, {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: opts.body },
      action: {
        button: opts.buttonText.slice(0, 20),
        sections: opts.sections,
      },
    },
  })
}

export async function sendWhatsAppTemplate(opts: {
  to: string
  name: string
  languageCode?: string
  bodyParameters?: string[]
}) {
  const config = getConfig()!
  const components =
    opts.bodyParameters && opts.bodyParameters.length
      ? [
          {
            type: "body",
            parameters: opts.bodyParameters.map((text) => ({
              type: "text",
              text,
            })),
          },
        ]
      : undefined

  return graphPost(`${config.phoneNumberId}/messages`, {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "template",
    template: {
      name: opts.name,
      language: { code: opts.languageCode || "en" },
      ...(components ? { components } : {}),
    },
  })
}

/**
 * Order placed: prefer approved template; fall back to interactive buttons (sandbox / open window).
 */
export async function sendOrderConfirmPrompt(opts: {
  to: string
  displayId: string | number
  orderId: string
  totalLabel: string
}) {
  const useTemplates = process.env.WHATSAPP_USE_TEMPLATES === "true"
  const templateName =
    process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRM || "order_placed_confirm"
  const orderReference = formatOrderReference(opts.displayId) || String(opts.displayId)

  if (useTemplates) {
    try {
      return await sendWhatsAppTemplate({
        to: opts.to,
        name: templateName,
        bodyParameters: [orderReference, opts.totalLabel],
      })
    } catch {
      // fall through to interactive
    }
  }

  return sendWhatsAppButtons({
    to: opts.to,
    body: `AureHerb order ${orderReference} received (${opts.totalLabel}).\n\nPlease confirm or cancel this order.`,
    buttons: [
      { id: `confirm:${opts.orderId}`, title: "Confirm" },
      { id: `cancel:${opts.orderId}`, title: "Cancel" },
    ],
  })
}

export async function sendOrderShippedNotice(opts: {
  to: string
  displayId: string | number
  tracking?: string
}) {
  const useTemplates = process.env.WHATSAPP_USE_TEMPLATES === "true"
  const templateName =
    process.env.WHATSAPP_TEMPLATE_ORDER_SHIPPED || "order_shipped"
  const orderReference = formatOrderReference(opts.displayId) || String(opts.displayId)

  const trackingNote = opts.tracking
    ? ` Tracking: ${opts.tracking}.`
    : ""

  if (useTemplates) {
    try {
      return await sendWhatsAppTemplate({
        to: opts.to,
        name: templateName,
        bodyParameters: [orderReference],
      })
    } catch {
      // fall through
    }
  }

  return sendWhatsAppText(
    opts.to,
    `AureHerb update: your order ${orderReference} has been given to the courier for delivery.${trackingNote}`
  )
}
