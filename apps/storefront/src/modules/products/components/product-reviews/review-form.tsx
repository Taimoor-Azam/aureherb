"use client"

import { submitProductReview, SubmitReviewState } from "@lib/data/reviews"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useActionState, useState } from "react"

export default function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState<SubmitReviewState, FormData>(
    submitProductReview,
    null
  )
  const [rating, setRating] = useState(5)

  if (state?.success) {
    return (
      <p className="mt-6 text-[#1c2d22]" data-testid="review-success">
        {state.message}
      </p>
    )
  }

  return (
    <form action={formAction} className="mt-8 max-w-xl flex flex-col gap-4">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-sm text-[#5c675f] mb-2">Your rating</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`text-2xl leading-none ${
                value <= rating ? "text-[#6b7c54]" : "text-[#d7d0c3]"
              }`}
              aria-checked={value === rating}
              role="radio"
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-title" className="text-sm text-[#5c675f]">
          Title <span className="text-[#9aa194]">(optional)</span>
        </label>
        <input
          id="review-title"
          name="title"
          type="text"
          maxLength={120}
          className="mt-1 w-full border border-[#d7d0c3] bg-transparent px-3 py-2 text-[#1c2d22] outline-none focus:border-[#6b7c54]"
        />
      </div>

      <div>
        <label htmlFor="review-content" className="text-sm text-[#5c675f]">
          Review
        </label>
        <textarea
          id="review-content"
          name="content"
          required
          rows={4}
          maxLength={2000}
          className="mt-1 w-full border border-[#d7d0c3] bg-transparent px-3 py-2 text-[#1c2d22] outline-none focus:border-[#6b7c54]"
        />
      </div>

      <ErrorMessage
        error={state && !state.success ? state.error : null}
        data-testid="review-error-message"
      />

      <SubmitButton
        className="w-fit bg-[#1c2d22] hover:bg-[#2a4033]"
        data-testid="submit-review-button"
      >
        Submit review
      </SubmitButton>
    </form>
  )
}
