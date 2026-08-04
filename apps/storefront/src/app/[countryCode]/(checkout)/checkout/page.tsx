import { ensureCustomerShippingOnCart, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  let cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const hadShipping = Boolean(cart.shipping_address?.address_1)
  cart = await ensureCustomerShippingOnCart(cart, customer)

  // Saved address was just applied — skip the address form until Edit.
  if (
    !hadShipping &&
    cart.shipping_address?.address_1 &&
    (cart.email || customer?.email)
  ) {
    redirect(`/${countryCode}/checkout?step=delivery`)
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
