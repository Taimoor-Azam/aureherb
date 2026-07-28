import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )

  const countries = ["pk", "us", "gb", "ae"]

  logger.info("Seeding AureHerb store data...")
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "AureHerb Storefront",
          description: "Primary AureHerb web channel",
        },
      ],
    },
  })

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "AureHerb Publishable Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  })

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  })

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "AureHerb",
          supported_currencies: [
            {
              currency_code: "pkr",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  })

  logger.info("Seeding region data...")
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Primary",
          currency_code: "pkr",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })
  const region = regionResult[0]
  logger.info("Finished seeding regions.")

  logger.info("Seeding tax regions...")
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  })
  logger.info("Finished seeding tax regions.")

  logger.info("Seeding stock location data...")
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "AureHerb Warehouse",
          address: {
            city: "Karachi",
            country_code: "PK",
            address_1: "Herbal Trade Lane",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  })

  logger.info("Seeding fulfillment data...")
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfileResult[0]

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "AureHerb delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Primary",
        geo_zones: countries.map((country_code) => ({
          country_code,
          type: "country" as const,
        })),
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  })

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
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
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  })
  logger.info("Finished seeding fulfillment data.")

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  })
  logger.info("Finished seeding stock location data.")

  logger.info("Seeding product catalog...")

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Herbal Teas", is_active: true },
        { name: "Wellness Blends", is_active: true },
        { name: "Essential Oils", is_active: true },
        { name: "Dried Herbs", is_active: true },
      ],
    },
  })

  const { result: collectionResult } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        {
          title: "Featured",
          handle: "featured",
        },
        {
          title: "Daily Rituals",
          handle: "daily-rituals",
        },
      ],
    },
  })
  const featuredCollection = collectionResult.find((c) => c.handle === "featured")!

  const categoryId = (name: string) =>
    categoryResult.find((cat) => cat.name === name)!.id

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Hair Growth Oil",
          category_ids: [categoryId("Essential Oils")],
          collection_id: featuredCollection.id,
          description:
            "AureHerb Hair Growth Oil with rosemary, castor, and black seed — nourish your roots and grow your confidence.",
          handle: "hair-growth-oil",
          weight: 100,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
            },
          ],
          options: [
            {
              title: "Default option",
              values: ["Default variant"],
            },
          ],
          variants: [
            {
              title: "Default variant",
              sku: "HERB-PRIM-100",
              options: {
                "Default option": "Default variant",
              },
              prices: [{ amount: 1250, currency_code: "pkr" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  })
  logger.info("Finished seeding product data.")

  logger.info("Seeding inventory levels.")
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 500,
        inventory_item_id: item.id,
      })),
    },
  })

  logger.info("Finished seeding inventory levels data.")
  logger.info(
    `AureHerb publishable API key: ${publishableApiKey.token ?? publishableApiKey.id}`
  )
}
