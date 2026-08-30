import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_COST_MODULE } from "../../../modules/product-cost"
import ProductCostModuleService from "../../../modules/product-cost/service"
import { marginPercent, roundMoney } from "../../../modules/product-cost/utils"
import { toAmountNumber } from "../../../utils/money"

type CostInput = {
  variant_id: string
  unit_cost: number
}

type PutBody = {
  product_id?: string
  costs?: CostInput[]
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.query.product_id as string | undefined

  if (!productId) {
    return res.status(400).json({
      message: "product_id query parameter is required",
    })
  }

  const costService: ProductCostModuleService =
    req.scope.resolve(PRODUCT_COST_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.calculated_price.*",
      "variants.prices.*",
    ],
    filters: {
      id: productId,
    },
  })

  const product = products?.[0] as any
  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  const costs = await costService.listVariantCosts({
    product_id: productId,
  })

  const costByVariant = new Map(
    costs.map((c: any) => [c.variant_id as string, c])
  )

  const variants = (product.variants || []).map((variant: any) => {
    const cost = costByVariant.get(variant.id)
    const sellPrice =
      toAmountNumber(variant.calculated_price?.calculated_amount) ??
      toAmountNumber(variant.prices?.[0]?.amount) ??
      null
    const unitCost =
      cost != null ? Number(cost.unit_cost) : null
    const profit =
      sellPrice != null && unitCost != null
        ? roundMoney(sellPrice - unitCost)
        : null

    return {
      variant_id: variant.id,
      title: variant.title,
      sku: variant.sku,
      sell_price: sellPrice,
      unit_cost: unitCost,
      profit,
      margin_percent:
        profit != null && sellPrice != null
          ? marginPercent(profit, sellPrice)
          : null,
      currency_code: cost?.currency_code || "pkr",
      cost_id: cost?.id ?? null,
    }
  })

  res.json({
    product_id: productId,
    variants,
  })
}

export async function PUT(req: MedusaRequest<PutBody>, res: MedusaResponse) {
  const productId =
    req.body?.product_id || (req.query.product_id as string | undefined)
  const costs = req.body?.costs

  if (!productId) {
    return res.status(400).json({
      message: "product_id is required",
    })
  }

  if (!Array.isArray(costs)) {
    return res.status(400).json({
      message: "costs array is required",
    })
  }

  const costService: ProductCostModuleService =
    req.scope.resolve(PRODUCT_COST_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id"],
    filters: { id: productId },
  })

  const product = products?.[0] as any
  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  const allowedVariantIds = new Set(
    (product.variants || []).map((v: any) => v.id as string)
  )

  const existing = await costService.listVariantCosts({
    product_id: productId,
  })
  const existingByVariant = new Map(
    existing.map((c: any) => [c.variant_id as string, c])
  )

  const saved: Array<Record<string, unknown>> = []

  for (const row of costs) {
    if (!row?.variant_id || !allowedVariantIds.has(row.variant_id)) {
      return res.status(400).json({
        message: `Invalid variant_id: ${row?.variant_id}`,
      })
    }

    const unitCost = Number(row.unit_cost)
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      return res.status(400).json({
        message: `unit_cost must be a non-negative number for ${row.variant_id}`,
      })
    }

    const current = existingByVariant.get(row.variant_id)
    if (current) {
      const [updated] = await costService.updateVariantCosts([
        {
          id: current.id,
          unit_cost: roundMoney(unitCost),
          currency_code: "pkr",
        },
      ])
      saved.push(updated)
    } else {
      const created = await costService.createVariantCosts({
        variant_id: row.variant_id,
        product_id: productId,
        unit_cost: roundMoney(unitCost),
        currency_code: "pkr",
      })
      saved.push(created)
    }
  }

  res.json({
    product_id: productId,
    costs: saved,
  })
}
