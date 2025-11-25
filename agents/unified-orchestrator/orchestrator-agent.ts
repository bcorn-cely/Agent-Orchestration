/**
 * Unified Orchestrator Agent
 * 
 * This is the main AI agent that powers the multi-workflow chatbot.
 * It uses AI SDK 6's ToolLoopAgent with tools for all workflows:
 * - Organization Validation
 * - Deal Verification
 * - Teacher Verification
 * - Contract Management (existing)
 * 
 * The agent decides which workflow to trigger based on user input.
 */

import { ToolLoopAgent } from 'ai'
import { z } from 'zod';
import { tool } from 'ai';
import { start } from 'workflow/api';
import { orgValidation } from '../../workflows/org-validation/workflow';
import { dealVerification } from '../deal-verification';
import { teacherVerification } from '../teacher-verification';
import { OrgValidationInput } from '../../workflows/org-validation/steps';
import type { DealVerificationInput } from '../deal-verification/types';
import type { TeacherVerificationInput } from '../teacher-verification/types';

/**
 * Organization Validation Tool
 */
const orgValidateTool = tool({
  description: 'Validate an organization by domain. Uses parallel worker agents (Legal Scout, Sector Analyst, Trust Officer) to gather information, then consolidates results with confidence scoring.',
  inputSchema: z.object({
    domain: z.string().describe('Domain name to validate (e.g., reebok.com)'),
    requesterId: z.string().optional(),
  }),
  execute: async (input: OrgValidationInput) => {
    console.log('[Unified Orchestrator] Org validation tool called', {
      domain: input.domain,
    });
    
    const run = await start(orgValidation, [input]);
    return { 
      runId: run.runId, 
      domain: input.domain,
      message: `Organization validation workflow started for ${input.domain}. Run ID: ${run.runId}`,
    };
  },
});

/**
 * Deal Verification Tool
 */
const dealVerifyTool = tool({
  description: 'Verify a retail deal/offer by simulating customer journey. Supports Playwright (browser automation) or HTTP probe mode. Returns verification result with artifacts and failure classification.',
  inputSchema: z.object({
    offerId: z.string().optional().describe('Offer ID from Shop'),
    shopUrl: z.string().optional().describe('Shop URL with offer'),
    emailContent: z.string().optional().describe('Email content with offer details'),
    partnerUrl: z.string().describe('Partner ecommerce site URL'),
    expectedDiscount: z.string().optional().describe('Expected discount (e.g., "20%")'),
    expectedPrice: z.number().optional().describe('Expected price after discount'),
  }),
  execute: async (input: DealVerificationInput) => {
    console.log('[Unified Orchestrator] Deal verification tool called', {
      offerId: input.offerId,
      partnerUrl: input.partnerUrl,
    });
    
    const result = await dealVerification(input);
    return {
      verified: result.verified,
      offerValid: result.offerValid,
      offerId: result.offerId,
      partnerUrl: input.partnerUrl,
      failureType: result.failureType,
      method: result.verificationDetails.method,
      message: `Deal verification completed. Verified: ${result.verified}, Valid: ${result.offerValid}`,
    };
  },
});

/**
 * Teacher Verification Tool
 */
const teacherVerifyTool = tool({
  description: 'Verify a teacher community membership via state registry database lookup. Implements 3-step flow: copy ID → query registry → validate. Returns verification result immediately.',
  inputSchema: z.object({
    memberId: z.string().optional().describe('Member ID number (if available)'),
    memberName: z.string().optional().describe('Member name (required if no memberId)'),
    dateOfBirth: z.string().optional().describe('Date of birth (required if no memberId)'),
    state: z.string().describe('State code (e.g., CA, NY, TX)'),
    msrId: z.string().describe('Member Support Representative ID'),
  }),
  execute: async (input: TeacherVerificationInput) => {
    console.log('[Unified Orchestrator] Teacher verification tool called', {
      memberId: input.memberId,
      state: input.state,
      msrId: input.msrId,
    });
    
    const result = await teacherVerification(input);
    return {
      verificationId: result.verificationId,
      verified: result.verified,
      memberId: result.memberId,
      state: result.state,
      registryMatch: result.registryMatch,
      message: `Teacher verification completed. Verified: ${result.verified}`,
    };
  },
});


