// lib/agent/renewal-agent.ts
//@ts-ignore
import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { start } from 'workflow/api';
// import { gateway } from '@/lib/ai/provider';
import { renewal } from '@/workflows/newfront/workflow';

async function fetchJson(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Fetch failed: ${path}`);
  return res.json();
}

export function createRenewalAgent(modelId: string = 'openai/gpt-4o-mini') {
  return new ToolLoopAgent({
    model: modelId,
    instructions: 'You are a helpful insurance assistant.',
    stopWhen: stepCountIs(20),
    tools: {
      getLossTrends: tool({
        description: 'Loss frequency/severity by year for an account',
        inputSchema: z.object({ accountId: z.string() }),
        execute: async ({ accountId }) => fetchJson(`/api/mocks/newfront/losses/${accountId}`),
      }),
      extractSov: tool({
        description: 'Parse SOV and normalize values',
        inputSchema: z.object({ sovFileId: z.string() }),
        execute: async ({ sovFileId }) => fetchJson(`/api/mocks/newfront/sov/${sovFileId}`),
      }),
      startRenewalWorkflow: {
        ...tool({
          description: 'Kick off the durable renewal workflow',
          inputSchema: z.object({
            accountId: z.string(),
            effectiveDate: z.string(),
            sovFileId: z.string(),
            state: z.string(),
            brokerEmail: z.string().email(),
            carriers: z.array(z.string()),
          }),
          execute: async (payload) => {
            const run = await start(renewal, [payload]);
            return { runId: run.runId };
          },
        }),
        // Human-in-the-loop approval (AI SDK 6)
        needsApproval: true,
      },
    },
  });
}

// Default agent for backward compatibility
export const renewalAgent = createRenewalAgent();

