import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  aggregateByProduct,
  loadReportSnapshots,
  parseDateRange,
} from "../../../../utils/profit-loss"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const range = parseDateRange(
    req.query.from as string | undefined,
    req.query.to as string | undefined
  )

  if (!range) {
    return res.status(400).json({
      message: "from and to query parameters (ISO dates) are required",
    })
  }

  const snapshots = await loadReportSnapshots(req.scope, range)
  const products = aggregateByProduct(snapshots)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const productIds = products
    .map((p) => p.product_id)
    .filter((id) => id && id !== "unknown")

  let titles = new Map<string, string>()
  if (productIds.length) {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title"],
      filters: { id: productIds },
    })
    titles = new Map(
      (data || []).map((p: any) => [p.id as string, p.title as string])
    )
  }

  res.json({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    products: products.map((p) => ({
      ...p,
      title:
        p.product_id === "unknown"
          ? "Unknown product"
          : titles.get(p.product_id) || p.product_id,
    })),
  })
}
