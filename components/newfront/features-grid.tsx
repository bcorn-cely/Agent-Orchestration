"use client"

import { Card } from "@/components/ui/card"
import { FileText, Shield, BarChart3, Zap, Database, Lock } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function FeaturesGrid() {
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
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const features = [
    {
      icon: FileText,
      title: "Policy Insights",
      description: "Instant access to policy details, coverage terms, and claim history with natural language queries.",
      delay: "delay-0",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Automated risk evaluation powered by historical data and industry benchmarks.",
      delay: "delay-75",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time insights into portfolio performance, trends, and opportunities.",
      delay: "delay-150",
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get answers in seconds, not minutes. Our AI understands context and delivers precise information.",
      delay: "delay-200",
    },
    {
      icon: Database,
      title: "Data Integration",
      description: "Seamlessly connected to all Forcepoint systems for comprehensive data access.",
      delay: "delay-300",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance with industry regulations to protect sensitive data.",
      delay: "delay-400",
    },
  ]

  return (
    <section ref={sectionRef} className="py-16 md:py-24 relative overflow-hidden bg-background">
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="container px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <div
            className={`mb-12 text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h2 className="mb-4 font-serif text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Capabilities Designed for Insurance Professionals
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              From policy lookups to risk analysis, our AI assistant streamlines your workflow with intelligent
              automation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className={`group border-border/50 bg-card p-6 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 ${
                    isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                  } ${feature.delay}`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-primary/20">
                    <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
