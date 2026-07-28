import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HeroVideo from "./hero-video"

const Hero = () => {
  return (
    <section className="relative w-full bg-[#f7f3eb] animate-[fade-in-top_0.7s_ease-out]">
      <h1 className="sr-only">AureHerb Hair Growth Oil</h1>
      <LocalizedClientLink
        href="/store"
        className="relative block w-full overflow-hidden shadow-[0_12px_28px_-10px_rgba(0,0,0,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c4a35a]"
        aria-label="Shop AureHerb Hair Growth Oil"
      >
        <div className="motion-reduce:hidden">
          <HeroVideo
            src="/videos/hair-oiling-ritual.mp4"
            poster="/images/aureherb-hair-growth-oil-banner.png"
            className="block h-auto w-full"
          />
        </div>
        <Image
          src="/images/aureherb-hair-growth-oil-banner.png"
          alt="AureHerb Hair Growth Oil — Rosemary, Castor, and Black Seed. Nourish your roots. Grow your confidence."
          width={1024}
          height={426}
          priority
          sizes="100vw"
          className="hidden h-auto w-full motion-reduce:block"
        />
      </LocalizedClientLink>
    </section>
  )
}

export default Hero
