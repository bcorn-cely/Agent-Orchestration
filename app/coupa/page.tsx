import { CoupaChatbotWrapper } from "@/components/coupa/chatbot-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, DollarSign, FileText, TrendingUp, Network, Zap, Shield, Bot, ArrowRight, BarChart3, Users2, Sparkles } from 'lucide-react'
import Link from "next/link"

export default function CoupaDashboard() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B35]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none text-foreground">
                Coupa
              </span>
              <span className="text-[10px] font-medium uppercase leading-none tracking-wider text-muted-foreground">
                Total Spend Management
              </span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/coupa" className="text-sm font-medium text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80">
              Platform
            </Link>
            <Button size="sm" className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container px-6 py-16">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Badge className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20 hover:bg-[#FF6B35]/20">
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Native Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Total Spend Management Powered by AI
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Optimize direct and indirect spend across finance, procurement, and supply chain. 
              Powered by $8T+ in real-world spend data from 10M+ buyers and suppliers.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90">
                Start Procurement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-6 py-12 space-y-12">
        {/* Platform Modules */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Complete Platform Modules</h2>
            <p className="text-muted-foreground">
              End-to-end solutions for every stage of your spend lifecycle
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:border-[#FF6B35]/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-4">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Procure-to-Pay</CardTitle>
                <CardDescription>
                  Streamline purchasing and payments with automated intake, approvals, and supplier payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Automated requisitions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Smart approvals
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    On-contract spend optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35]/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 mb-4">
                  <Network className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Source-to-Contract</CardTitle>
                <CardDescription>
                  Simplify sourcing, accelerate contract creation, and monitor supplier risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    Strategic sourcing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    Contract lifecycle management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    Supplier risk monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35]/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 mb-4">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>AP Automation</CardTitle>
                <CardDescription>
                  Automate invoicing, payments, expense management, and fraud detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Invoice processing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Virtual card payments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Fraud prevention
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35]/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Supply Chain Collaboration</CardTitle>
                <CardDescription>
                  Secure critical supplies, track materials, and resolve supply imbalances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Real-time visibility
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Supply risk management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Supplier collaboration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35]/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
                  <DollarSign className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle>Treasury & Cash</CardTitle>
                <CardDescription>
                  Global cash visibility, liquidity protection, and fraud controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    Cash position visibility
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    AI fraud detection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    Liquidity optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35]/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FF6B35]/10 mb-4">
                  <BarChart3 className="h-6 w-6 text-[#FF6B35]" />
                </div>
                <CardTitle>Spend Analytics</CardTitle>
                <CardDescription>
                  AI-powered insights to optimize spending and predict disruptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                    Predictive analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                    Spend optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                    Real-time reporting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI-Powered Features */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20">
              <Bot className="mr-1 h-3 w-3" />
              Coupa AI
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">AI That Knows Your Business</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powered by over $8 trillion in real-world spend data from a network of 10M+ buyers and suppliers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Automate Tasks</CardTitle>
                <CardDescription>
                  Eliminate manual work with intelligent automation across procurement workflows
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Predict Disruptions</CardTitle>
                <CardDescription>
                  Stay ahead of supply chain risks with AI-powered predictive analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 mb-2">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Optimize Strategies</CardTitle>
                <CardDescription>
                  Make smarter decisions with AI recommendations based on global spend patterns
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Network Stats */}
        <section className="rounded-lg border bg-gradient-to-br from-[#FF6B35]/5 to-[#FF6B35]/10 p-8">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#FF6B35]">$8T+</div>
              <p className="text-sm font-medium text-muted-foreground">Real-World Spend Data</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#FF6B35]">10M+</div>
              <p className="text-sm font-medium text-muted-foreground">Buyers & Suppliers</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#FF6B35]">3,000+</div>
              <p className="text-sm font-medium text-muted-foreground">Enterprise Customers</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-lg border bg-muted/50 p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Transform Your Spend Management?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of enterprises optimizing their procurement, finance, and supply chain operations with Coupa
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90">
              Request a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </section>
      </div>

      {/* Chatbot */}
      <CoupaChatbotWrapper />
    </main>
  )
}
