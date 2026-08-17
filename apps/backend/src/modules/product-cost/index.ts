import ProductCostModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRODUCT_COST_MODULE = "productCost"

export default Module(PRODUCT_COST_MODULE, {
  service: ProductCostModuleService,
})
