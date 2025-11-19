"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function UseCasesSection() {
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
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const useCases = [
    {
      title: "Policy Renewals",
      description: "Automate renewal notifications and track policy status across your entire portfolio",
      benefits: ["Real-time renewal tracking", "Automated client notifications", "Risk assessment updates"],
    },
    {
      title: "Loss Trending",
      description: "Identify patterns and predict future risks with historical loss data analysis",
      benefits: ["Predictive risk modeling", "Industry benchmarking", "Custom report generation"],
    },
    {
      title: "Quote Comparison",
      description: "Compare carrier quotes instantly and identify the best coverage options",
      benefits: ["Side-by-side comparisons", "Coverage gap analysis", "Cost-benefit insights"],
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="border-y border-border/30 bg-gradient-to-b from-secondary/30 via-background to-secondary/30 py-16 md:py-24"
    >
      <div className="container px-6">
        <div className="mx-auto max-w-5xl">
          <div
            className={`mb-12 text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h2 className="mb-4 font-serif text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Built for Real Insurance Workflows
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80">
              See how Forcepoint Intelligence streamlines your daily operations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className={`border-border/50 bg-card p-8 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-6">
                  <h3 className="mb-3 text-xl font-bold text-card-foreground">{useCase.title}</h3>
                  <p className="text-sm leading-relaxed text-card-foreground/70">{useCase.description}</p>
                </div>

                <ul className="space-y-3">
                  {useCase.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-card-foreground/80">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
