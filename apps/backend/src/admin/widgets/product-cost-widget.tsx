import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useEffect, useMemo, useState } from "react"

type VariantCostRow = {
  variant_id: string
  title: string | null
  sku: string | null
  sell_price: number | null
  unit_cost: number | null
  profit: number | null
  margin_percent: number | null
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

const ProductCostWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const queryKey = useMemo(
    () => ["product-costs", product.id],
    [product.id]
  )
  const [draftCosts, setDraftCosts] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        `/admin/product-costs?product_id=${encodeURIComponent(product.id)}`,
        { credentials: "include" }
      )
      if (!response.ok) {
        throw new Error("Failed to load product costs")
      }
      return (await response.json()) as {
        product_id: string
        variants: VariantCostRow[]
      }
    },
  })

  const variants = data?.variants ?? []

  useEffect(() => {
    if (!variants.length) {
      return
    }
    const next: Record<string, string> = {}
    for (const row of variants) {
      next[row.variant_id] =
        row.unit_cost != null ? String(row.unit_cost) : ""
    }
    setDraftCosts(next)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const costs = variants.map((row) => {
        const raw = draftCosts[row.variant_id]
        const unit_cost = Number(raw)
        if (!Number.isFinite(unit_cost) || unit_cost < 0) {
          throw new Error(`Invalid cost for ${row.title || row.variant_id}`)
        }
        return {
          variant_id: row.variant_id,
          unit_cost,
        }
      })

      const response = await fetch(`/admin/product-costs`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          costs,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || "Failed to save costs")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Product costs saved")
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not save costs")
    },
  })

  const missingCost = variants.some(
    (row) =>
      draftCosts[row.variant_id] === "" ||
      draftCosts[row.variant_id] == null
  )

  return (
    <Container className="p-0 divide-y">
      <div className="px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <Heading level="h2">Product cost &amp; margin</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Unit cost in PKR. Margin uses current sell price; order P&amp;L uses
            the cost at sale time.
          </Text>
        </div>
        <Button
          size="small"
          variant="primary"
          isLoading={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          disabled={!variants.length}
        >
          Save costs
        </Button>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3">
        {isLoading && <Text size="small">Loading costs…</Text>}

        {!isLoading && !variants.length && (
          <Text size="small" className="text-ui-fg-subtle">
            No variants found.
          </Text>
        )}

        {missingCost && (
          <Text size="small" className="text-ui-fg-error">
            Some variants are missing a unit cost. Set costs before relying on
            P&amp;L reports.
          </Text>
        )}

        {variants.map((row) => {
          const draft = draftCosts[row.variant_id]
          const draftNum =
            draft === "" || draft == null ? null : Number(draft)
          const sell = row.sell_price
          const profit =
            sell != null && draftNum != null && Number.isFinite(draftNum)
              ? sell - draftNum
              : null
          const margin =
            profit != null && sell && sell > 0
              ? (profit / sell) * 100
              : null

          return (
            <div
              key={row.variant_id}
              className="rounded-md border border-ui-border-base p-3 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
            >
              <div className="md:col-span-2">
                <Text weight="plus" size="small">
                  {row.title || "Variant"}
                </Text>
                {row.sku && (
                  <Text size="small" className="text-ui-fg-subtle block">
                    SKU: {row.sku}
                  </Text>
                )}
                <Text size="small" className="text-ui-fg-subtle mt-1 block">
                  Sell: {formatPkr(sell)}
                </Text>
              </div>

              <div>
                <Text size="small" className="mb-1 block">
                  Unit cost (PKR)
                </Text>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={draft ?? ""}
                  onChange={(e) =>
                    setDraftCosts((prev) => ({
                      ...prev,
                      [row.variant_id]: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle">
                  Profit / unit
                </Text>
                <Text
                  weight="plus"
                  size="small"
                  className={
                    profit != null && profit < 0 ? "text-ui-fg-error" : ""
                  }
                >
                  {formatPkr(profit)}
                </Text>
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle">
                  Margin
                </Text>
                <Text weight="plus" size="small">
                  {formatMargin(margin)}
                </Text>
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductCostWidget
