import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

type ProductWithImages = {
  id: string
  title?: string | null
  thumbnail?: string | null
  images?: { url?: string | null; rank?: number | null }[] | null
}

export function getFirstImageUrl(
  images?: { url?: string | null; rank?: number | null }[] | null
): string | null {
  if (!images?.length) {
    return null
  }

  const sorted = [...images].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0)
  )

  return sorted[0]?.url ?? null
}

export async function syncProductThumbnails(
  container: MedusaContainer,
  productIds?: string[]
): Promise<number> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail", "images.url", "images.rank"],
    ...(productIds?.length ? { filters: { id: productIds } } : {}),
  })

  const toUpdate = (products as ProductWithImages[]).filter((product) => {
    if (product.thumbnail) {
      return false
    }

    return !!getFirstImageUrl(product.images)
  })

  if (!toUpdate.length) {
    return 0
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: toUpdate.map((product) => ({
        id: product.id,
        thumbnail: getFirstImageUrl(product.images)!,
      })),
    },
  })

  for (const product of toUpdate) {
    logger.info(
      `Set thumbnail for ${product.title ?? product.id} -> ${getFirstImageUrl(product.images)}`
    )
  }

  return toUpdate.length
}
