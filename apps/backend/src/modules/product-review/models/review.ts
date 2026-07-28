import { model } from "@medusajs/framework/utils"

const Review = model.define("review", {
  id: model.id().primaryKey(),
  product_id: model.text().index(),
  customer_id: model.text().index(),
  customer_name: model.text(),
  rating: model.number(),
  title: model.text().nullable(),
  content: model.text(),
  status: model
    .enum(["pending", "approved", "rejected"])
    .default("pending")
    .index(),
})

export default Review
