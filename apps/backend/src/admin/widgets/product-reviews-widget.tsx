import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useMemo } from "react"

type Review = {
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

const ProductReviewsWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const queryKey = useMemo(
    () => ["product-reviews", product.id],
    [product.id]
  )

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        `/admin/product-reviews?product_id=${encodeURIComponent(product.id)}`,
        { credentials: "include" }
      )

      if (!response.ok) {
        throw new Error("Failed to load reviews")
      }

      return (await response.json()) as { reviews: Review[] }
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey })
  }

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/admin/product-reviews/${id}/approve`, {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to approve review")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Review approved")
      invalidate()
    },
    onError: () => toast.error("Could not approve review"),
  })

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/admin/product-reviews/${id}/reject`, {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to reject review")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Review rejected")
      invalidate()
    },
    onError: () => toast.error("Could not reject review"),
  })

  const reviews = data?.reviews ?? []
  const pending = reviews.filter((review) => review.status === "pending")
  const others = reviews.filter((review) => review.status !== "pending")

  return (
    <Container className="p-0 divide-y">
      <div className="px-6 py-4">
        <Heading level="h2">Product reviews</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Approve reviews before they appear on the storefront.
        </Text>
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        {isLoading && <Text size="small">Loading reviews…</Text>}

        {!isLoading && pending.length === 0 && others.length === 0 && (
          <Text size="small" className="text-ui-fg-subtle">
            No reviews yet.
          </Text>
        )}

        {pending.length > 0 && (
          <div className="flex flex-col gap-3">
            <Text weight="plus" size="small">
              Pending ({pending.length})
            </Text>
            {pending.map((review) => (
              <div
                key={review.id}
                className="rounded-md border border-ui-border-base p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Text weight="plus" size="small">
                      {review.customer_name} · {review.rating}/5
                    </Text>
                    {review.title && (
                      <Text size="small" weight="plus" className="mt-1 block">
                        {review.title}
                      </Text>
                    )}
                    <Text size="small" className="mt-1 text-ui-fg-subtle">
                      {review.content}
                    </Text>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="small"
                      variant="primary"
                      isLoading={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(review.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      isLoading={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(review.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <div className="flex flex-col gap-3">
            <Text weight="plus" size="small">
              Reviewed ({others.length})
            </Text>
            {others.map((review) => (
              <div
                key={review.id}
                className="rounded-md border border-ui-border-base p-3"
              >
                <Text weight="plus" size="small">
                  {review.customer_name} · {review.rating}/5 · {review.status}
                </Text>
                {review.title && (
                  <Text size="small" weight="plus" className="mt-1 block">
                    {review.title}
                  </Text>
                )}
                <Text size="small" className="mt-1 text-ui-fg-subtle">
                  {review.content}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductReviewsWidget
