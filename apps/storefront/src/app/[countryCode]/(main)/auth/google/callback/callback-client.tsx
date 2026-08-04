"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import { completeGoogleCallback } from "@lib/data/customer"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const { countryCode } = useParams() as { countryCode: string }
  const [error, setError] = useState<string | null>(null)

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!queryParams.code && !queryParams.state) {
        setError("Missing Google sign-in details. Please try again.")
        return
      }

      try {
        const result = await completeGoogleCallback(queryParams, countryCode)
        if (cancelled) {
          return
        }
        if (!result.success) {
          setError(result.error)
        }
      } catch (err) {
        // Next.js redirect() throws; ignore redirect errors.
        const digest =
          typeof err === "object" && err && "digest" in err
            ? String((err as { digest?: string }).digest)
            : ""
        if (digest.startsWith("NEXT_REDIRECT")) {
          return
        }
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [countryCode, queryParams])

  return (
    <div className="content-container flex justify-center py-16">
      <div className="max-w-md w-full text-center space-y-4">
        <Heading level="h1" className="text-2xl text-[#1c2d22]">
          {error ? "Google sign-in failed" : "Signing you in…"}
        </Heading>
        {error ? (
          <>
            <Text className="text-ui-fg-subtle">{error}</Text>
            <LocalizedClientLink href="/account">
              <Button variant="secondary">Back to sign in</Button>
            </LocalizedClientLink>
          </>
        ) : (
          <Text className="text-ui-fg-subtle">
            Finishing Google authentication. You will be redirected shortly.
          </Text>
        )}
      </div>
    </div>
  )
}
