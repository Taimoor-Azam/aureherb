import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { syncProductThumbnails } from "../utils/sync-product-thumbnail"

export default async function sync_product_thumbnails({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Backfilling product thumbnails from first image...")

  const updated = await syncProductThumbnails(container)

  logger.info(
    updated
      ? `Backfilled thumbnails for ${updated} product(s).`
      : "No products needed thumbnail backfill."
  )
}
