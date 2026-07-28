import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  deleteShippingOptionsWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * One-off: configure Delivery at PKR 249, free when item_total >= 3000.
 * Renames Standard Delivery → Delivery, removes Express Delivery.
 */
export default async function tiered_delivery_shipping({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Applying tiered Delivery shipping (PKR 249 / free over 3000)...")

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "price_type"],
  })

  const options = shippingOptions || []
  const express = options.filter((o) =>
    /express/i.test(o.name || "")
  )
  const delivery =
    options.find((o) => /^delivery$/i.test(o.name || "")) ||
    options.find((o) => /standard/i.test(o.name || "")) ||
    options.find(
      (o) => !/express/i.test(o.name || "") && o.price_type === "flat"
    )

  if (!delivery) {
    logger.warn(
      "No Delivery/Standard shipping option found — skip tiered delivery patch."
    )
    return
  }

  await updateShippingOptionsWorkflow(container).run({
    input: [
      {
        id: delivery.id,
        name: "Delivery",
        price_type: "flat",
        type: {
          label: "Delivery",
          description: "Flat PKR 249 - Free on orders PKR 3,000+",
          code: "delivery",
        },
        prices: [
          { currency_code: "pkr", amount: 249 },
          {
            currency_code: "pkr",
            amount: 0,
            rules: [
              {
                attribute: "item_total",
                operator: "gte",
                value: 3000,
              },
            ],
          },
        ],
      },
    ],
  })

  logger.info(`Updated shipping option ${delivery.id} → Delivery (249 / free ≥3000)`)

  const expressIds = express
    .map((o) => o.id)
    .filter((id) => id !== delivery.id)

  if (expressIds.length) {
    await deleteShippingOptionsWorkflow(container).run({
      input: { ids: expressIds },
    })
    logger.info(`Deleted Express shipping option(s): ${expressIds.join(", ")}`)
  }

  logger.info("Finished tiered Delivery shipping patch.")
}
