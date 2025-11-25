/**
 * Sector Analyst Agent - Worker Agent
 * 
 * This agent identifies the organization's sector/industry:
 * - Industry classification
 * - Sector category
 * - Business type
 * 
 * Uses a cheap model (gpt-4o-mini) for cost efficiency.
 * This is a worker agent that runs in parallel with other workers.
 */

import { ToolLoopAgent, tool, Output } from 'ai';
import { z } from 'zod';
import { FatalError, fetch } from 'workflow';

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const SECTOR_API = process.env.ORG_VALIDATION_SECTOR ?? `${BASE}/api/mocks/org-validation/sector`;

/**
 * Create Sector Analyst Agent
 */
export function createSectorAnalystAgent() {
  return new ToolLoopAgent({
    model: 'openai/gpt-4o-mini', // Cheap model for worker
    instructions: `You are a sector/industry analyst. Your job is to identify the industry sector of organizations by domain.

Your approach:
1. Use the lookupSectorInfo tool to query industry databases
2. The tool will return the sector information you need

After using the tool, confirm that you have retrieved the information.`,
    
    tools: {
      lookupSectorInfo: tool({
        description: 'Look up sector/industry information about an organization by domain',
        inputSchema: z.object({
          domain: z.string(),
        }),
        outputSchema: z.object({
          sector: z.string(),
          industry: z.string(),
          organizationName: z.string().optional(),
          naicsCode: z.string().optional(),
        }),
        execute: async ({ domain }) => {
          const res = await fetch(`${SECTOR_API}`, {
            method: 'POST',
            body: JSON.stringify({ domain }),
            headers: { 'content-type': 'application/json' },
          });
          
          if (!res.ok) {
            throw new FatalError(`Sector lookup API failed: ${res.status}`);
          }
          
          return res.json();
        },
      }),
    },
  });
}

/**
 * Sector Analyst Worker
 * 
 * Main function that runs the sector analyst agent.
 * The agent uses tools to look up sector information.
 */
export async function sectorAnalystWorker(domain: string) {
  try {
    const agent = createSectorAnalystAgent();
    
    const result = await agent.generate({
      prompt: `Identify the sector/industry for the organization with domain: ${domain}

Use the lookupSectorInfo tool to get this information.`,
    });
    
    // Extract tool result - the tool returns the data we need
    let sectorResult: any = null;
    
    // Check tool calls for the result - tool results might be in different locations
    if (result.toolCalls && result.toolCalls.length > 0) {
      for (const toolCall of result.toolCalls) {
        if (toolCall.toolName === 'lookupSectorInfo') {
          // Try accessing result through type assertion
          const callWithResult = toolCall as any;
          if (callWithResult.result) {
            sectorResult = callWithResult.result;
            break;
          }
        }
      }
    }
    
    // Fallback: check if result has toolResults property
    if (!sectorResult && (result as any).toolResults) {
      const toolResults = (result as any).toolResults;
      if (toolResults.lookupSectorInfo) {
        sectorResult = toolResults.lookupSectorInfo;
      }
    }
    
    // Another fallback: check for toolInvocations
    if (!sectorResult && (result as any).toolInvocations) {
      const invocations = (result as any).toolInvocations;
      const sectorInvocation = invocations.find((inv: any) => inv.toolName === 'lookupSectorInfo');
      if (sectorInvocation?.result) {
        sectorResult = sectorInvocation.result;
      }
    }
    
    // Last resort: try to parse from text if available
    if (!sectorResult && result.text) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          sectorResult = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    
    if (!sectorResult) {
      console.error('[Sector Analyst] No tool result found. Result structure:', {
        hasOutput: !!result.output,
        hasText: !!result.text,
        toolCallsCount: result.toolCalls?.length || 0,
        toolCalls: result.toolCalls?.map(tc => ({ name: tc.toolName, hasResult: !!(tc as any).result })),
        resultKeys: Object.keys(result),
        fullResult: JSON.stringify(result, null, 2),
      });
      throw new FatalError(`Sector Analyst agent did not return tool result for domain: ${domain}. No output generated.`);
    }
    
    return sectorResult;
  } catch (error) {
    // Re-throw FatalErrors as-is
    if (error instanceof FatalError) {
      throw error;
    }
    // Wrap other errors as FatalError with context
    throw new FatalError(`sectorAnalystWorker failed for domain: ${domain}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

