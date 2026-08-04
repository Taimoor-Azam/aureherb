import { Suspense } from "react"
import { Metadata } from "next"

import GoogleCallbackPage from "./callback-client"

export const metadata: Metadata = {
  title: "Google sign-in",
  description: "Completing Google sign-in for your AureHerb account.",
}

export default function GoogleCallbackRoute() {
  return (
    <Suspense
      fallback={
        <div className="content-container flex justify-center py-16">
          <p className="text-ui-fg-subtle">Signing you in…</p>
        </div>
      }
    >
      <GoogleCallbackPage />
    </Suspense>
  )
}
