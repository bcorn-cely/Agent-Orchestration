/**
 * Unified Orchestrator API Route
 * 
 * API endpoint for the unified multi-workflow orchestrator.
 * Uses the unified orchestrator agent that can trigger any workflow.
 */

import { createUnifiedOrchestratorAgent } from '@/agents/unified-orchestrator/orchestrator-agent';

/**
 * POST Handler for Orchestrator Requests
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { model: modelId } = body as {
    model?: string;
  };

  // Hardcoded prompt for orchestrator
  const prompt = `You are a unified AI assistant that helps with multiple workflows. 
  
Available workflows:
1. Organization Validation - Validate organizations by domain using parallel worker agents
2. Deal Verification - Verify retail deals/offers with Playwright or HTTP probes
3. Teacher Verification - Verify teacher community membership via state registry

Understand what the user wants to accomplish, ask clarifying questions to gather required information, and use the appropriate tool to execute the workflow.`;

  console.log('[Unified Orchestrator API] Received request', {
    modelId: modelId || 'No Model Selected',
  });

  // Create unified orchestrator agent
  const defaultModelId = 'openai/gpt-4o-mini';
  const agent = createUnifiedOrchestratorAgent(defaultModelId);

  try {
    // Generate response using agent
    const result = await agent.generate({
      prompt,
      options: modelId ? { selectedModel: modelId } : {},
    });

    // Return the result
    return Response.json({
      text: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
      usage: result.usage,
      finishReason: result.finishReason,
    });
  } catch (error) {
    console.error('[Unified Orchestrator API] Error', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

