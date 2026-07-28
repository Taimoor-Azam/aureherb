import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const review = await reviewService.updateReviews({
    id,
    status: "rejected",
  })

  res.json({ review })
}
