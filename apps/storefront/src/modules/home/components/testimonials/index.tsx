"use client"

import { useCallback, useEffect, useState } from "react"

const TESTIMONIALS = [
  {
    name: "Ayesha K.",
    quote:
      "I've used AureHerb Hair Growth Oil for six weeks and my scalp feels calmer. The ritual is simple and the scent is clean — not heavy.",
    rating: 5,
  },
  {
    name: "Sana R.",
    quote:
      "Finally an oil that doesn't leave my hair greasy. A few drops after washing and it feels softer by the next morning.",
    rating: 5,
  },
  {
    name: "Fatima M.",
    quote:
      "I was skeptical, but consistent use made a real difference around my temples. Packaging feels thoughtful too.",
    rating: 4,
  },
  {
    name: "Hira N.",
    quote:
      "Gentle, botanical, and easy to fit into my Sunday oiling routine. Cash on delivery made trying it easy.",
    rating: 5,
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="text-sm tracking-widest text-[#6b7c54]"
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(rating)}
      <span className="text-[#d7d0c3]">{"★".repeat(5 - rating)}</span>
    </span>
  )
}

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const total = TESTIMONIALS.length
  const current = TESTIMONIALS[index]

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total)
    },
    [total]
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % total)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [total])

  return (
    <section className="content-container pt-8 pb-16 small:pt-10 small:pb-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl text-[#1c2d22]">Testimonials</h2>
        <p className="mt-3 text-[#5c675f] leading-7">
          What people say about AureHerb Hair Growth Oil.
        </p>
      </div>

      <div
        className="mx-auto mt-8 max-w-2xl text-center"
        role="region"
        aria-roledescription="carousel"
        aria-label="Customer testimonials"
      >
        <div
          key={current.name}
          className="border-t border-[#d7d0c3] pt-6 transition-opacity duration-500"
          aria-live="polite"
        >
          <Stars rating={current.rating} />
          <blockquote className="mt-4 font-display text-xl small:text-2xl leading-8 text-[#1c2d22]">
            “{current.quote}”
          </blockquote>
          <p className="mt-4 text-sm text-[#5c675f]">{current.name}</p>
        </div>

        <div
          className="mt-8 flex justify-center gap-2"
          role="tablist"
          aria-label="Choose testimonial"
        >
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === index ? "bg-[#1c2d22]" : "bg-[#d7d0c3] hover:bg-[#9aa194]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
