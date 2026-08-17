import { MedusaService } from "@medusajs/framework/utils"
import VariantCost from "./models/variant-cost"
import OrderLineCostSnapshot from "./models/order-line-cost-snapshot"

class ProductCostModuleService extends MedusaService({
  VariantCost,
  OrderLineCostSnapshot,
}) {}

export default ProductCostModuleService
