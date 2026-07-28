"use client"

import { useEffect, useRef } from "react"

type HeroVideoProps = {
  src: string
  poster: string
  className?: string
}

const FADE_HEIGHT_PX = 20

const HeroVideo = ({ src, poster, className }: HeroVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    if (reduceMotion) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    let frameId = 0
    let running = true

    const paint = () => {
      if (!running) {
        return
      }

      const width = video.videoWidth
      const height = video.videoHeight
      if (width > 0 && height > 0) {
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
        }

        ctx.drawImage(video, 0, 0, width, height)

        // Map 20 CSS pixels of on-screen height into source video pixels
        const displayHeight = canvas.clientHeight || height
        const fadeHeight = Math.max(
          FADE_HEIGHT_PX,
          Math.round((FADE_HEIGHT_PX / displayHeight) * height)
        )

        const gradient = ctx.createLinearGradient(
          0,
          height - fadeHeight,
          0,
          height
        )
        gradient.addColorStop(0, "rgba(0,0,0,0)")
        gradient.addColorStop(0.25, "rgba(0,0,0,0.55)")
        gradient.addColorStop(0.7, "rgba(0,0,0,0.85)")
        gradient.addColorStop(1, "rgba(0,0,0,0.95)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, height - fadeHeight, width, fadeHeight)
      }

      frameId = requestAnimationFrame(paint)
    }

    const start = () => {
      video.play().catch(() => {})
      paint()
    }

    if (video.readyState >= 2) {
      start()
    } else {
      video.addEventListener("loadeddata", start, { once: true })
    }

    return () => {
      running = false
      cancelAnimationFrame(frameId)
    }
  }, [reduceMotion])

  if (reduceMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt="" className={className} />
    )
  }

  return (
    <>
      <video
        ref={videoRef}
        className="pointer-events-none absolute h-px w-px opacity-0"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
      <canvas
        ref={canvasRef}
        className={className}
        aria-hidden="true"
        role="presentation"
      />
    </>
  )
}

export default HeroVideo
