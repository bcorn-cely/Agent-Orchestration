import { CoupaChatbotWrapper } from "@/components/coupa/chatbot-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, DollarSign, FileText, CheckCircle2, Clock, AlertCircle, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function CoupaDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold leading-none tracking-tight text-foreground">
                Coupa
              </span>
              <span className="text-[10px] font-medium uppercase leading-none tracking-wider text-muted-foreground">
                Spend Management
              </span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/coupa" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <div className="container px-6 py-8 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex</h1>
          <p className="text-muted-foreground">
            Manage your procurement requests and track spend with AI-powered insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,500</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active POs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Suppliers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">In your network</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Pending Requests */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pending Procurement Requests</CardTitle>
              <CardDescription>Requests awaiting your approval or action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Office Furniture - 50 Chairs</h4>
                    <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">Pending Approval</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Department: Facilities</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>$12,500</span>
                    <span className="mx-1">•</span>
                    <span>Urgent</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">IT Equipment - Laptops</h4>
                    <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">Supplier Selection</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Department: IT</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>$8,900</span>
                    <span className="mx-1">•</span>
                    <span>Routine</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Marketing Materials</h4>
                    <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">Compliance Review</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Department: Marketing</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>$3,200</span>
                    <span className="mx-1">•</span>
                    <span>Routine</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
                <ShoppingCart className="mr-2 h-4 w-4" />
                New Procurement Request
              </Button>
              <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
                <FileText className="mr-2 h-4 w-4" />
                View Purchase Orders
              </Button>
              <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
                <TrendingUp className="mr-2 h-4 w-4" />
                Spend Analytics
              </Button>
              <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
                <Users className="mr-2 h-4 w-4" />
                Manage Suppliers
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent procurement activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Purchase Order Created</h4>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    PO-2024-001234 for office supplies has been created and sent to supplier
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Request Approved</h4>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Procurement request for IT equipment has been approved by finance manager
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                  <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Supplier Selected</h4>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Best supplier selected from 5 options for marketing materials procurement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Your department budget status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Allocated</span>
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">On Track</Badge>
                </div>
                <p className="text-sm text-muted-foreground">$150,000 / $200,000</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">This Month</span>
                </div>
                <p className="text-sm text-muted-foreground">$24,500</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Remaining</span>
                </div>
                <p className="text-sm text-muted-foreground">$25,500</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chatbot */}
      <CoupaChatbotWrapper />
    </main>
  )
}

