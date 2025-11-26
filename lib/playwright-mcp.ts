/**
 * Playwright MCP Integration
 * 
 * This utility sets up a connection to the Playwright MCP server and provides
 * tools that can be used in AI SDK agents.
 * 
 * The MCP server can run either:
 * 1. Locally via stdio (simpler, current implementation)
 * 2. In a Vercel Sandbox via HTTP/SSE (for isolation, future enhancement)
 */

import { experimental_createMCPClient } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import type { Tool } from 'ai';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export interface PlaywrightMCPClient {
  /** The MCP client instance */
  client: Awaited<ReturnType<typeof experimental_createMCPClient>>;
  /** Tools from the MCP server that can be used in agents */
  tools: Record<string, Tool<any, any> | any>;
  /** Close the MCP client connection */
  close: () => Promise<void>;
}

/**
 * Create a Playwright MCP client using stdio transport
 * 
 * This runs the @playwright/mcp server locally and connects via stdio.
 * The server will handle browser automation requests.
 * 
 * @param options - Configuration options
 * @returns MCP client with tools
 */
export async function createPlaywrightMCPClient(
  options?: {
    /** Custom command to run the MCP server (defaults to npx @playwright/mcp) */
    command?: string;
    /** Additional args for the MCP server command */
    args?: string[];
    /** Environment variables for the MCP server */
    env?: Record<string, string>;
    /** Whether to run browser in headless mode (defaults to true) */
    headless?: boolean;
  }
): Promise<PlaywrightMCPClient> {
  const command = options?.command || 'npx';
  const headless = options?.headless !== false; // Default to true
  const env = options?.env || {};

  // Create a temporary config file with headless mode enabled by default
  const configPath = join(tmpdir(), `playwright-mcp-config-${Date.now()}-${Math.random().toString(36).substring(7)}.json`);
  const config = {
    browser: {
      launchOptions: {
        headless: headless
      }
    }
  };
  
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Build args with config file
  const baseArgs = options?.args || ['-y', '@playwright/mcp'];
  const args = [...baseArgs, '--config', configPath];

  // Create stdio transport
  // Filter out undefined values from process.env to satisfy Record<string, string>
  const processEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      processEnv[key] = value;
    }
  }

  const transport = new Experimental_StdioMCPTransport({
    command,
    args,
    env: {
      ...processEnv,
      ...env,
    },
  });

  // Create MCP client
  const client = await experimental_createMCPClient({
    transport,
    name: 'playwright-mcp-client',
    version: '1.0.0',
  });

  // Get tools from the MCP server
  const toolSet = await client.tools();
  const tools: Record<string, Tool<any, any> | any> = {};

  // Convert MCP tools to AI SDK tools
  // MCP tools are compatible with AI SDK tools but have slightly different types
  for (const [toolName, tool] of Object.entries(toolSet)) {
    tools[toolName] = tool as Tool<any, any>;
  }

  return {
    client,
    tools,
    close: async () => {
      await client.close();
      // Clean up the temporary config file
      try {
        unlinkSync(configPath);
      } catch (error) {
        // Ignore errors if file was already deleted
        console.warn('Failed to delete temp config file:', error);
      }
    },
  };
}

/**
 * Create a Playwright MCP client running in a Vercel Sandbox
 * 
 * This creates a sandbox, installs @playwright/mcp, runs the server,
 * and connects via HTTP/SSE transport.
 * 
 * NOTE: The playwright-mcp server is designed for stdio transport.
 * To run in a sandbox, you would need to:
 * 1. Create a wrapper HTTP/SSE server around the MCP server
 * 2. Or use a different MCP server implementation that supports HTTP/SSE
 * 
 * For now, the stdio transport (createPlaywrightMCPClient) is recommended.
 * 
 * @param options - Sandbox and MCP configuration
 * @returns MCP client with tools
 */
export async function createPlaywrightMCPClientInSandbox(
  options?: {
    /** Sandbox creation parameters */
    sandbox?: {
      resources?: { vcpus: number };
      timeout?: number;
      ports?: number[];
    };
    /** MCP server endpoint URL (if already running) */
    endpointUrl?: string;
  }
): Promise<PlaywrightMCPClient> {
  // Implementation plan:
  // 1. Create a Vercel Sandbox
  // 2. Install @playwright/mcp in the sandbox
  // 3. Create an HTTP/SSE wrapper server that:
  //    - Spawns the playwright-mcp server via stdio
  //    - Bridges stdio to HTTP/SSE
  // 4. Expose the HTTP/SSE endpoint on a sandbox port
  // 5. Connect using HTTP/SSE transport from the client
  // 6. Return tools
  
  // For now, this is a placeholder. The playwright-mcp server
  // is designed for stdio, so running it in a sandbox requires
  // additional infrastructure to bridge stdio to HTTP/SSE.
  
  throw new Error(
    'createPlaywrightMCPClientInSandbox is not yet implemented. ' +
    'The playwright-mcp server uses stdio transport. To run in a sandbox, ' +
    'you would need an HTTP/SSE bridge. Use createPlaywrightMCPClient ' +
    'for local stdio transport instead.'
  );
}

