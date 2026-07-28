import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "AureHerb",
    template: "%s | AureHerb",
  },
  description:
    "AureHerb botanical remedies — herbal teas, oils, and wellness blends with cash on delivery.",
  icons: {
    icon: "/images/aureherb-logo.png",
    apple: "/images/aureherb-logo.png",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Source+Sans+3:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-herb-sand text-herb-ink font-sans antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
