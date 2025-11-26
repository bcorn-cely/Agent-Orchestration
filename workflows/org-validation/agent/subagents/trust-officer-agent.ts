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
          try {
            const res = await fetch(`${TRUST_API}`, {
              method: 'POST',
              body: JSON.stringify({ domain }),
              headers: { 'content-type': 'application/json' },
            });
            
            if (!res || !res.ok) {
              throw new FatalError(`Trust lookup API failed: ${res?.status || 'No response'}`);
            }
            
            return res.json();
          } catch (error) {
            if (error instanceof FatalError) {
              throw error;
            }
            throw new FatalError(`Trust lookup failed: ${error instanceof Error ? error.message : String(error)}`);
          }
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
    
    // Extract tool result from result.steps (AI SDK 6 ToolLoopAgent structure)
    const steps = (result as any).steps;
    if (!steps || !Array.isArray(steps)) {
      throw new FatalError(`Trust Officer agent result missing steps array for domain: ${domain}`);
    }

    for (const step of steps) {
      // Check step.content array
      if (step.content) {
        const toolResult = step.content.find((item: any) => 
          item.type === 'tool-result' && item.toolName === 'lookupTrustInfo'
        );
        if (toolResult) {
          if (toolResult.output?.type === 'error-text') {
            throw new FatalError(`Trust lookup tool error: ${toolResult.output.value}`);
          }
          return toolResult.output?.value || toolResult.output;
        }
      }
      
      // Check step.messages array
      if (step.messages) {
        for (const message of step.messages) {
          if (message.role === 'tool' && message.content) {
            const toolResult = message.content.find((item: any) => 
              item.type === 'tool-result' && item.toolName === 'lookupTrustInfo'
            );
            if (toolResult) {
              if (toolResult.output?.type === 'error-text') {
                throw new FatalError(`Trust lookup tool error: ${toolResult.output.value}`);
              }
              return toolResult.output?.value || toolResult.output;
            }
          }
        }
      }
    }
    
    throw new FatalError(`Trust Officer agent did not return tool result for domain: ${domain}. No output generated.`);
    
  } catch (error) {
    // Re-throw FatalErrors as-is
    if (error instanceof FatalError) {
      throw error;
    }
    // Wrap other errors as FatalError with context
    throw new FatalError(`trustOfficerWorker failed for domain: ${domain}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

