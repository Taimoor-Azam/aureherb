"use server"

import { sdk } from "@lib/config"
import { FetchError } from "@medusajs/js-sdk"
import { getAuthHeaders } from "./cookies"
import { retrieveCustomer } from "./customer"
import { revalidateTag } from "next/cache"

export type ProductReview = {
  id: string
  product_id: string
  customer_id: string
  customer_name: string
  rating: number
  title: string | null
  content: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export type SubmitReviewState =
  | { success: true; message: string }
  | { success: false; error: string }
  | null

export async function listApprovedReviews(
  productId: string
): Promise<ProductReview[]> {
  const { reviews } = await sdk.client
    .fetch<{ reviews: ProductReview[] }>("/store/product-reviews", {
      method: "GET",
      query: { product_id: productId },
      cache: "no-store",
    })
    .catch(() => ({ reviews: [] as ProductReview[] }))

  return reviews
}

export async function hasCustomerReviewed(
  productId: string
): Promise<boolean> {
  const headers = await getAuthHeaders()

  if (!("authorization" in headers)) {
    return false
  }

  const result = await sdk.client
    .fetch<{ has_reviewed: boolean }>("/store/product-reviews/me", {
      method: "GET",
      query: { product_id: productId },
      headers,
      cache: "no-store",
    })
    .catch(() => ({ has_reviewed: false }))

  return result.has_reviewed
}

export async function submitProductReview(
  _prevState: SubmitReviewState,
  formData: FormData
): Promise<SubmitReviewState> {
  const customer = await retrieveCustomer()

  if (!customer) {
    return { success: false, error: "Please sign in to leave a review." }
  }

  const productId = String(formData.get("product_id") || "")
  const rating = Number(formData.get("rating"))
  const title = String(formData.get("title") || "").trim()
  const content = String(formData.get("content") || "").trim()

  if (!productId) {
    return { success: false, error: "Missing product." }
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Please choose a rating from 1 to 5." }
  }

  if (!content) {
    return { success: false, error: "Please write a review." }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.client.fetch("/store/product-reviews", {
      method: "POST",
      headers,
      body: {
        product_id: productId,
        rating,
        title: title || null,
        content,
      },
    })
  } catch (error: unknown) {
    const message =
      error instanceof FetchError
        ? error.message
        : "Could not submit your review. Please try again."

    if (message.toLowerCase().includes("already reviewed")) {
      return {
        success: false,
        error: "You have already reviewed this product.",
      }
    }

    return { success: false, error: message }
  }

  try {
    revalidateTag("reviews")
  } catch {}

  return {
    success: true,
    message: "Thank you for your review!",
  }
}
