"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="container px-6 py-24 md:py-32 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 animate-pulse" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s", animationDuration: "3s" }}
      />

      <div className="mx-auto max-w-4xl relative z-10">
        <Card
          className={`border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-12 md:p-16 shadow-2xl transition-all duration-1000 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 animate-in fade-in zoom-in duration-700">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-xs font-medium text-card-foreground">Ready to transform your workflow?</span>
            </div>

            <h2 className="mb-6 font-serif text-balance text-4xl font-bold tracking-tight text-card-foreground md:text-5xl lg:text-6xl">
              Experience the Future of Insurance Operations
            </h2>

            <p className="mb-10 mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-card-foreground/80">
              Join hundreds of insurance professionals who are already saving time and making smarter decisions with
              AI-powered assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gap-2 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:scale-105 group"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-card-foreground/20 text-card-foreground hover:bg-card-foreground/5 bg-transparent transition-all hover:scale-105"
              >
                Schedule a Demo
              </Button>
            </div>

            <p className="mt-8 text-sm text-card-foreground/60">
              No credit card required • Setup in minutes • Cancel anytime
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
