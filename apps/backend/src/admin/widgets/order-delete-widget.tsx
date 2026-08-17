import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

const OrderDeleteWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const navigate = useNavigate()
  const isCanceled =
    order.status === "canceled" || Boolean(order.canceled_at)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/admin/orders/${order.id}/permanent`, {
        method: "DELETE",
        credentials: "include",
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(body?.message || "Failed to delete order")
      }
      return body
    },
    onSuccess: () => {
      toast.success("Order permanently deleted")
      navigate("/orders")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not delete order")
    },
  })

  const handleDelete = () => {
    const label = order.display_id ? `#${order.display_id}` : order.id
    const ok = window.confirm(
      `Permanently delete order ${label}? This cannot be undone.`
    )
    if (!ok) {
      return
    }
    deleteMutation.mutate()
  }

  return (
    <Container className="p-0 divide-y">
      <div className="px-6 py-4">
        <Heading level="h2">Delete order</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Permanent delete removes the order from Admin and reports. Cancel
          the order first.
        </Text>
      </div>
      <div className="px-6 py-4">
        {isCanceled ? (
          <Button
            variant="danger"
            size="small"
            isLoading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            Permanently delete
          </Button>
        ) : (
          <Text size="small" className="text-ui-fg-subtle">
            This order is not canceled. Use Cancel above, then you can
            permanently delete it.
          </Text>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderDeleteWidget
