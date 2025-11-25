/**
 * Trust Officer Agent - Worker Agent
 * 
 * This agent gathers trust information about organizations:
 * - Confidence score
 * - Verification sources
 * - Trust indicators
 * 
 * Uses a cheap model (gpt-4o-mini) for cost efficiency.
 * This is a worker agent that runs in parallel with other workers.
 */

import { ToolLoopAgent, tool, Output } from 'ai';
import { z } from 'zod';
import { FatalError, fetch } from 'workflow';

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const TRUST_API = process.env.ORG_VALIDATION_TRUST ?? `${BASE}/api/mocks/org-validation/trust`;

/**
 * Create Trust Officer Agent
 */
export function createTrustOfficerAgent() {
  return new ToolLoopAgent({
    model: 'openai/gpt-4o-mini', // Cheap model for worker
    instructions: `You are a trust verification specialist. Your job is to assess trust and confidence scores for organizations by domain.

Your approach:
1. Use the lookupTrustInfo tool to query trust databases
2. The tool will return the trust information you need

After using the tool, confirm that you have retrieved the information.`,
    
    tools: {
      lookupTrustInfo: tool({
        description: 'Look up trust information about an organization by domain',
        inputSchema: z.object({
          domain: z.string(),
        }),
        outputSchema: z.object({
          confidence: z.number().min(0).max(1),
          score: z.number().min(0).max(1),
          sources: z.array(z.string()),
          indicators: z.array(z.string()),
        }),
        execute: async ({ domain }) => {
          const res = await fetch(`${TRUST_API}`, {
            method: 'POST',
            body: JSON.stringify({ domain }),
            headers: { 'content-type': 'application/json' },
          });
          
          if (!res.ok) {
            throw new FatalError(`Trust lookup API failed: ${res.status}`);
          }
          
          return res.json();
        },
      }),
    },
  });
}

/**
 * Trust Officer Worker
 * 
 * Main function that runs the trust officer agent.
 * The agent uses tools to look up trust information.
 */
export async function trustOfficerWorker(domain: string) {
  try {
    const agent = createTrustOfficerAgent();
    
    const result = await agent.generate({
      prompt: `Assess trust and confidence for the organization with domain: ${domain}

Use the lookupTrustInfo tool to get this information.`,
    });
    
    // Extract tool result - the tool returns the data we need
    let trustResult: any = null;
    
    // Check tool calls for the result - tool results might be in different locations
    if (result.toolCalls && result.toolCalls.length > 0) {
      for (const toolCall of result.toolCalls) {
        if (toolCall.toolName === 'lookupTrustInfo') {
          // Try accessing result through type assertion
          const callWithResult = toolCall as any;
          if (callWithResult.result) {
            trustResult = callWithResult.result;
            break;
          }
        }
      }
    }
    
    // Fallback: check if result has toolResults property
    if (!trustResult && (result as any).toolResults) {
      const toolResults = (result as any).toolResults;
      if (toolResults.lookupTrustInfo) {
        trustResult = toolResults.lookupTrustInfo;
      }
    }
    
    // Another fallback: check for toolInvocations
    if (!trustResult && (result as any).toolInvocations) {
      const invocations = (result as any).toolInvocations;
      const trustInvocation = invocations.find((inv: any) => inv.toolName === 'lookupTrustInfo');
      if (trustInvocation?.result) {
        trustResult = trustInvocation.result;
      }
    }
    
    // Last resort: try to parse from text if available
    if (!trustResult && result.text) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          trustResult = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    
    if (!trustResult) {
      console.error('[Trust Officer] No tool result found. Result structure:', {
        hasOutput: !!result.output,
        hasText: !!result.text,
        toolCallsCount: result.toolCalls?.length || 0,
        toolCalls: result.toolCalls?.map(tc => ({ name: tc.toolName, hasResult: !!(tc as any).result })),
        resultKeys: Object.keys(result),
        fullResult: JSON.stringify(result, null, 2),
      });
      throw new FatalError(`Trust Officer agent did not return tool result for domain: ${domain}. No output generated.`);
    }
    
    return trustResult;
  } catch (error) {
    // Re-throw FatalErrors as-is
    if (error instanceof FatalError) {
      throw error;
    }
    // Wrap other errors as FatalError with context
    throw new FatalError(`trustOfficerWorker failed for domain: ${domain}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

