import { Metadata } from "next"

import About from "@modules/home/components/about"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Testimonials from "@modules/home/components/testimonials"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "AureHerb | Botanical remedies for daily ritual",
  description:
    "Shop AureHerb herbal teas, wellness blends, essential oils, and dried herbs. Cash on delivery available.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  const featuredCollections = collections.filter(
    (collection) => collection.handle === "featured"
  )

  return (
    <>
      <Hero />
      <div className="pt-8 pb-6 bg-[#f7f3eb]">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={featuredCollections} region={region} />
        </ul>
      </div>
      <Testimonials />
      <About />
    </>
  )
}