/**
 * Call Options Schema
 */
const callOptionsSchema = z.object({
  selectedModel: z.string().optional(),
});

/**
 * Determine Task Complexity
 */
function determineTaskComplexity(prompt: string | Array<any> | undefined): 'simple' | 'complex' {
  if (!prompt) return 'simple';
  
  const promptText = Array.isArray(prompt) 
    ? prompt.map((p: any) => typeof p === 'string' ? p : p.text || '').join(' ')
    : String(prompt);
  
  const lowerPrompt = promptText.toLowerCase();
  
  // Complex tasks: workflow triggers, validations, verifications
  if (lowerPrompt.includes('validate') || 
      lowerPrompt.includes('verify') || 
      lowerPrompt.includes('draft') ||
      lowerPrompt.includes('contract') ||
      lowerPrompt.includes('organization') ||
      lowerPrompt.includes('deal') ||
      lowerPrompt.includes('teacher')) {
    return 'complex';
  }
  
  return 'simple';
}

/**
 * Select Model Based on Complexity
 */
function selectModel(taskComplexity: 'simple' | 'complex'): string {
  if (taskComplexity === 'complex') {
    return 'anthropic/claude-sonnet-4.5';
  } else {
    return 'openai/gpt-4o-mini';
  }
}

/**
 * Create Unified Orchestrator Agent
 */
export function createUnifiedOrchestratorAgent(defaultModelId: string = 'openai/gpt-4o-mini') {
  const baseSystemPrompt = `You are a unified AI assistant that helps with multiple workflows:

**Available Workflows:**

1. **Contract Management** - Draft contracts, detect risks, manage approvals
   - Use contractDraft tool to start contract workflow
   - Requires: requesterId, requesterRole, contractType, jurisdiction, product, parties, requesterEmail

2. **Organization Validation** - Validate organizations by domain
   - Use orgValidate tool to start validation workflow
   - Uses parallel worker agents (Legal Scout, Sector Analyst, Trust Officer)
   - Requires: domain

3. **Deal Verification** - Verify retail deals and offers
   - Use dealVerify tool to start verification workflow
   - Supports Playwright (browser automation) or HTTP probes
   - Requires: partnerUrl, and optionally offerId/shopUrl/emailContent

4. **Teacher Verification** - Verify teacher community membership
   - Use teacherVerify tool to verify teacher membership
   - Requires: state, msrId, and either memberId or (memberName + dateOfBirth)
   - Returns verification result immediately

**Your Approach:**
1. Understand what the user wants to accomplish
2. Ask clarifying questions to gather required information
3. Use the appropriate tool to start the workflow
4. Explain what the workflow does and what to expect

Be helpful, clear, and professional. Guide users to the right workflow and gather all necessary information before starting workflows.`;

  const agent = new ToolLoopAgent({
    model: defaultModelId,
    callOptionsSchema,
    instructions: baseSystemPrompt,
    tools: {
      orgValidate: orgValidateTool,
      dealVerify: dealVerifyTool,
      teacherVerify: teacherVerifyTool,
    },
    prepareCall: ({ options, model, instructions, prompt, tools, ...settings }) => {
      // Determine model based on task complexity from prompt
      let selectedModelId = model; // Default to provided model
      
      if (prompt) {
        // Extract text for complexity analysis from prompt
        const promptText = Array.isArray(prompt) 
          ? prompt.map((p: any) => typeof p === 'string' ? p : p.text || '').join(' ')
          : String(prompt);
        
        const taskComplexity = determineTaskComplexity(promptText);
        selectedModelId = options?.selectedModel || selectModel(taskComplexity);
      } else {
        // If user selected a model, use it; otherwise keep default
        selectedModelId = options?.selectedModel || model;
      }
      
      // Return settings - preserve prompt if provided, only modify model
      return {
        ...settings,
        model: selectedModelId,
        instructions,
        tools,
        // Preserve prompt if provided
        ...(prompt !== undefined && { prompt }),
      };
    },
  });

  return agent;
}

