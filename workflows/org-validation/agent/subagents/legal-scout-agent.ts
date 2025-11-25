/**
 * Legal Scout Agent - Worker Agent
 * 
 * This agent looks up legal information about organizations:
 * - Legal name
 * - Jurisdiction of formation
 * - Registration status
 * 
 * Uses a cheap model (gpt-4o-mini) for cost efficiency.
 * This is a worker agent that runs in parallel with other workers.
 */

import { ToolLoopAgent, tool, Output } from 'ai';
import { z } from 'zod';
import { FatalError, fetch } from 'workflow';

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const LEGAL_API = process.env.ORG_VALIDATION_LEGAL ?? `${BASE}/api/mocks/org-validation/legal`;

/**
 * Create Legal Scout Agent
 * 
 * Creates a ToolLoopAgent configured for legal information lookup.
 */
export function createLegalScoutAgent() {
  return new ToolLoopAgent({
    model: 'openai/gpt-4o-mini', // Cheap model for worker
    instructions: `You are a legal information specialist. Your job is to look up legal information about organizations by domain.

Your approach:
1. Use the lookupLegalInfo tool to query legal registries
2. The tool will return the legal information you need

After using the tool, confirm that you have retrieved the information.`,
    
    tools: {
      lookupLegalInfo: tool({
        description: 'Look up legal information about an organization by domain',
        inputSchema: z.object({
          domain: z.string(),
        }),
        outputSchema: z.object({
          legalName: z.string(),
          jurisdiction: z.string(),
          registrationNumber: z.string().optional(),
          status: z.enum(['active', 'inactive', 'unknown']),
        }),
        execute: async ({ domain }) => {
          const res = await fetch(`${LEGAL_API}`, {
            method: 'POST',
            body: JSON.stringify({ domain }),
            headers: { 'content-type': 'application/json' },
          });
          
          if (!res.ok) {
            throw new FatalError(`Legal lookup API failed: ${res.status}`);
          }
          
          return res.json();
        },
      }),
    },
  });
}

/**
 * Legal Scout Worker
 * 
 * Main function that runs the legal scout agent.
 * The agent uses tools to look up legal information.
 */
export async function legalScoutWorker(domain: string) {
  try {
    const agent = createLegalScoutAgent();
    
    const result = await agent.generate({
      prompt: `Look up legal information for the organization with domain: ${domain}

Use the lookupLegalInfo tool to get this information.`,
    });
    
    // Extract tool result - the tool returns the data we need
    let legalResult: any = null;
    
    // Check tool calls for the result - tool results might be in different locations
    if (result.toolCalls && result.toolCalls.length > 0) {
      for (const toolCall of result.toolCalls) {
        if (toolCall.toolName === 'lookupLegalInfo') {
          // Try accessing result through type assertion
          const callWithResult = toolCall as any;
          if (callWithResult.result) {
            legalResult = callWithResult.result;
            break;
          }
        }
      }
    }
    
    // Fallback: check if result has toolResults property
    if (!legalResult && (result as any).toolResults) {
      const toolResults = (result as any).toolResults;
      if (toolResults.lookupLegalInfo) {
        legalResult = toolResults.lookupLegalInfo;
      }
    }
    
    // Another fallback: check for toolInvocations
    if (!legalResult && (result as any).toolInvocations) {
      const invocations = (result as any).toolInvocations;
      const legalInvocation = invocations.find((inv: any) => inv.toolName === 'lookupLegalInfo');
      if (legalInvocation?.result) {
        legalResult = legalInvocation.result;
      }
    }
    
    // Last resort: try to parse from text if available
    if (!legalResult && result.text) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          legalResult = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    
    if (!legalResult) {
      console.error('[Legal Scout] No tool result found. Result structure:', {
        hasOutput: !!result.output,
        hasText: !!result.text,
        toolCallsCount: result.toolCalls?.length || 0,
        toolCalls: result.toolCalls?.map(tc => ({ name: tc.toolName, hasResult: !!(tc as any).result })),
        resultKeys: Object.keys(result),
        fullResult: JSON.stringify(result, null, 2),
      });
      throw new FatalError(`Legal Scout agent did not return tool result for domain: ${domain}. No output generated.`);
    }
    
    return legalResult;
  } catch (error) {
    // Re-throw FatalErrors as-is
    if (error instanceof FatalError) {
      throw error;
    }
    // Wrap other errors as FatalError with context
    throw new FatalError(`legalScoutWorker failed for domain: ${domain}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

