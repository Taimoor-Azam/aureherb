import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"

type CreateReviewBody = {
  product_id?: string
  rating?: number
  title?: string | null
  content?: string
}

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
      status: "approved",
    },
    {
      order: { created_at: "DESC" },
    }
  )

  res.json({ reviews })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateReviewBody>,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const { product_id, rating, title, content } = req.body || {}

  if (!product_id || typeof product_id !== "string") {
    return res.status(400).json({ message: "product_id is required" })
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ message: "content is required" })
  }

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({ message: "rating must be an integer from 1 to 5" })
  }

  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const existing = await reviewService.listReviews({
    product_id,
    customer_id: customerId,
  })

  if (existing.length > 0) {
    return res.status(409).json({
      message: "You have already reviewed this product",
    })
  }

  const customerModule = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerModule.retrieveCustomer(customerId)
  const customerName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() ||
    customer.email ||
    "Customer"

  const review = await reviewService.createReviews({
    product_id,
    customer_id: customerId,
    customer_name: customerName,
    rating,
    title: title?.trim() || null,
    content: content.trim(),
    status: "pending",
  })

  res.status(201).json({
    review: {
      id: review.id,
    },
  })
}
