"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import { getProductContent } from "@lib/product-content/hair-growth-oil"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const content = getProductContent({
    handle: product.handle,
    id: product.id,
  })

  const tabs = [
    ...(content
      ? [
          {
            label: "Ingredients",
            component: <IngredientsTab ingredients={content.ingredients} />,
          },
          {
            label: "Key Benefits",
            component: <BenefitsTab benefits={content.benefits} />,
          },
        ]
      : []),
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const IngredientsTab = ({
  ingredients,
}: {
  ingredients: Array<{ name: string; detail: string }>
}) => {
  return (
    <div className="py-6">
      <ul className="flex flex-col gap-y-5">
        {ingredients.map((item) => (
          <li key={item.name}>
            <p className="text-sm font-semibold text-[#1c2d22]">{item.name}</p>
            <p className="mt-1 text-sm leading-6 text-[#5c675f]">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

const BenefitsTab = ({ benefits }: { benefits: string[] }) => {
  return (
    <div className="py-6">
      <ul className="flex flex-col gap-y-2.5">
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex gap-x-2 text-sm leading-6 text-[#5c675f]"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7c54]" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="flex flex-col gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
