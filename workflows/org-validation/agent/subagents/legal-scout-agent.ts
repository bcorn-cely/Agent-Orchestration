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
          try {
            const res = await fetch(`${LEGAL_API}`, {
              method: 'POST',
              body: JSON.stringify({ domain }),
              headers: { 'content-type': 'application/json' },
            });
            
            if (!res || !res.ok) {
              throw new FatalError(`Legal lookup API failed: ${res?.status || 'No response'}`);
            }
            
            return res.json();
          } catch (error) {
            if (error instanceof FatalError) {
              throw error;
            }
            throw new FatalError(`Legal lookup failed: ${error instanceof Error ? error.message : String(error)}`);
          }
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
    
    // Extract tool result from result.steps (AI SDK 6 ToolLoopAgent structure)
    const steps = (result as any).steps;
    if (!steps || !Array.isArray(steps)) {
      throw new FatalError(`Legal Scout agent result missing steps array for domain: ${domain}`);
    }

    for (const step of steps) {
      // Check step.content array
      if (step.content) {
        const toolResult = step.content.find((item: any) => 
          item.type === 'tool-result' && item.toolName === 'lookupLegalInfo'
        );
        if (toolResult) {
          if (toolResult.output?.type === 'error-text') {
            throw new FatalError(`Legal lookup tool error: ${toolResult.output.value}`);
          }
          return toolResult.output?.value || toolResult.output;
        }
      }
      
      // Check step.messages array
      if (step.messages) {
        for (const message of step.messages) {
          if (message.role === 'tool' && message.content) {
            const toolResult = message.content.find((item: any) => 
              item.type === 'tool-result' && item.toolName === 'lookupLegalInfo'
            );
            if (toolResult) {
              if (toolResult.output?.type === 'error-text') {
                throw new FatalError(`Legal lookup tool error: ${toolResult.output.value}`);
              }
              return toolResult.output?.value || toolResult.output;
            }
          }
        }
      }
    }
    
    throw new FatalError(`Legal Scout agent did not return tool result for domain: ${domain}. No output generated.`);
  } catch (error) {
    // Re-throw FatalErrors as-is
    if (error instanceof FatalError) {
      throw error;
    }
    // Wrap other errors as FatalError with context
    throw new FatalError(`legalScoutWorker failed for domain: ${domain}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

