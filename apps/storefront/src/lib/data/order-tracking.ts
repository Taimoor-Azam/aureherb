import { sdk } from "@lib/config"

export type PublicTrackedOrder = {
  display_id: number
  reference: string
  created_at: string
  email: string
  currency_code: string
  fulfillment_status?: string | null
  subtotal?: number | null
  item_subtotal?: number | null
  shipping_total?: number | null
  total?: number | null
  items: {
    title: string
    quantity: number
  }[]
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
    country_code?: string | null
    phone?: string | null
  } | null
  shipping_methods?: {
    name: string
    total: number
  }[]
}

type TrackOrderResponse = {
  order: PublicTrackedOrder
}

export async function trackOrderLookup(reference: string) {
  return sdk.client.fetch<TrackOrderResponse>("/store/order-tracking", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: {
      reference,
    },
  })
}
