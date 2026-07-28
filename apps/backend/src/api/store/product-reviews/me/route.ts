import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review"
import ProductReviewModuleService from "../../../../modules/product-review/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  const productId = req.query.product_id as string | undefined

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!productId) {
    return res.status(400).json({
      message: "product_id query parameter is required",
    })
  }

  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const reviews = await reviewService.listReviews({
    product_id: productId,
    customer_id: customerId,
  })

  res.json({
    has_reviewed: reviews.length > 0,
  })
}
