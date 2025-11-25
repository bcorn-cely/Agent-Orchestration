"use client"

import { useEffect, useRef, useState } from "react"

interface ParallaxImageSectionProps {
  src: string
  alt: string
  speed?: number
  objectPosition?: string
  title?: string
  subtitle?: string
  floorNumber?: string
}

export function ParallaxImageSection({
  src,
  alt,
  speed = 0.5,
  objectPosition = "center",
  title,
  subtitle,
  floorNumber,
}: ParallaxImageSectionProps) {
  const [scrollY, setScrollY] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight

        const scrollProgress = -rect.top / (rect.height + windowHeight)
        setScrollY(scrollProgress * 300 * speed)

        const viewportCenter = windowHeight / 2
        const sectionCenter = rect.top + rect.height / 2
        const distanceFromCenter = Math.abs(sectionCenter - viewportCenter)
        const maxDistance = windowHeight
        const newOpacity = Math.max(0, 1 - (distanceFromCenter / maxDistance) * 1.5)
        setOpacity(newOpacity)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [speed])

  return (
    <div ref={sectionRef} className="relative h-[500px] md:h-[650px] lg:h-[800px] overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${scrollY}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover scale-110"
          style={{ objectPosition }}
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/5 to-black/10" />

      {(title || subtitle || floorNumber) && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity }}>
          <div className="text-center px-4 max-w-4xl">
            {floorNumber && (
              <div className="text-pink-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4 animate-pulse">
                {floorNumber}
              </div>
            )}
            {title && (
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 drop-shadow-lg max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {floorNumber && (
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-teal-900/80 backdrop-blur-sm border-l-4 border-pink-500 px-4 py-6 rounded"
          style={{ opacity }}
        >
          <div className="text-pink-400 font-bold text-sm mb-1">FLOOR</div>
          <div className="text-white font-bold text-3xl">{floorNumber}</div>
        </div>
      )}
    </div>
  )
}
