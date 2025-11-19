import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="container px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Powered by Advanced AI Technology</span>
        </div>

        <h1 className="mb-6 font-serif text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          De-Risking Insurance Operations
        </h1>

        <p className="mb-10 max-w-3xl text-pretty text-lg leading-relaxed text-foreground/80 md:text-xl">
          Streamline policy inquiries, automate risk assessments, and access real-time data insights. Built specifically
          for Forcepoint teams to work faster and smarter.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
            Start Conversation
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-foreground/20 text-foreground hover:bg-foreground/5 bg-transparent"
          >
            View Documentation
          </Button>
        </div>

        <Card className="mt-12 overflow-hidden border-border/50 bg-card shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border/50 bg-card px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold text-card-foreground">AI Assistant</div>
              <div className="flex items-center gap-1.5 text-xs text-card-foreground/60">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                Ready to help
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-gradient-to-b from-card to-muted/30 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/50">
                <User className="h-4 w-4 text-foreground/70" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="rounded-2xl rounded-tl-sm bg-secondary/80 px-4 py-3 shadow-sm">
                  <p className="text-sm text-foreground">What's the status of policy #NFI-2024-8472?</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm shadow-primary/20">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-3 shadow-sm">
                  <p className="text-sm text-card-foreground">
                    Policy #NFI-2024-8472 is currently <strong>Active</strong>. Last updated 2 days ago.
                  </p>
                  <div className="mt-3 grid gap-2 rounded-lg border border-border/50 bg-background/40 p-3 backdrop-blur-sm">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground/60">Coverage Type:</span>
                      <span className="font-medium text-foreground">Commercial Property</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground/60">Premium:</span>
                      <span className="font-medium text-foreground">$12,450/year</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground/60">Renewal Date:</span>
                      <span className="font-medium text-foreground">Dec 15, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 bg-muted/50 px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-card-foreground/60">
              <div className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/40"></div>
              Example conversation - Start your own to see real-time data
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

function User({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
