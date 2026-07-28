import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

/** Ensure Delivery option type label/description match tiered rates. */
export default async function fix_delivery_option_type({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  })

  const delivery = (shippingOptions || []).find((o) =>
    /delivery/i.test(o.name || "")
  )

  if (!delivery) {
    logger.warn("Delivery shipping option not found — skip type fix.")
    return
  }

  await updateShippingOptionsWorkflow(container).run({
    input: [
      {
        id: delivery.id,
        name: "Delivery",
        type: {
          label: "Delivery",
          description: "Flat PKR 249 - Free on orders PKR 3,000+",
          code: "delivery",
        },
      },
    ],
  })

  logger.info(`Updated Delivery option type copy for ${delivery.id}`)
}
