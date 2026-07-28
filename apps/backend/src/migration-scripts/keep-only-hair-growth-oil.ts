import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

function isHairGrowthOil(product: {
  title?: string | null
  handle?: string | null
}) {
  const handle = (product.handle || "").toLowerCase()
  const title = (product.title || "").toLowerCase()
  return (
    handle === "hair-growth-oil" ||
    title.includes("hair growth oil") ||
    title.includes("hair oil growth")
  )
}

/**
 * Hide every product except Hair Growth Oil from the storefront.
 * Uses draft + soft-delete so inventory reservations from test carts do not block cleanup.
 */
export default async function keep_only_hair_growth_oil({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info("Keeping only Hair Growth Oil — removing other products from store...")

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status"],
  })

  const all = products || []
  const keep = all.filter(isHairGrowthOil)
  const remove = all.filter((p) => !isHairGrowthOil(p))

  if (!keep.length) {
    logger.warn(
      "No Hair Growth Oil product found — skipping cleanup to avoid emptying the catalog."
    )
    return
  }

  if (!remove.length) {
    logger.info("Catalog already only contains Hair Growth Oil.")
    return
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: remove.map((p) => ({
        id: p.id,
        status: ProductStatus.DRAFT,
      })),
    },
  })

  await productModule.softDeleteProducts(remove.map((p) => p.id))

  logger.info(
    `Kept ${keep.map((p) => p.title).join(", ")}. Soft-deleted ${remove.length} product(s): ${remove
      .map((p) => p.title)
      .join(", ")}`
  )
}
