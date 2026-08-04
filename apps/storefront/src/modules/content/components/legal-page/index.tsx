import { ReactNode } from "react"
import { Heading, Text } from "@modules/common/components/ui"

type LegalPageProps = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: LegalPageProps) {
  return (
    <section className="bg-[#f7f3eb] border-t border-[#d7d0c3]">
      <div className="content-container py-12 small:py-16">
        <article className="mx-auto max-w-3xl">
          <Heading level="h1" className="text-3xl small:text-4xl text-[#1c2d22]">
            {title}
          </Heading>
          <Text className="mt-3 text-sm text-[#7a847c]">
            Last updated: {lastUpdated}
          </Text>
          <div className="mt-8 space-y-6 text-[#5c675f] leading-7 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#1c2d22] [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:underline [&_a]:text-[#1c2d22]">
            {children}
          </div>
        </article>
      </div>
    </section>
  )
}
