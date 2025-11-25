# Shareable Gateway Workflows Demo

A comprehensive Next.js application demonstrating multi-workflow orchestration using AI SDK 6, Vercel Workflows, and advanced agent patterns. This application showcases how to build production-ready AI-powered workflows with parallel execution, tool calling, and intelligent routing.

## 🏗️ Architecture Overview

This application demonstrates a **unified orchestrator pattern** where a central AI agent coordinates multiple specialized workflows. The architecture follows these key principles:

- **Agent-Based Workflows**: Each workflow uses AI agents with tool calling capabilities
- **Parallel Execution**: Worker agents run in parallel for improved performance
- **Type Safety**: Full TypeScript support with Zod schemas
- **Modular Design**: Workflows are self-contained and reusable

## 🚀 Key Features

### AI SDK 6 Integration

- **ToolLoopAgent**: Multi-step agent execution with tool calling
- **Tool Definitions**: Structured tool schemas using Zod
- **Model Routing**: Intelligent model selection based on task complexity
- **Gateway Provider**: Unified AI gateway for multiple model providers
- **Agent.generate()**: Non-streaming agent execution for workflows

### Workflow System

The application includes **4 main workflows**:

1. **Organization Validation** (Workflow-based)
2. **Deal Verification** (Agent-based)
3. **Teacher Verification** (Agent-based)
4. **Contract Management** (Referenced, not implemented in this repo)

## 📁 Project Structure

```
workflows-shareable/
├── agents/                          # Agent implementations
│   ├── deal-verification/          # Deal verification agent
│   │   ├── index.ts                # Main entry point
│   │   ├── operations.ts           # Helper functions
│   │   └── types.ts                # Type definitions
│   ├── teacher-verification/       # Teacher verification agent
│   │   ├── index.ts                # Main entry point
│   │   ├── operations.ts           # Helper functions
│   │   └── types.ts                # Type definitions
│   └── unified-orchestrator/       # Main orchestrator agent
│       └── orchestrator-agent.ts   # ToolLoopAgent with 3 tools
├── workflows/                       # Workflow implementations
│   └── org-validation/             # Organization validation workflow
│       ├── workflow.ts             # Main workflow (uses 'use workflow')
│       ├── steps.ts                # Workflow steps
│       └── agent/
│           └── subagents/          # Parallel worker agents
│               ├── legal-scout-agent.ts
│               ├── sector-analyst-agent.ts
│               └── trust-officer-agent.ts
├── app/
│   ├── api/
│   │   ├── orchestrator/           # Unified orchestrator endpoint
│   │   │   └── route.ts            # POST /api/orchestrator
│   │   ├── workflows/              # Individual workflow endpoints
│   │   │   ├── org-validation/
│   │   │   ├── deal-verification/
│   │   │   └── teacher-verification/
│   │   └── mocks/                  # Mock API endpoints for testing
│   └── page.tsx                    # Main landing page
├── components/
│   └── ui/                         # shadcn/ui components
├── db/                             # Database layer
│   ├── schema.ts                   # Drizzle schema
│   └── operations/                 # DB operations
└── lib/
    └── ai/
        └── provider.ts             # AI gateway provider
```

## 🤖 Workflows

### 1. Organization Validation

**Type**: Workflow-based (uses Vercel Workflows)

**Location**: `workflows/org-validation/`

**Features**:
- Parallel execution of 3 worker agents
- Fan-out pattern with Promise.all()
- Cross-checking for data consistency
- Confidence scoring based on source agreement
- Timeouts and retries on worker steps

**Worker Agents**:
- **Legal Scout Agent**: Looks up legal information
- **Sector Analyst Agent**: Analyzes industry sector data
- **Trust Officer Agent**: Assesses trust and confidence metrics

**API Endpoint**: `POST /api/workflows/org-validation/validate`

**Input**:
```typescript
{
  domain: string;
  requesterId?: string;
}
```

**Output**:
```typescript
{
  domain: string;
  validated: boolean;
  confidence: number;
  organization: {
    legalName: string;
    sector: string;
    // ... more fields
  };
  workerResults: {
    legal: any;
    sector: any;
    trust: any;
  };
}
```

### 2. Deal Verification

