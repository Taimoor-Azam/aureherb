import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useMemo } from "react"

type ProfitLine = {
  id: string
  line_item_id: string
  variant_id: string | null
  product_id: string | null
  quantity: number
  unit_cost: number
  unit_revenue: number
  line_cogs: number
  line_revenue: number
  line_profit: number
  missing_cost: boolean
}

type ProfitResponse = {
  order_id: string
  display_id: number | string | null
  has_snapshots: boolean
  lines: ProfitLine[]
  revenue: number
  cogs: number
  profit: number
  margin_percent: number | null
  missing_cost_lines: number
  currency_code: string
}

function formatPkr(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) {
    return "—"
  }
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatMargin(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—"
  }
  return `${value.toFixed(1)}%`
}

const OrderProfitWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const queryKey = useMemo(() => ["order-profit", order.id], [order.id])

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/admin/orders/${order.id}/profit`, {
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to load order profit")
      }
      return (await response.json()) as ProfitResponse
    },
  })

  return (
    <Container className="p-0 divide-y">
      <div className="px-6 py-4">
        <Heading level="h2">Product profit &amp; loss</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Based on unit cost snapped when the order was placed.
        </Text>
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        {isLoading && <Text size="small">Loading profit…</Text>}
        {isError && (
          <Text size="small" className="text-ui-fg-error">
            Could not load profit data.
          </Text>
        )}

        {data && !data.has_snapshots && (
          <Text size="small" className="text-ui-fg-subtle">
            No cost data for this order. Orders placed before costing was
            enabled will not show historical P&amp;L.
          </Text>
        )}

        {data?.has_snapshots && (
          <>
            {data.missing_cost_lines > 0 && (
              <Text size="small" className="text-ui-fg-error">
                {data.missing_cost_lines} line
                {data.missing_cost_lines === 1 ? "" : "s"} had no unit cost at
                sale time (COGS treated as 0).
              </Text>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Text size="small" className="text-ui-fg-subtle">
                  Revenue
                </Text>
                <Text weight="plus">{formatPkr(data.revenue)}</Text>
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle">
                  COGS
                </Text>
                <Text weight="plus">{formatPkr(data.cogs)}</Text>
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle">
                  Gross profit
                </Text>
                <Text
                  weight="plus"
                  className={data.profit < 0 ? "text-ui-fg-error" : ""}
                >
                  {formatPkr(data.profit)}
                </Text>
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle">
                  Margin
                </Text>
                <Text weight="plus">
                  {formatMargin(data.margin_percent)}
                </Text>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {data.lines.map((line) => (
                <div
                  key={line.id}
                  className="rounded-md border border-ui-border-base p-3 grid grid-cols-2 md:grid-cols-5 gap-2"
                >
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">
                      Qty
                    </Text>
                    <Text size="small" weight="plus">
                      {line.quantity}
                      {line.missing_cost ? " · missing cost" : ""}
                    </Text>
                  </div>
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">
                      Unit cost
                    </Text>
                    <Text size="small">{formatPkr(line.unit_cost)}</Text>
                  </div>
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">
                      Revenue
                    </Text>
                    <Text size="small">{formatPkr(line.line_revenue)}</Text>
                  </div>
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">
                      COGS
                    </Text>
                    <Text size="small">{formatPkr(line.line_cogs)}</Text>
                  </div>
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">
                      Profit
                    </Text>
                    <Text
                      size="small"
                      weight="plus"
                      className={
                        line.line_profit < 0 ? "text-ui-fg-error" : ""
                      }
                    >
                      {formatPkr(line.line_profit)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderProfitWidget
