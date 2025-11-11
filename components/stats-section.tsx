import { TrendingUp, Clock, CheckCircle, Users } from "lucide-react"

export function StatsSection() {
  return (
    <section className="border-y border-border/30 bg-gradient-to-b from-background to-secondary/30 py-12">
      <div className="container px-6">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">87%</div>
            <div className="text-sm text-foreground/70">Faster queries</div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">2.5hrs</div>
            <div className="text-sm text-foreground/70">Saved daily</div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">99.2%</div>
            <div className="text-sm text-foreground/70">Accuracy rate</div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-sm shadow-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">450+</div>
            <div className="text-sm text-foreground/70">Active users</div>
          </div>
        </div>
      </div>
    </section>
  )
}