**Type**: Agent-based (no workflow framework)

**Location**: `agents/deal-verification/`

**Features**:
- Playwright mode (browser automation)
- HTTP probe mode (fallback)
- Artifact persistence (HTML snippets, JSON captures, screenshots)
- Failure classification (technical vs business logic)
- Performance metrics

**API Endpoint**: `POST /api/workflows/deal-verification/verify`

**Input**:
```typescript
{
  offerId?: string;
  shopUrl?: string;
  emailContent?: string;
  partnerUrl: string;
  expectedDiscount?: string;
  expectedPrice?: number;
}
```

**Output**:
```typescript
{
  offerId?: string;
  verified: boolean;
  offerValid: boolean;
  failureType?: 'technical' | 'business_logic';
  error?: string;
  artifacts: {
    htmlSnippet?: string;
    jsonCapture?: any;
    screenshots?: string[];
  };
  verificationDetails: {
    method: 'playwright' | 'http_probe';
    offerFound: boolean;
    discountMatches: boolean;
    priceMatches: boolean;
    executionTime: number;
    stepCount: number;
  };
}
```

### 3. Teacher Verification

**Type**: Agent-based (no workflow framework)

**Location**: `agents/teacher-verification/`

**Features**:
- State-specific registry lookup
- Member validation (name, DOB, employment)
- Immediate result return (no approval gates)

**API Endpoint**: `POST /api/workflows/teacher-verification/verify`

**Input**:
```typescript
{
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
  state: string;
  msrId: string;
}
```

**Output**:
```typescript
{
  verificationId: string;
  memberId?: string;
  memberName?: string;
  state: string;
  verified: boolean;
  registryMatch: {
    found: boolean;
    nameMatch: boolean;
    dobMatch: boolean;
    employmentStatus: string;
    details: any;
  };
  error?: string;
}
```

## 🎯 Unified Orchestrator

**Location**: `agents/unified-orchestrator/orchestrator-agent.ts`

The orchestrator is a **ToolLoopAgent** that coordinates all workflows through tool calling.

### Tools

1. **orgValidate**: Triggers organization validation workflow
2. **dealVerify**: Executes deal verification agent
3. **teacherVerify**: Executes teacher verification agent

### Features

- **Intelligent Model Selection**: Automatically selects model based on task complexity
  - Simple tasks → `openai/gpt-4o-mini`
  - Complex tasks → `anthropic/claude-sonnet-4.5`
- **Dynamic Model Override**: Supports manual model selection via `options.selectedModel`
- **Prompt-based Execution**: Uses hardcoded prompt for consistent behavior

### API Endpoint

**POST** `/api/orchestrator`

**Request Body**:
```json
{
  "model": "openai/gpt-4o-mini"  // Optional
}
```

**Response**:
```json
{
  "text": "Agent response text",
  "toolCalls": [...],
  "toolResults": {...},
  "usage": {
    "promptTokens": 100,
    "completionTokens": 50
  },
  "finishReason": "stop"
}
```

**Note**: The prompt is hardcoded in the route handler. The orchestrator uses a fixed system prompt that describes all available workflows.

## 🛠️ AI SDK Features Used

### ToolLoopAgent

The core agent class used throughout the application:

```typescript
import { ToolLoopAgent } from 'ai';

const agent = new ToolLoopAgent({
  model: 'openai/gpt-4o-mini',
  instructions: 'System prompt',
  tools: {
    toolName: tool({ ... })
  },
  prepareCall: ({ prompt, options, ... }) => {
    // Custom logic for model selection
  }
});
```

### Tool Definitions

Structured tool schemas using Zod:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const myTool = tool({
  description: 'Tool description',
  inputSchema: z.object({
    param: z.string().describe('Parameter description')
  }),
  execute: async (input) => {
    // Tool execution logic
    return result;
  }
});
```

### Agent.generate()

Non-streaming agent execution:

```typescript
const result = await agent.generate({
  prompt: 'User request',
  options: { selectedModel: 'openai/gpt-4o' }
});

// Access results
console.log(result.text);
console.log(result.toolCalls);
console.log(result.toolResults);
```

### Gateway Provider

Unified AI gateway for multiple providers:

```typescript
import { gateway } from 'ai';

export const gatewayProvider = gateway('anthropic/claude-4-5-sonnet');
```

## 🎨 UI Components

### shadcn/ui Components

Full suite of UI components including:
- Buttons, Cards, Inputs
- Dropdowns, Selects, Dialogs
- Toast notifications
- Accordions, Tabs, Tooltips
- And many more...

## 🔧 Configuration

### Environment Variables

```env
# AI Gateway (optional)
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
AI_GATEWAY_API_KEY=...

# Feature Flags
USE_HTTP_PROBES_ONLY=false  # For deal verification

# API Base URLs
APP_BASE_URL=http://localhost:3000
DEAL_VERIFICATION_SHOP=${APP_BASE_URL}/api/mocks/deal-verification/shop-offer
TEACHER_REGISTRY_API=${APP_BASE_URL}/api/mocks/teacher-verification/registry
```

### Next.js Config

Uses `withWorkflow` wrapper for Vercel Workflows integration:

```typescript
import { withWorkflow } from 'workflow/next';

export default withWorkflow(nextConfig, workflowConfig);
```

## 📦 Dependencies

### Core Dependencies

- **Next.js 16.0.0**: React framework
- **React 19.2.0**: UI library
- **AI SDK 6.0.0-beta.114**: AI SDK for agents and tools
- **Vercel Workflows 4.0.1-beta.12**: Workflow orchestration
- **Zod 3.25.76**: Schema validation

### UI Dependencies

- **@radix-ui**: Accessible component primitives
- **tailwindcss**: Utility-first CSS
- **lucide-react**: Icon library
- **sonner**: Toast notifications

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

### Development

```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## 📝 API Endpoints

### Orchestrator

- **POST** `/api/orchestrator` - Unified orchestrator endpoint

### Workflows

- **POST** `/api/workflows/org-validation/validate` - Organization validation
- **POST** `/api/workflows/deal-verification/verify` - Deal verification
- **POST** `/api/workflows/teacher-verification/verify` - Teacher verification

### Mocks (for testing)

- **POST** `/api/mocks/org-validation/legal` - Mock legal API
- **POST** `/api/mocks/org-validation/sector` - Mock sector API
- **POST** `/api/mocks/org-validation/trust` - Mock trust API
- **POST** `/api/mocks/deal-verification/shop-offer` - Mock shop API
- **POST** `/api/mocks/teacher-verification/registry/[state]` - Mock registry API
- **POST** `/api/mocks/notify/email` - Mock email notification

## 🎓 Key Patterns & Best Practices

### 1. Agent Organization

- **index.ts**: Main entry point with orchestration logic
- **operations.ts**: Reusable helper functions
- **types.ts**: TypeScript type definitions

### 2. Workflow vs Agent

- **Workflows**: Use Vercel Workflows for durable, long-running processes
- **Agents**: Use ToolLoopAgent for immediate, stateless operations

### 3. Parallel Execution

Organization validation demonstrates parallel worker execution:

```typescript
const [legalResult, sectorResult, trustResult] = await Promise.all([
  runLegalScout({ domain }),
  runSectorAnalyst({ domain }),
  runTrustOfficer({ domain }),
]);
```

### 4. Tool Result Extraction

Worker agents extract tool results from agent.generate():

```typescript
const result = await agent.generate({ prompt });
// Extract from result.toolCalls, result.toolResults, or result.text
```

### 5. Model Selection

Intelligent model routing based on task complexity:

```typescript
const taskComplexity = determineTaskComplexity(promptText);
const model = taskComplexity === 'complex' 
  ? 'anthropic/claude-sonnet-4.5' 
  : 'openai/gpt-4o-mini';
```

## 🔍 Testing

Mock endpoints are provided for testing workflows without external dependencies:

- All workflow APIs have corresponding mock endpoints
- Mock data is returned for development/testing
- Real implementations would call external APIs

## 📚 Additional Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Vercel Workflows Documentation](https://vercel.com/docs/workflows)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

This is a demo application showcasing patterns and best practices. Feel free to use it as a reference for your own projects.

## 📄 License

This project is a demonstration application.

---

**Built with ❤️ using Next.js, AI SDK 6, and Vercel Workflows**

