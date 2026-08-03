import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

const HAIR_GROWTH_OIL_PRODUCT_ID = "prod_01KYPJR14AF0JQT5VFK2ZPE4YF"
const HAIR_GROWTH_OIL_HANDLE = "hair-growth-oil"

const DESCRIPTION =
  "AureHerb Hair Growth Oil is expertly crafted using a carefully selected blend of premium botanical oils and herbal extracts that work together to nourish the scalp, strengthen hair, and improve overall hair health."

/**
 * Sync Hair Growth Oil product.description with storefront PDP intro copy.
 */
export default async function update_hair_growth_oil_copy({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: byId } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title"],
    filters: { id: HAIR_GROWTH_OIL_PRODUCT_ID },
  })

  let product = byId?.[0]

  if (!product) {
    const { data: byHandle } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "title"],
      filters: { handle: HAIR_GROWTH_OIL_HANDLE },
    })
    product = byHandle?.[0]
  }

  if (!product?.id) {
    logger.warn(
      "update-hair-growth-oil-copy: Hair Growth Oil product not found — skipping."
    )
    return
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: product.id,
          description: DESCRIPTION,
        },
      ],
    },
  })

  logger.info(
    `update-hair-growth-oil-copy: updated description for ${product.id} (${product.handle}).`
  )
}
