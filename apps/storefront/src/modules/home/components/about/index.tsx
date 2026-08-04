export default function About() {
  return (
    <section
      className="bg-[#f7f3eb] border-t border-[#d7d0c3]"
      aria-labelledby="about-heading"
    >
      <div className="content-container py-16 small:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="about-heading"
            className="font-display text-3xl text-[#1c2d22]"
          >
            Why Choose AureHerb?
          </h2>
          <div className="mt-6 space-y-5 text-[#5c675f] leading-7">
            <p>
              AureHerb is an online store for botanical hair care. Our flagship
              product is AureHerb Hair Growth Oil — a premium blend of botanical
              oils and herbal extracts made to nourish the scalp, strengthen
              hair, and support healthier-looking growth.
            </p>
            <p>
              At AureHerb, we believe healthy hair begins with healthy roots.
              Our Hair Growth Oil combines time-honored botanical ingredients
              with modern formulation techniques to deliver a premium hair care
              experience.
            </p>
            <p>
              Unlike ordinary hair oils, AureHerb is enriched with multiple
              botanical oils and herbal extracts that work together to provide
              complete scalp and hair nourishment.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
