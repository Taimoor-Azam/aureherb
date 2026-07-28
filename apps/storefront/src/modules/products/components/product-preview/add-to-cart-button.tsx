"use client"

import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import { useState } from "react"

type AddToCartButtonProps = {
  variantId?: string | null
  inStock?: boolean
  disabled?: boolean
}

export default function AddToCartButton({
  variantId,
  inStock = true,
  disabled = false,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  if (!variantId) {
    return null
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId || !inStock || disabled || isAdding) {
      return
    }

    setIsAdding(true)
    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inStock || disabled || isAdding}
      data-testid="product-preview-add-to-cart"
      className="mt-3 w-full border border-[#1c2d22] px-3 py-2 text-sm text-[#1c2d22] transition-colors hover:bg-[#1c2d22] hover:text-[#f7f3eb] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {!inStock ? "Out of stock" : isAdding ? "Adding…" : "Add to cart"}
    </button>
  )
}
