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
          try {
            const res = await fetch(`${SECTOR_API}`, {
              method: 'POST',
              body: JSON.stringify({ domain }),
              headers: { 'content-type': 'application/json' },
            });
            
            if (!res || !res.ok) {
              throw new FatalError(`Sector lookup API failed: ${res?.status || 'No response'}`);
            }
            
            return res.json();
          } catch (error) {
            if (error instanceof FatalError) {
              throw error;
            }
            throw new FatalError(`Sector lookup failed: ${error instanceof Error ? error.message : String(error)}`);
          }
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
    
    // Extract tool result from result.steps (AI SDK 6 ToolLoopAgent structure)
    const steps = (result as any).steps;
    if (!steps || !Array.isArray(steps)) {
      throw new FatalError(`Sector Analyst agent result missing steps array for domain: ${domain}`);
    }

    for (const step of steps) {
      // Check step.content array
      if (step.content) {
        const toolResult = step.content.find((item: any) => 
          item.type === 'tool-result' && item.toolName === 'lookupSectorInfo'
        );
        if (toolResult) {
          if (toolResult.output?.type === 'error-text') {
            throw new FatalError(`Sector lookup tool error: ${toolResult.output.value}`);
          }
          return toolResult.output?.value || toolResult.output;
        }
      }
      
      // Check step.messages array
      if (step.messages) {
        for (const message of step.messages) {
          if (message.role === 'tool' && message.content) {
            const toolResult = message.content.find((item: any) => 
              item.type === 'tool-result' && item.toolName === 'lookupSectorInfo'
            );
            if (toolResult) {
              if (toolResult.output?.type === 'error-text') {
                throw new FatalError(`Sector lookup tool error: ${toolResult.output.value}`);
              }
              return toolResult.output?.value || toolResult.output;
            }
          }
        }
      }
    }
    
    throw new FatalError(`Sector Analyst agent did not return tool result for domain: ${domain}. No output generated.`);
  } catch (error) {
    // Re-throw FatalErrors as-is
    if (error instanceof FatalError) {
      throw error;
    }
    // Wrap other errors as FatalError with context
    throw new FatalError(`sectorAnalystWorker failed for domain: ${domain}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

