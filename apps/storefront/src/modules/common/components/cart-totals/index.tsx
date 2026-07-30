"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between gap-x-4 min-w-0">
          <span className="shrink-0">Subtotal</span>
          <span
            className="text-right tabular-nums"
            data-testid="cart-subtotal"
            data-value={item_subtotal || 0}
          >
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-x-4 min-w-0">
          <span className="shrink-0">Shipping</span>
          <span
            className="text-right tabular-nums"
            data-testid="cart-shipping"
            data-value={shipping_subtotal || 0}
          >
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between gap-x-4 min-w-0">
            <span className="shrink-0">Discount</span>
            <span
              className="text-ui-fg-interactive text-right tabular-nums"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between gap-x-4 text-ui-fg-base mb-2 txt-medium min-w-0">
        <span className="shrink-0">Total</span>
        <span
          className="txt-xlarge-plus text-right tabular-nums"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
