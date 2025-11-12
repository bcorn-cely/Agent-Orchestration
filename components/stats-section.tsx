"use client"

import { TrendingUp, Clock, CheckCircle, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function StatsSection() {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const [counts, setCounts] = useState({ stat1: 0, stat2: 0, stat3: 0, stat4: 0 })

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment1 = 87 / steps
    const increment2 = 2.5 / steps
    const increment3 = 99.2 / steps
    const increment4 = 450 / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setCounts({
        stat1: Math.min(Math.round(increment1 * currentStep), 87),
        stat2: Math.min((increment2 * currentStep).toFixed(1) as any, 2.5),
        stat3: Math.min((increment3 * currentStep).toFixed(1) as any, 99.2),
        stat4: Math.min(Math.round(increment4 * currentStep), 450),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <section ref={sectionRef} className="border-y border-border/30 py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse opacity-50" />

      <div className="container px-6 relative z-10">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-4">
          <div
            className={`flex flex-col items-center text-center transition-all duration-700 ${mounted && isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-all hover:scale-110 hover:rotate-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{counts.stat1}%</div>
            <div className="text-sm text-muted-foreground">Faster queries</div>
          </div>

          <div
            className={`flex flex-col items-center text-center transition-all duration-700 delay-100 ${mounted && isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-all hover:scale-110 hover:rotate-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{counts.stat2}hrs</div>
            <div className="text-sm text-muted-foreground">Saved daily</div>
          </div>

          <div
            className={`flex flex-col items-center text-center transition-all duration-700 delay-200 ${mounted && isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-all hover:scale-110 hover:rotate-3">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{counts.stat3}%</div>
            <div className="text-sm text-muted-foreground">Accuracy rate</div>
          </div>

          <div
            className={`flex flex-col items-center text-center transition-all duration-700 delay-300 ${mounted && isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-all hover:scale-110 hover:rotate-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{counts.stat4}+</div>
            <div className="text-sm text-muted-foreground">Active users</div>
          </div>
        </div>
      </div>
    </section>
  )
}
