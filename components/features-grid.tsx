import { Card } from "@/components/ui/card"
import { FileText, Shield, BarChart3, Zap, Database, Lock } from "lucide-react"

export function FeaturesGrid() {
  return (
    <section className="container px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Capabilities Designed for Insurance Professionals
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80">
            From policy lookups to risk analysis, our AI assistant streamlines your workflow with intelligent
            automation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group border-border/50 bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-transform group-hover:scale-110">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Policy Insights</h3>
            <p className="text-sm leading-relaxed text-card-foreground/70">
              Instant access to policy details, coverage terms, and claim history with natural language queries.
            </p>
          </Card>

          <Card className="group border-border/50 bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-transform group-hover:scale-110">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Risk Assessment</h3>
            <p className="text-sm leading-relaxed text-card-foreground/70">
              Automated risk evaluation powered by historical data and industry benchmarks.
            </p>
          </Card>

          <Card className="group border-border/50 bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-transform group-hover:scale-110">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Analytics Dashboard</h3>
            <p className="text-sm leading-relaxed text-card-foreground/70">
              Real-time insights into portfolio performance, trends, and opportunities.
            </p>
          </Card>

          <Card className="group border-border/50 bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-transform group-hover:scale-110">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Instant Responses</h3>
            <p className="text-sm leading-relaxed text-card-foreground/70">
              Get answers in seconds, not minutes. Our AI understands context and delivers precise information.
            </p>
          </Card>

          <Card className="group border-border/50 bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-transform group-hover:scale-110">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Data Integration</h3>
            <p className="text-sm leading-relaxed text-card-foreground/70">
              Seamlessly connected to all Newfront systems for comprehensive data access.
            </p>
          </Card>

          <Card className="group border-border/50 bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10 transition-transform group-hover:scale-110">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Enterprise Security</h3>
            <p className="text-sm leading-relaxed text-card-foreground/70">
              Bank-level encryption and compliance with industry regulations to protect sensitive data.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
