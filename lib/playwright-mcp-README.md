# Playwright MCP Integration Guide

This guide explains how to integrate Playwright MCP (Model Context Protocol) tools into your AI SDK agents, including options for running in Vercel Sandbox.

## Overview

Playwright MCP provides browser automation tools that can be used by AI agents. The MCP server exposes tools like:
- `browser_navigate` - Navigate to URLs
- `browser_snapshot` - Capture page accessibility snapshots
- `browser_click` - Click elements
- `browser_type` - Type text
- `browser_take_screenshot` - Take screenshots
- And many more...

## Architecture Options

### Option 1: Local Stdio Transport (Recommended for Development)

The simplest approach runs the Playwright MCP server locally and connects via stdio:

```typescript
import { createPlaywrightMCPClient } from '@/lib/playwright-mcp';
import { ToolLoopAgent } from 'ai';

// Create MCP client (spawns playwright-mcp server locally)
const playwrightClient = await createPlaywrightMCPClient();

// Use tools in an agent
const agent = new ToolLoopAgent({
  model: openai('gpt-4o-mini'),
  tools: {
    ...playwrightClient.tools,
  },
});
```

**Pros:**
- Simple setup
- Fast communication
- Good for development

**Cons:**
- Runs on local machine
- No isolation
- Requires local Playwright installation

### Option 2: Sandbox with HTTP/SSE Bridge (Future)

To run Playwright MCP in a Vercel Sandbox, you need to:

1. **Create a bridge service** that:
   - Runs in the sandbox
   - Spawns the playwright-mcp server via stdio
   - Exposes an HTTP/SSE endpoint
   - Bridges stdio messages to HTTP/SSE

2. **Connect from client** using HTTP/SSE transport:

```typescript
import { experimental_createMCPClient } from '@ai-sdk/mcp';

const client = await experimental_createMCPClient({
  transport: {
    type: 'http',
    url: 'https://your-sandbox-domain.vercel.run/mcp',
  },
});
```

**Pros:**
- Full isolation
- Scalable
- Can run multiple instances

**Cons:**
- More complex setup
- Requires bridge service
- Additional latency

## Implementation Details

### How `@vercel/sandbox` Works

The `@vercel/sandbox` package creates isolated Linux MicroVMs where you can:

1. **Create a sandbox:**
```typescript
import { Sandbox } from '@vercel/sandbox';

const sandbox = await Sandbox.create({
  source: { type: 'git', url: 'https://github.com/...' },
  resources: { vcpus: 4 },
  timeout: ms('5m'),
  ports: [3000],
  runtime: 'node22',
});
```

2. **Run commands:**
```typescript
await sandbox.runCommand({
  cmd: 'npm',
  args: ['install'],
});
```

3. **Expose ports:**
```typescript
const domain = sandbox.domain(3000); // https://subdomain.vercel.run
```

### How `createMCPClient` Works

The `@ai-sdk/mcp` package provides:

1. **Stdio Transport** - Spawns a local process:
```typescript
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';

const transport = new Experimental_StdioMCPTransport({
  command: 'npx',
  args: ['-y', '@playwright/mcp'],
});
```

2. **HTTP/SSE Transport** - Connects to remote server:
```typescript
const transport = {
  type: 'http' as const,
  url: 'https://mcp-server.example.com',
};
```

3. **Create client and get tools:**
```typescript
const client = await experimental_createMCPClient({ transport });
const tools = await client.tools();
```

## Current Implementation

The `lib/playwright-mcp.ts` file provides:

- ✅ `createPlaywrightMCPClient()` - Local stdio transport (working)
- ⏳ `createPlaywrightMCPClientInSandbox()` - Sandbox HTTP/SSE (placeholder)

## Next Steps for Sandbox Implementation

To implement the sandbox version, you would need to:

1. **Create an MCP Bridge Service:**
   - Node.js service that spawns `@playwright/mcp` via stdio
   - Exposes HTTP/SSE endpoint
   - Bridges JSON-RPC messages between stdio and HTTP/SSE

2. **Deploy Bridge in Sandbox:**
   - Create sandbox with Node.js runtime
   - Install bridge service and `@playwright/mcp`
   - Run bridge service on exposed port
   - Connect from client using HTTP/SSE transport

3. **Example Bridge Service Structure:**
```
sandbox/
  ├── bridge-server.js    # HTTP/SSE server
  ├── mcp-stdio-spawn.js  # Spawns playwright-mcp
  └── package.json
```

## References

- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Vercel Sandbox Docs](https://vercel.com/docs/sandbox)
- [AI SDK MCP Package](https://www.npmjs.com/package/@ai-sdk/mcp)
- [Model Context Protocol Spec](https://modelcontextprotocol.io)

