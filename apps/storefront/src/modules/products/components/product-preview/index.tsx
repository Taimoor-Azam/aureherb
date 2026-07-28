import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import AddToCartButton from "./add-to-cart-button"

function getListingVariant(product: HttpTypes.StoreProduct) {
  const variants = (product.variants || []).filter(Boolean)
  if (!variants.length) {
    return null
  }

  const priced = [...variants].sort((a, b) => {
    const aAmount =
      (a as { calculated_price?: { calculated_amount?: number } })
        .calculated_price?.calculated_amount ?? Number.POSITIVE_INFINITY
    const bAmount =
      (b as { calculated_price?: { calculated_amount?: number } })
        .calculated_price?.calculated_amount ?? Number.POSITIVE_INFINITY
    return aAmount - bAmount
  })

  return (
    priced.find((variant) => {
      if (!variant.manage_inventory) {
        return true
      }
      if (variant.allow_backorder) {
        return true
      }
      return (variant.inventory_quantity || 0) > 0
    }) || priced[0]
  )
}

function isVariantInStock(
  variant: HttpTypes.StoreProductVariant | null | undefined
) {
  if (!variant) {
    return false
  }
  if (!variant.manage_inventory) {
    return true
  }
  if (variant.allow_backorder) {
    return true
  }
  return (variant.inventory_quantity || 0) > 0
}

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const listingVariant = getListingVariant(product)
  const inStock = isVariantInStock(listingVariant)

  return (
    <div data-testid="product-wrapper" className="flex flex-col">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="group"
      >
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between gap-2">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2 shrink-0">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </LocalizedClientLink>
      <AddToCartButton
        variantId={listingVariant?.id}
        inStock={inStock}
      />
    </div>
  )
}
