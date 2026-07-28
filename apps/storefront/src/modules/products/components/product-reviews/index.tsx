import {
  hasCustomerReviewed,
  listApprovedReviews,
  ProductReview,
} from "@lib/data/reviews"
import { retrieveCustomer } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ReviewForm from "./review-form"

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="text-sm tracking-widest text-[#6b7c54]"
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(rating)}
      <span className="text-[#d7d0c3]">{"★".repeat(5 - rating)}</span>
    </span>
  )
}

function ReviewItem({ review }: { review: ProductReview }) {
  const date = new Date(review.created_at).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <li className="border-t border-[#d7d0c3] pt-6">
      <Stars rating={review.rating} />
      {review.title && (
        <h3 className="mt-2 font-display text-xl text-[#1c2d22]">
          {review.title}
        </h3>
      )}
      <p className="mt-2 text-[#5c675f] leading-7">{review.content}</p>
      <p className="mt-3 text-sm text-[#5c675f]">
        {review.customer_name}
        <span className="mx-2 text-[#d7d0c3]">·</span>
        {date}
      </p>
    </li>
  )
}

export default async function ProductReviews({
  productId,
}: {
  productId: string
}) {
  const [reviews, customer, alreadyReviewed] = await Promise.all([
    listApprovedReviews(productId),
    retrieveCustomer(),
    hasCustomerReviewed(productId),
  ])

  return (
    <section
      className="content-container py-16 small:py-24"
      data-testid="product-reviews"
    >
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl text-[#1c2d22]">Reviews</h2>
        <p className="mt-3 text-[#5c675f] leading-7">
          {reviews.length > 0
            ? `${reviews.length} customer review${reviews.length === 1 ? "" : "s"}`
            : "Be the first to share your experience."}
        </p>
      </div>

      {reviews.length > 0 && (
        <ul className="mt-10 grid gap-8 max-w-2xl">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      )}

      <div className="mt-12 max-w-xl border-t border-[#d7d0c3] pt-8">
        <h3 className="font-display text-2xl text-[#1c2d22]">Write a review</h3>

        {!customer && (
          <p className="mt-3 text-[#5c675f] leading-7">
            Please{" "}
            <LocalizedClientLink
              href="/account"
              className="underline underline-offset-4 text-[#1c2d22]"
            >
              sign in
            </LocalizedClientLink>{" "}
            to leave a review.
          </p>
        )}

        {customer && alreadyReviewed && (
          <p className="mt-3 text-[#5c675f] leading-7">
            Thank you — you have already shared a review for this product.
          </p>
        )}

        {customer && !alreadyReviewed && <ReviewForm productId={productId} />}
      </div>
    </section>
  )
}
