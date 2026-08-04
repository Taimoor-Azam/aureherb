import { Metadata } from "next"

import TrackOrder from "@modules/order/components/track-order"

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your AureHerb order with your order reference and contact details.",
}

type TrackOrderPageProps = {
  searchParams: Promise<{
    reference?: string
  }>
}

export default async function TrackOrderPage(props: TrackOrderPageProps) {
  const searchParams = await props.searchParams

  return <TrackOrder initialReference={searchParams.reference || ""} />
}
