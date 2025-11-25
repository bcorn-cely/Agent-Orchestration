import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Scale, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Users,
  BarChart3,
  Zap,
  Building2,
  ShoppingBag,
  UserCheck
} from "lucide-react"
import { MultiWorkflowChatbotWrapper } from "@/components/feature/multi-workflow-chatbot-wrapper"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock workflow runs for demo
const mockWorkflowRuns = [
  {
    id: "org-val-001",
    workflow: "Organization Validation",
    domain: "reebok.com",
    status: "completed",
    confidence: 0.92,
    createdAt: "2025-01-15",
    workers: 3,
  },
  {
    id: "deal-verify-002",
    workflow: "Deal Verification",
    offer: "20% Off Sale",
    status: "verified",
    method: "Playwright",
    createdAt: "2025-01-14",
    artifacts: 2,
  },
  {
    id: "teacher-verify-003",
    workflow: "Teacher Verification",
    member: "John Doe",
    state: "CA",
    status: "pending_approval",
    createdAt: "2025-01-13",
    msrId: "msr-123",
  },
  {
    id: "org-val-004",
    workflow: "Organization Validation",
    domain: "nike.com",
    status: "completed",
    confidence: 0.95,
    createdAt: "2025-01-12",
    workers: 3,
  },
]

const kpiData = {
  workflowsCompleted: "1,247",
  avgConfidenceScore: "89%",
  parallelWorkersUsed: "3",
  avgVerificationTime: "4.2s",
  dealsVerified: "342",
  teachersVerified: "156",
  approvalRate: "94%",
  automationSuccess: "97%",
}

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">AI Workflows Platform</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#workflows" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Workflows
              </a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Stats
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI-Powered Workflows</h1>
          <p className="text-muted-foreground text-lg">
            Automate complex business processes with intelligent agents, parallel workers, and human-in-the-loop approvals
          </p>
        </div>

        {/* KPI Cards */}
        <div id="stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Workflows Completed</div>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.workflowsCompleted}</div>
            <div className="text-xs text-muted-foreground mt-1">All time</div>
          </Card>

          <Card className="p-6 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Avg Confidence Score</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.avgConfidenceScore}</div>
            <div className="text-xs text-muted-foreground mt-1">Across all validations</div>
          </Card>

          <Card className="p-6 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Parallel Workers</div>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.parallelWorkersUsed}</div>
            <div className="text-xs text-muted-foreground mt-1">Per org validation</div>
          </Card>

          <Card className="p-6 border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Avg Verification Time</div>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.avgVerificationTime}</div>
            <div className="text-xs text-muted-foreground mt-1">Per workflow run</div>
          </Card>
        </div>

        {/* Secondary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Deals Verified</div>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.dealsVerified}</div>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </Card>

          <Card className="p-6 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Teachers Verified</div>
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.teachersVerified}</div>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </Card>

          <Card className="p-6 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Approval Rate</div>
              <ShieldCheck className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.approvalRate}</div>
            <div className="text-xs text-muted-foreground mt-1">Human-in-the-loop</div>
          </Card>

          <Card className="p-6 border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Automation Success</div>
              <Zap className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpiData.automationSuccess}</div>
            <div className="text-xs text-muted-foreground mt-1">Without manual intervention</div>
          </Card>
        </div>

        {/* Recent Workflow Runs */}
        <Card className="p-6 border-blue-500/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Workflow Runs</h2>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWorkflowRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-mono text-sm">{run.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {run.workflow}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {run.domain || run.offer || `${run.member} (${run.state})`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        run.status === "completed" || run.status === "verified"
                          ? "default"
                          : run.status === "pending_approval"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {run.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {run.confidence ? (
                      <span className="text-green-600 font-medium">{(run.confidence * 100).toFixed(0)}% confidence</span>
                    ) : run.method ? (
                      <span className="text-blue-600">{run.method}</span>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {run.createdAt}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Workflows Section */}
        <div id="workflows" className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Available Workflows</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Contract Management</h3>
              <p className="text-muted-foreground mb-4">
                Draft contracts, detect risks, manage approvals with persona-based access control.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="#chatbot">Test Workflow</a>
              </Button>
            </Card>

            <Card className="p-6 border-green-500/20 hover:border-green-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Organization Validation</h3>
              <p className="text-muted-foreground mb-4">
                Validate organizations by domain using parallel worker agents (Legal, Sector, Trust).
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="#chatbot">Test Workflow</a>
              </Button>
            </Card>

            <Card className="p-6 border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Deal Verification</h3>
              <p className="text-muted-foreground mb-4">
                Verify retail deals with browser automation (Playwright) or HTTP probes. Classify failures.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="#chatbot">Test Workflow</a>
              </Button>
            </Card>

            <Card className="p-6 border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Teacher Verification</h3>
              <p className="text-muted-foreground mb-4">
                Verify teacher community membership via state registry lookup with MSR approval.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="#chatbot">Test Workflow</a>
              </Button>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-12 grid lg:grid-cols-3 gap-6">
          <Card className="p-6 border-blue-500/20">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Parallel Worker Agents</h3>
            <p className="text-muted-foreground">
              Run multiple specialized agents simultaneously to gather information faster. Each worker uses tools to make intelligent decisions.
            </p>
          </Card>

          <Card className="p-6 border-green-500/20">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Human-in-the-Loop</h3>
            <p className="text-muted-foreground">
              Critical decisions require human approval. Workflows pause and wait for MSR or approver input before proceeding.
            </p>
          </Card>

          <Card className="p-6 border-purple-500/20">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Browser Automation</h3>
            <p className="text-muted-foreground">
              Verify deals and offers with Playwright browser automation or HTTP probes. Classify technical vs business logic failures.
            </p>
          </Card>
        </div>
      </div>

      <MultiWorkflowChatbotWrapper />
    </div>
  )
}

