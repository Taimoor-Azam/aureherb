import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.query.product_id as string | undefined

  if (!productId) {
    return res.status(400).json({
      message: "product_id query parameter is required",
    })
  }

  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const reviews = await reviewService.listReviews(
    {
      product_id: productId,
    },
    {
      order: { created_at: "DESC" },
    }
  )

  res.json({ reviews })
}
