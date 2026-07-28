import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { syncProductThumbnails } from "../utils/sync-product-thumbnail"

export default async function productThumbnailSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncProductThumbnails(container, [data.id])
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}
