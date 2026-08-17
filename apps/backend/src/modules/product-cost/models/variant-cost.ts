import { model } from "@medusajs/framework/utils"

const VariantCost = model.define("variant_cost", {
  id: model.id().primaryKey(),
  variant_id: model.text().unique(),
  product_id: model.text().index(),
  currency_code: model.text().default("pkr"),
  unit_cost: model.number(),
})

export default VariantCost
