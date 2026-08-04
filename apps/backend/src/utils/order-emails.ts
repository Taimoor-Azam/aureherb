import { formatMoney, toAmountNumber } from "./money"

type OrderEmailItem = {
  title?: string | null
  quantity?: number | null
  unit_price?: number | null
  subtitle?: string | null
}

type OrderEmailAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

export type OrderEmailPayload = {
  id: string
  display_id?: number | string | null
  email?: string | null
  currency_code?: string | null
  total?: number | null
  item_subtotal?: number | null
  shipping_total?: number | null
  items?: OrderEmailItem[] | null
  shipping_address?: OrderEmailAddress | null
  tracking_numbers?: string[] | null
}

function formatAddress(address?: OrderEmailAddress | null) {
  if (!address) {
    return "—"
  }
  const name = [address.first_name, address.last_name].filter(Boolean).join(" ")
  const lines = [
    name,
    address.address_1,
    address.address_2,
    [address.city, address.province, address.postal_code].filter(Boolean).join(", "),
    address.country_code?.toUpperCase(),
    address.phone ? `Phone: ${address.phone}` : null,
  ].filter(Boolean)
  return lines.join("<br/>") || "—"
}

function itemsRows(
  items: OrderEmailItem[] | null | undefined,
  currencyCode?: string | null
) {
  if (!items?.length) {
    return `<tr><td colspan="3" style="padding:8px;border-bottom:1px solid #eee;">No items</td></tr>`
  }
  return items
    .map((item) => {
      const title = item.title || item.subtitle || "Item"
      const qty = toAmountNumber(item.quantity) ?? 0
      const unit = toAmountNumber(item.unit_price)
      const lineTotal = unit == null ? null : unit * qty
      const price = formatMoney(lineTotal, currencyCode)
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${title}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${price}</td>
      </tr>`
    })
    .join("")
}

function totalsBlock(order: OrderEmailPayload) {
  return `
      <p style="margin:12px 0 4px;"><strong>Subtotal:</strong> ${formatMoney(order.item_subtotal, order.currency_code)}</p>
      <p style="margin:4px 0;"><strong>Shipping:</strong> ${formatMoney(order.shipping_total, order.currency_code)}</p>
      <p style="margin:4px 0 12px;"><strong>Total:</strong> ${formatMoney(order.total, order.currency_code)}</p>
  `
}

function wrapEmail(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f7f3eb;font-family:Georgia,serif;color:#1f1a14;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3eb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e7dfd2;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #e7dfd2;">
                <div style="font-size:22px;letter-spacing:0.04em;">AureHerb</div>
                <div style="margin-top:6px;font-size:16px;color:#5c5348;">${title}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;font-size:15px;line-height:1.55;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #e7dfd2;font-size:12px;color:#8a8074;">
                AureHerb · Botanical remedies for daily ritual
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function buildOrderPlacedEmail(order: OrderEmailPayload) {
  const orderLabel = order.display_id ? `#${order.display_id}` : order.id
  const html = wrapEmail(
    "Order confirmation",
    `
      <p>Thank you for your order. We've received it and will process it shortly.</p>
      <p><strong>Order:</strong> ${orderLabel}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;border-collapse:collapse;">
        <thead>
          <tr>
            <th align="left" style="padding:8px;border-bottom:2px solid #e7dfd2;">Item</th>
            <th style="padding:8px;border-bottom:2px solid #e7dfd2;">Qty</th>
            <th align="right" style="padding:8px;border-bottom:2px solid #e7dfd2;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows(order.items, order.currency_code)}
        </tbody>
      </table>
      ${totalsBlock(order)}
      <p><strong>Payment:</strong> Cash on delivery (COD)</p>
      <p><strong>Shipping address:</strong><br/>${formatAddress(order.shipping_address)}</p>
    `
  )

  const text = [
    `AureHerb — Order confirmation`,
    `Order: ${orderLabel}`,
    `Subtotal: ${formatMoney(order.item_subtotal, order.currency_code)}`,
    `Shipping: ${formatMoney(order.shipping_total, order.currency_code)}`,
    `Total: ${formatMoney(order.total, order.currency_code)}`,
    `Payment: Cash on delivery (COD)`,
    `Thank you for your order.`,
  ].join("\n")

  return {
    subject: `Order confirmed — AureHerb ${orderLabel}`,
    html,
    text,
  }
}

export function buildOrderShippedEmail(order: OrderEmailPayload) {
  const orderLabel = order.display_id ? `#${order.display_id}` : order.id
  const tracking =
    order.tracking_numbers?.filter(Boolean).join(", ") ||
    "Tracking will be shared if available."

  const html = wrapEmail(
    "Your order has shipped",
    `
      <p>Good news — your AureHerb order is on its way.</p>
      <p><strong>Order:</strong> ${orderLabel}</p>
      <p><strong>Tracking:</strong> ${tracking}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;border-collapse:collapse;">
        <thead>
          <tr>
            <th align="left" style="padding:8px;border-bottom:2px solid #e7dfd2;">Item</th>
            <th style="padding:8px;border-bottom:2px solid #e7dfd2;">Qty</th>
            <th align="right" style="padding:8px;border-bottom:2px solid #e7dfd2;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows(order.items, order.currency_code)}
        </tbody>
      </table>
      ${totalsBlock(order)}
      <p><strong>Shipping address:</strong><br/>${formatAddress(order.shipping_address)}</p>
    `
  )

  const text = [
    `AureHerb — Your order has shipped`,
    `Order: ${orderLabel}`,
    `Tracking: ${tracking}`,
    `Subtotal: ${formatMoney(order.item_subtotal, order.currency_code)}`,
    `Shipping: ${formatMoney(order.shipping_total, order.currency_code)}`,
    `Total: ${formatMoney(order.total, order.currency_code)}`,
  ].join("\n")

  return {
    subject: `Order shipped — AureHerb ${orderLabel}`,
    html,
    text,
  }
}
