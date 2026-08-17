import { model } from "@medusajs/framework/utils"

const OrderLineCostSnapshot = model.define("order_line_cost_snapshot", {
  id: model.id().primaryKey(),
  order_id: model.text().index(),
  line_item_id: model.text().unique(),
  variant_id: model.text().nullable(),
  product_id: model.text().nullable(),
  quantity: model.number(),
  unit_cost: model.number().default(0),
  unit_revenue: model.number(),
  currency_code: model.text().default("pkr"),
  line_cogs: model.number().default(0),
  line_revenue: model.number(),
  line_profit: model.number().default(0),
  missing_cost: model.boolean().default(false),
})

export default OrderLineCostSnapshot
