import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { useMemo, useState } from "react"

type Summary = {
  revenue: number
  cogs: number
  profit: number
  margin_percent: number | null
  order_count: number
  line_count: number
  missing_cost_lines: number
  currency_code: string
}

type ProductRow = {
  product_id: string
  title: string
  revenue: number
  cogs: number
  profit: number
  margin_percent: number | null
  quantity: number
  order_count: number
  missing_cost_lines: number
}

type OrderRow = {
  order_id: string
  display_id: number | string | null
  revenue: number
  cogs: number
  profit: number
  margin_percent: number | null
  missing_cost_lines: number
  created_at: string
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function toInputDate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function presetRange(key: string): { from: Date; to: Date } {
  const now = new Date()
  const to = endOfDay(now)

  if (key === "today") {
    return { from: startOfDay(now), to }
  }
  if (key === "7d") {
    const from = startOfDay(now)
    from.setDate(from.getDate() - 6)
    return { from, to }
  }
  if (key === "30d") {
    const from = startOfDay(now)
    from.setDate(from.getDate() - 29)
    return { from, to }
  }
  // this month
  const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
  return { from, to }
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

const ProfitLossPage = () => {
  const initial = presetRange("30d")
  const [fromDate, setFromDate] = useState(toInputDate(initial.from))
  const [toDate, setToDate] = useState(toInputDate(initial.to))
  const [activePreset, setActivePreset] = useState("30d")

  const range = useMemo(() => {
    const from = startOfDay(new Date(fromDate))
    const to = endOfDay(new Date(toDate))
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      valid: !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()),
    }
  }, [fromDate, toDate])

  const qs = range.valid
    ? `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
    : ""

  const summaryQuery = useQuery({
    queryKey: ["pnl-summary", range.from, range.to],
    enabled: range.valid,
    queryFn: async () => {
      const res = await fetch(`/admin/profit-loss/summary?${qs}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to load summary")
      }
      return (await res.json()) as Summary
    },
  })

  const productsQuery = useQuery({
    queryKey: ["pnl-products", range.from, range.to],
    enabled: range.valid,
    queryFn: async () => {
      const res = await fetch(`/admin/profit-loss/products?${qs}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to load products")
      }
      return (await res.json()) as { products: ProductRow[] }
    },
  })

  const ordersQuery = useQuery({
    queryKey: ["pnl-orders", range.from, range.to],
    enabled: range.valid,
    queryFn: async () => {
      const res = await fetch(`/admin/profit-loss/orders?${qs}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to load orders")
      }
      return (await res.json()) as { orders: OrderRow[] }
    },
  })

  const applyPreset = (key: string) => {
    const { from, to } = presetRange(key)
    setFromDate(toInputDate(from))
    setToDate(toInputDate(to))
    setActivePreset(key)
  }

  const summary = summaryQuery.data
  const products = productsQuery.data?.products ?? []
  const orders = ordersQuery.data?.orders ?? []

  return (
    <div className="flex flex-col gap-4">
      <Container className="p-0 divide-y">
        <div className="px-6 py-4">
          <Heading level="h1">Profit &amp; Loss</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Product gross profit from snapshotted unit costs (PKR). Canceled
            orders are excluded.
          </Text>
        </div>

        <div className="px-6 py-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["today", "Today"],
              ["7d", "Last 7 days"],
              ["30d", "Last 30 days"],
              ["month", "This month"],
            ].map(([key, label]) => (
              <Button
                key={key}
                size="small"
                variant={activePreset === key ? "primary" : "secondary"}
                onClick={() => applyPreset(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Text size="small" className="mb-1 block">
                From
              </Text>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setActivePreset("custom")
                }}
              />
            </div>
            <div>
              <Text size="small" className="mb-1 block">
                To
              </Text>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setActivePreset("custom")
                }}
              />
            </div>
          </div>
        </div>
      </Container>

      {summary?.missing_cost_lines ? (
        <Container className="px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            {summary.missing_cost_lines} line
            {summary.missing_cost_lines === 1 ? "" : "s"} in this range had no
            unit cost at sale time. Those COGS are treated as 0.
          </Text>
        </Container>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ["Revenue", formatPkr(summary?.revenue)],
          ["COGS", formatPkr(summary?.cogs)],
          ["Gross profit", formatPkr(summary?.profit)],
          ["Margin", formatMargin(summary?.margin_percent)],
          ["Orders", String(summary?.order_count ?? "—")],
        ].map(([label, value]) => (
          <Container key={label} className="px-4 py-3">
            <Text size="small" className="text-ui-fg-subtle">
              {label}
            </Text>
            <Text
              weight="plus"
              className={
                label === "Gross profit" &&
                summary != null &&
                summary.profit < 0
                  ? "text-ui-fg-error"
                  : ""
              }
            >
              {summaryQuery.isLoading ? "…" : value}
            </Text>
          </Container>
        ))}
      </div>

      <Container className="p-0 divide-y">
        <div className="px-6 py-4">
          <Heading level="h2">By product</Heading>
        </div>
        <div className="px-6 py-4 overflow-x-auto">
          {productsQuery.isLoading && (
            <Text size="small">Loading products…</Text>
          )}
          {!productsQuery.isLoading && products.length === 0 && (
            <Text size="small" className="text-ui-fg-subtle">
              No snapshotted sales in this range.
            </Text>
          )}
          {products.length > 0 && (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>Qty</Table.HeaderCell>
                  <Table.HeaderCell>Revenue</Table.HeaderCell>
                  <Table.HeaderCell>COGS</Table.HeaderCell>
                  <Table.HeaderCell>Profit</Table.HeaderCell>
                  <Table.HeaderCell>Margin</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {products.map((row) => (
                  <Table.Row key={row.product_id}>
                    <Table.Cell>
                      {row.product_id !== "unknown" ? (
                        <Link
                          to={`/products/${row.product_id}`}
                          className="text-ui-fg-interactive"
                        >
                          {row.title}
                        </Link>
                      ) : (
                        row.title
                      )}
                    </Table.Cell>
                    <Table.Cell>{row.quantity}</Table.Cell>
                    <Table.Cell>{formatPkr(row.revenue)}</Table.Cell>
                    <Table.Cell>{formatPkr(row.cogs)}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={
                          row.profit < 0 ? "text-ui-fg-error" : undefined
                        }
                      >
                        {formatPkr(row.profit)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {formatMargin(row.margin_percent)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </Container>

      <Container className="p-0 divide-y">
        <div className="px-6 py-4">
          <Heading level="h2">By order</Heading>
        </div>
        <div className="px-6 py-4 overflow-x-auto">
          {ordersQuery.isLoading && (
            <Text size="small">Loading orders…</Text>
          )}
          {!ordersQuery.isLoading && orders.length === 0 && (
            <Text size="small" className="text-ui-fg-subtle">
              No snapshotted orders in this range.
            </Text>
          )}
          {orders.length > 0 && (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Revenue</Table.HeaderCell>
                  <Table.HeaderCell>COGS</Table.HeaderCell>
                  <Table.HeaderCell>Profit</Table.HeaderCell>
                  <Table.HeaderCell>Margin</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orders.map((row) => (
                  <Table.Row key={row.order_id}>
                    <Table.Cell>
                      <Link
                        to={`/orders/${row.order_id}`}
                        className="text-ui-fg-interactive"
                      >
                        #{row.display_id ?? row.order_id.slice(-6)}
                      </Link>
                      {row.missing_cost_lines > 0 ? (
                        <Text
                          size="small"
                          className="text-ui-fg-error block"
                        >
                          missing cost
                        </Text>
                      ) : null}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(row.created_at).toLocaleDateString("en-PK")}
                    </Table.Cell>
                    <Table.Cell>{formatPkr(row.revenue)}</Table.Cell>
                    <Table.Cell>{formatPkr(row.cogs)}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={
                          row.profit < 0 ? "text-ui-fg-error" : undefined
                        }
                      >
                        {formatPkr(row.profit)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {formatMargin(row.margin_percent)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Profit & Loss",
  icon: ChartBar,
})

export default ProfitLossPage
