"use client"

import { FetchError } from "@medusajs/js-sdk"
import { useMemo, useState, type FormEvent } from "react"

import { trackOrderLookup, type PublicTrackedOrder } from "@lib/data/order-tracking"
import { convertToLocale } from "@lib/util/money"
import { Button, Heading, Text } from "@modules/common/components/ui"
import Input from "@modules/common/components/input"

function formatMoney(amount: number | null | undefined, currencyCode?: string | null) {
  if (amount == null) {
    return "—"
  }

  return convertToLocale({
    amount,
    currency_code: currencyCode || "pkr",
  })
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—"
  }

  try {
    return new Intl.DateTimeFormat("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value))
  } catch {
    return value
  }
}

function formatStatus(value?: string | null) {
  if (!value) {
    return "Pending"
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function ShippingAddress({ order }: { order: PublicTrackedOrder }) {
  const address = order.shipping_address

  if (!address) {
    return <Text className="text-ui-fg-subtle">No shipping address available.</Text>
  }

  return (
    <div className="space-y-1 text-sm text-ui-fg-subtle">
      <Text>
        {[address.first_name, address.last_name].filter(Boolean).join(" ") || "—"}
      </Text>
      <Text>{[address.address_1, address.address_2].filter(Boolean).join(" ") || "—"}</Text>
      <Text>
        {[address.city, address.province, address.postal_code].filter(Boolean).join(", ") ||
          "—"}
      </Text>
      <Text>{address.country_code?.toUpperCase() || "—"}</Text>
      <Text>{address.phone || "—"}</Text>
      <Text>{order.email || "—"}</Text>
    </div>
  )
}

function TrackingResult({ order }: { order: PublicTrackedOrder }) {
  const shippingMethod = order.shipping_methods?.[0]

  return (
    <div className="mt-10 space-y-8 rounded-2xl border border-[#d7d0c3] bg-white p-6 shadow-sm">
      <div className="grid gap-4 small:grid-cols-3">
        <div>
          <Text className="text-sm font-medium text-ui-fg-subtle">Order ID</Text>
          <Text className="mt-1 text-base font-semibold text-ui-fg-base">{order.reference}</Text>
        </div>
        <div>
          <Text className="text-sm font-medium text-ui-fg-subtle">Order date</Text>
          <Text className="mt-1 text-base text-ui-fg-base">{formatDate(order.created_at)}</Text>
        </div>
        <div>
          <Text className="text-sm font-medium text-ui-fg-subtle">Order status</Text>
          <Text className="mt-1 text-base text-ui-fg-base">
            {formatStatus(order.fulfillment_status)}
          </Text>
        </div>
      </div>

      <div>
        <Heading level="h2" className="text-xl text-[#1c2d22]">
          Items
        </Heading>
        <div className="mt-4 divide-y divide-[#eee7dc] rounded-xl border border-[#eee7dc]">
          {order.items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="flex items-center justify-between px-4 py-3">
              <Text className="text-ui-fg-base">{item.title}</Text>
              <Text className="text-ui-fg-subtle">Qty: {item.quantity}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 small:grid-cols-2">
        <div>
          <Heading level="h2" className="text-xl text-[#1c2d22]">
            Delivery
          </Heading>
          <div className="mt-4 space-y-5">
            <div>
              <Text className="text-sm font-medium text-ui-fg-base">Shipping Address</Text>
              <div className="mt-2">
                <ShippingAddress order={order} />
              </div>
            </div>

            <div>
              <Text className="text-sm font-medium text-ui-fg-base">Method</Text>
              <Text className="mt-2 text-sm text-ui-fg-subtle">
                {shippingMethod
                  ? `${shippingMethod.name} (${formatMoney(shippingMethod.total, order.currency_code)})`
                  : "Shipping"}
              </Text>
            </div>
          </div>
        </div>

        <div>
          <Heading level="h2" className="text-xl text-[#1c2d22]">
            Order Summary
          </Heading>
          <div className="mt-4 space-y-3 text-sm text-ui-fg-base">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(order.item_subtotal ?? order.subtotal, order.currency_code)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatMoney(order.shipping_total, order.currency_code)}</span>
            </div>
            <div className="border-t border-dashed border-[#d7d0c3] pt-3 font-semibold">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency_code)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type TrackOrderProps = {
  initialReference?: string
}

export default function TrackOrder({ initialReference = "" }: TrackOrderProps) {
  const [reference, setReference] = useState(initialReference)
  const [order, setOrder] = useState<PublicTrackedOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canSubmit = useMemo(() => reference.trim().length > 0, [reference])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { order } = await trackOrderLookup(reference.trim())
      setOrder(order)
    } catch (err: unknown) {
      setOrder(null)
      setError(
        err instanceof FetchError
          ? err.message
          : "We could not find an order with that order ID."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="content-container py-12 small:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <Heading level="h1" className="text-3xl small:text-4xl text-[#1c2d22]">
            Track your order
          </Heading>
          <Text className="mt-4 text-ui-fg-subtle">
            Enter the order ID from your order confirmation email (for example, AH-000010).
          </Text>
        </div>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#d7d0c3] bg-white p-6 shadow-sm"
        >
          <Input
            name="reference"
            label="Order ID"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
          />

          {error ? <Text className="mt-4 text-sm text-rose-600">{error}</Text> : null}

          <div className="mt-6 flex justify-center">
            <Button type="submit" size="large" isLoading={isLoading} disabled={!canSubmit}>
              Track order
            </Button>
          </div>
        </form>

        {order ? <TrackingResult order={order} /> : null}
      </div>
    </div>
  )
}
