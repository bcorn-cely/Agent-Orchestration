import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2,
  ShoppingBag,
  UserCheck,
  Code,
  Zap,
  GitBranch,
  BookOpen,
  Terminal,
  FileCode,
  Settings
} from "lucide-react"

export default function HomePage() {
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
              <span className="text-xl font-bold">Shareable Gateway Workflows</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#workflows" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Workflows
              </a>
              <a href="#api" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                API
              </a>
              <a href="#getting-started" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Getting Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Shareable Gateway Workflows Demo</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            A comprehensive Next.js application demonstrating multi-workflow orchestration using AI SDK 6, 
            Vercel Workflows, and advanced agent patterns. This application showcases how to build production-ready 
            AI-powered workflows with parallel execution, tool calling, and intelligent routing.
          </p>
        </div>

        {/* Architecture Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Architecture Overview
          </h2>
          <Card className="p-6 border-blue-500/20">
            <p className="text-muted-foreground mb-4">
              This application demonstrates a <strong>unified orchestrator pattern</strong> where a central AI agent 
              coordinates multiple specialized workflows. The architecture follows these key principles:
            </p>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li><strong>Agent-Based Workflows</strong>: Each workflow uses AI agents with tool calling capabilities</li>
              <li><strong>Parallel Execution</strong>: Worker agents run in parallel for improved performance</li>
              <li><strong>Type Safety</strong>: Full TypeScript support with Zod schemas</li>
              <li><strong>Modular Design</strong>: Workflows are self-contained and reusable</li>
            </ul>
          </Card>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-blue-500/20">
              <h3 className="text-xl font-bold mb-3">AI SDK 6 Integration</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>ToolLoopAgent</strong>: Multi-step agent execution with tool calling</li>
                <li>• <strong>Tool Definitions</strong>: Structured tool schemas using Zod</li>
                <li>• <strong>Model Routing</strong>: Intelligent model selection based on task complexity</li>
                <li>• <strong>Gateway Provider</strong>: Unified AI gateway for multiple model providers</li>
                <li>• <strong>Agent.generate()</strong>: Non-streaming agent execution for workflows</li>
              </ul>
            </Card>
            <Card className="p-6 border-green-500/20">
              <h3 className="text-xl font-bold mb-3">Workflow System</h3>
              <p className="text-muted-foreground mb-3">
                The application includes <strong>4 main workflows</strong>:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>1. <strong>Organization Validation</strong> (Workflow-based)</li>
                <li>2. <strong>Deal Verification</strong> (Agent-based)</li>
                <li>3. <strong>Teacher Verification</strong> (Agent-based)</li>
                <li>4. <strong>Contract Management</strong> (Referenced)</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Workflows */}
        <section id="workflows" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Code className="w-6 h-6" />
            Workflows
          </h2>
          <div className="space-y-6">
            {/* Organization Validation */}
            <Card className="p-6 border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Organization Validation</h3>
                  <Badge variant="outline" className="mt-1">Workflow-based</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Validates organizations by domain using parallel worker agents. Uses Vercel Workflows for durable execution.
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>Location:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">workflows/org-validation/</code></div>
                <div><strong>API:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">POST /api/workflows/org-validation/validate</code></div>
                <div><strong>Features:</strong> Parallel execution, fan-out pattern, cross-checking, confidence scoring</div>
                <div><strong>Worker Agents:</strong> Legal Scout, Sector Analyst, Trust Officer</div>
              </div>
            </Card>

            {/* Deal Verification */}
            <Card className="p-6 border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Deal Verification</h3>
                  <Badge variant="outline" className="mt-1">Agent-based</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Verifies retail deals/offers by simulating customer journeys. Supports Playwright (browser automation) or HTTP probes.
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>Location:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">agents/deal-verification/</code></div>
                <div><strong>API:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">POST /api/workflows/deal-verification/verify</code></div>
                <div><strong>Features:</strong> Playwright mode, HTTP probe mode, artifact persistence, failure classification</div>
              </div>
            </Card>

            {/* Teacher Verification */}
            <Card className="p-6 border-orange-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Teacher Verification</h3>
                  <Badge variant="outline" className="mt-1">Agent-based</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Verifies teacher community membership via state registry database lookup. Returns results immediately.
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>Location:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">agents/teacher-verification/</code></div>
                <div><strong>API:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">POST /api/workflows/teacher-verification/verify</code></div>
                <div><strong>Features:</strong> State-specific registry lookup, member validation, immediate results</div>
              </div>
            </Card>
          </div>
        </section>

        {/* Unified Orchestrator */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Unified Orchestrator
          </h2>
          <Card className="p-6 border-indigo-500/20">
            <p className="text-muted-foreground mb-4">
              The orchestrator is a <strong>ToolLoopAgent</strong> that coordinates all workflows through tool calling. 
              It uses intelligent model selection based on task complexity and supports dynamic model override.
            </p>
            <div className="space-y-3">
              <div>
                <strong className="text-foreground">Tools:</strong>
                <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                  <li><code className="text-xs bg-muted px-2 py-1 rounded">orgValidate</code> - Triggers organization validation workflow</li>
                  <li><code className="text-xs bg-muted px-2 py-1 rounded">dealVerify</code> - Executes deal verification agent</li>
                  <li><code className="text-xs bg-muted px-2 py-1 rounded">teacherVerify</code> - Executes teacher verification agent</li>
                </ul>
              </div>
              <div>
                <strong className="text-foreground">API Endpoint:</strong>
                <div className="mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded">POST /api/orchestrator</code>
                </div>
              </div>
              <div>
                <strong className="text-foreground">Model Selection:</strong>
                <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                  <li>Simple tasks → <code className="text-xs bg-muted px-2 py-1 rounded">openai/gpt-4o-mini</code></li>
                  <li>Complex tasks → <code className="text-xs bg-muted px-2 py-1 rounded">anthropic/claude-sonnet-4.5</code></li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* API Endpoints */}
        <section id="api" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            API Endpoints
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-blue-500/20">
              <h3 className="text-lg font-bold mb-3">Orchestrator</h3>
              <div className="space-y-2 text-sm">
                <div><code className="text-xs bg-muted px-2 py-1 rounded">POST /api/orchestrator</code></div>
                <p className="text-muted-foreground">Unified orchestrator endpoint with hardcoded prompt</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/20">
              <h3 className="text-lg font-bold mb-3">Workflows</h3>
              <div className="space-y-2 text-sm">
                <div><code className="text-xs bg-muted px-2 py-1 rounded">POST /api/workflows/org-validation/validate</code></div>
                <div><code className="text-xs bg-muted px-2 py-1 rounded">POST /api/workflows/deal-verification/verify</code></div>
                <div><code className="text-xs bg-muted px-2 py-1 rounded">POST /api/workflows/teacher-verification/verify</code></div>
              </div>
            </Card>
          </div>
        </section>

        {/* Getting Started */}
        <section id="getting-started" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Getting Started
          </h2>
          <Card className="p-6 border-blue-500/20">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Node.js 18+</li>
                  <li>pnpm (or npm/yarn)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Installation</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <div className="mb-2"># Install dependencies</div>
                  <div className="mb-2">pnpm install</div>
                  <div className="mb-2"># Set up environment variables</div>
                  <div className="mb-2">cp .env.example .env</div>
                  <div className="mb-2"># Start development server</div>
                  <div>pnpm dev</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Environment Variables</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <div className="mb-2"># AI Gateway (optional)</div>
                  <div className="mb-2">AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1</div>
                  <div className="mb-2">AI_GATEWAY_API_KEY=...</div>
                  <div className="mb-2"># Feature Flags</div>
                  <div className="mb-2">USE_HTTP_PROBES_ONLY=false</div>
                  <div className="mb-2"># API Base URLs</div>
                  <div>APP_BASE_URL=http://localhost:3000</div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Key Patterns */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FileCode className="w-6 h-6" />
            Key Patterns & Best Practices
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-blue-500/20">
              <h3 className="text-lg font-bold mb-3">Agent Organization</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <code className="text-xs bg-muted px-2 py-1 rounded">index.ts</code> - Main entry point</li>
                <li>• <code className="text-xs bg-muted px-2 py-1 rounded">operations.ts</code> - Helper functions</li>
                <li>• <code className="text-xs bg-muted px-2 py-1 rounded">types.ts</code> - Type definitions</li>
              </ul>
            </Card>
            <Card className="p-6 border-green-500/20">
              <h3 className="text-lg font-bold mb-3">Workflow vs Agent</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Workflows</strong>: Use Vercel Workflows for durable, long-running processes</li>
                <li>• <strong>Agents</strong>: Use ToolLoopAgent for immediate, stateless operations</li>
              </ul>
            </Card>
            <Card className="p-6 border-purple-500/20">
              <h3 className="text-lg font-bold mb-3">Parallel Execution</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Organization validation demonstrates parallel worker execution using Promise.all():
              </p>
              <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                Promise.all([<br />
                &nbsp;&nbsp;runLegalScout({'{'} domain {'}'}),<br />
                &nbsp;&nbsp;runSectorAnalyst({'{'} domain {'}'}),<br />
                &nbsp;&nbsp;runTrustOfficer({'{'} domain {'}'})<br />
                ])
              </div>
            </Card>
            <Card className="p-6 border-orange-500/20">
              <h3 className="text-lg font-bold mb-3">Model Selection</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Intelligent model routing based on task complexity:
              </p>
              <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                const complexity = determineTaskComplexity(prompt);<br />
                const model = complexity === 'complex'<br />
                &nbsp;&nbsp;? 'anthropic/claude-sonnet-4.5'<br />
                &nbsp;&nbsp;: 'openai/gpt-4o-mini';
              </div>
            </Card>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
          <Card className="p-6 border-blue-500/20">
            <ul className="space-y-2 text-muted-foreground">
              <li>• <a href="https://sdk.vercel.ai/docs" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">AI SDK Documentation</a></li>
              <li>• <a href="https://vercel.com/docs/workflows" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Vercel Workflows Documentation</a></li>
              <li>• <a href="https://nextjs.org/docs" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Next.js Documentation</a></li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  )
}
