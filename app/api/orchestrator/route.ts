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
  const { workflow, model: modelId, ...workflowInput } = body as {
    workflow: 'org-validation' | 'deal-verification' | 'teacher-verification';
    model?: string;
    [key: string]: any;
  };

  // Validate workflow name is provided
  if (!workflow) {
    return Response.json(
      { error: 'Workflow name is required. Must be one of: org-validation, deal-verification, teacher-verification' },
      { status: 400 }
    );
  }

  // Map workflow names to tool names and create prompt
  const workflowMap = {
    'org-validation': {
      toolName: 'orgValidate',
      description: 'Organization Validation - Validate organizations by domain using parallel worker agents',
      requiredFields: ['domain'],
    },
    'deal-verification': {
      toolName: 'dealVerify',
      description: 'Deal Verification - Verify retail deals/offers with Playwright or HTTP probes',
      requiredFields: ['partnerUrl'],
    },
    'teacher-verification': {
      toolName: 'teacherVerify',
      description: 'Teacher Verification - Verify teacher community membership via state registry',
      requiredFields: ['state', 'msrId'],
    },
  };

  const selectedWorkflow = workflowMap[workflow];
  if (!selectedWorkflow) {
    return Response.json(
      { error: `Invalid workflow: ${workflow}. Must be one of: org-validation, deal-verification, teacher-verification` },
      { status: 400 }
    );
  }

  // Build prompt that instructs the agent to execute the specific workflow
  const prompt = `Execute the ${selectedWorkflow.description}.

You must use the ${selectedWorkflow.toolName} tool with the provided input data.

Input data provided:
${JSON.stringify(workflowInput, null, 2)}

Execute the workflow immediately using the ${selectedWorkflow.toolName} tool.`;

  console.log('[Unified Orchestrator API] Received request', {
    workflow,
    modelId: modelId || 'No Model Selected',
    hasInput: Object.keys(workflowInput).length > 0,
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

