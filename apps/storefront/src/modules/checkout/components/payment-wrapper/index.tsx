"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

/** Checkout only supports cash on delivery — no card gateway wrapper needed. */
const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ children }) => {
  return <div>{children}</div>
}

export default PaymentWrapper
