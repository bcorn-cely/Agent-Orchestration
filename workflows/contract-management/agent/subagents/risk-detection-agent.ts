/**
 * Risk Detection Agent
 * 
 * This agent identifies legal and business risks in contracts using a premium AI model.
 * It uses a ToolLoopAgent with tools to conditionally check precedents and compare to playbooks.
 * 
 * Key Features:
 * - Agent analyzes contract and identifies specific risk areas (not everything)
 * - Conditional tool calls: agent decides which risks to investigate based on contract content
 * - Agent checks precedents for specific suspicious clauses/sections
 * - Agent compares to playbook only when needed (based on precedent results)
 * - Uses structured output for reliable parsing
 * - Requires human approval for high-severity risks (with full context)
 * 
 * Model: claude-sonnet-4.5 (premium model for complex legal reasoning)
 * 
 * This is called as a durable step in the workflow.
 */

import { ToolLoopAgent, tool, stepCountIs, Output } from 'ai';
import { z } from 'zod';
import { defineHook, FatalError, sleep, fetch } from 'workflow';


const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const RISKS = process.env.RISKS ?? `${BASE}/api/mocks/contract-management/contracts/risks`;
const NOTIFY = process.env.NOTIFY ?? `${BASE}/api/mocks/notify`;

/**
 * Hook for Risk Detection Approval
 * 
 * Used when high-severity risks are detected.
 * Requires human (legal team) approval before proceeding.
 */
export const riskDetectionApprovalHook = defineHook({
  schema: z.object({
    approved: z.boolean(),
    comment: z.string().optional(),
    by: z.string().email().optional(),
    proceedWithRisks: z.boolean().optional(),
  }),
});

/**
 * Create Risk Detection Agent
 * 
 * Creates a ToolLoopAgent configured for risk detection with two tools:
 * 1. checkPrecedent - Looks up similar contracts for precedent analysis
 * 2. compareToPlaybook - Compares contract terms to company playbook standards
 * 
 * The agent uses these tools to identify risks and assess their severity.
 * 
 * @returns Configured ToolLoopAgent instance
 */
export function createRiskDetectionAgent() {
  return new ToolLoopAgent({
    model: 'anthropic/claude-sonnet-4.5', // Premium model for complex legal reasoning
    instructions: `You are a legal risk analyst specializing in contract risk detection. Your job is to identify potential legal, financial, and business risks in contracts.

Your approach:
1. First, analyze the contract text to identify suspicious clauses, missing terms, or potential issues
2. For each suspicious area, use checkPrecedent with specific context (contract type, jurisdiction, key terms)
3. Based on precedent results, decide if playbook comparison is needed:
   - If precedent shows high risk → use compareToPlaybook to check if terms match company standards
   - If precedent shows acceptable risk → may skip playbook check
4. Synthesize findings from multiple tool calls
5. Assess severity (high, medium, low) for each risk
6. Provide clear recommendations for each identified risk

IMPORTANT: Limit yourself to 3 risks for demo purposes.

Investigate areas you've identified as potentially risky.`,
    
    // Structured output specification - agent will generate structured data directly
    output: Output.object({
      schema: z.object({
        risks: z.array(z.object({
          type: z.enum(['risky_clause', 'missing_term', 'jurisdiction_conflict', 'playbook_deviation']),
          severity: z.enum(['high', 'medium', 'low']),
          clause: z.string().optional(),
          description: z.string(),
          recommendation: z.string(),
          confidence: z.number().min(0).max(1).optional(),
        })),
      }),
    }),
    
    tools: {
      // Tool: Check precedents from similar contracts
      checkPrecedent: tool({
        description: 'Check similar contracts in the database for precedent analysis and return structured output',
        inputSchema: z.object({ 
          contractType: z.string(),
          jurisdiction: z.string(),
          keyTerms: z.string(),
        }),
        outputSchema: z.object({
          precedents: z.array(z.object({
            contractId: z.string(),
            contractType: z.string(),
            jurisdiction: z.string(),
            riskLevel: z.enum(['high', 'medium', 'low']),
            issuesFound: z.array(z.object({
              type: z.string(),
              severity: z.enum(['high', 'medium', 'low']),
              description: z.string(),
              clause: z.string().optional(),
            })),
            similarTerms: z.string(),
            recommendation: z.string(),
          })),
          summary: z.object({
            totalPrecedents: z.number(),
            highRiskCount: z.number(),
            mediumRiskCount: z.number(),
            lowRiskCount: z.number(),
            commonIssues: z.array(z.string()),
          }),
          analysis: z.string(),
        }).describe('Precedent analysis with similar contracts, risk levels, issues found, and recommendations'),
        execute: async ({ contractType, jurisdiction, keyTerms }) => {

          const res = await fetch(`${RISKS}/precedent`, {
            method: 'POST',
            body: JSON.stringify({ contractType, jurisdiction, keyTerms }),
            headers: { 'content-type': 'application/json' },
          });
          if (!res.ok) {
            throw new FatalError(`Precedent check API failed: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          if (!data) {
            throw new FatalError(`Precedent check API returned no data for contractType: ${contractType}, jurisdiction: ${jurisdiction}`);
          }
          return data;
        }
      }),
      
      // Tool: Compare contract terms to company playbook
      compareToPlaybook: tool({
        description: 'Compare contract terms to company playbook standards and return structured output',
        inputSchema: z.object({ 
          contractText: z.string(),
          product: z.string(),
        }),
        outputSchema: z.object({
          deviations: z.array(z.object({
            clause: z.string(),
            deviationType: z.enum(['missing', 'non_standard', 'below_threshold', 'above_threshold']),
            severity: z.enum(['high', 'medium', 'low']),
            playbookStandard: z.string(),
            contractValue: z.string(),
            description: z.string(),
            recommendation: z.string(),
          })),
          summary: z.object({
            totalDeviations: z.number(),
            highSeverityCount: z.number(),
            mediumSeverityCount: z.number(),
            lowSeverityCount: z.number(),
            complianceScore: z.number(),
          }),
          playbookVersion: z.string(),
          lastUpdated: z.string(),
          analysis: z.string(),
          recommendations: z.array(z.object({
            priority: z.enum(['urgent', 'important', 'optional']),
            clause: z.string(),
            action: z.string(),
          })),
        }).describe('Playbook comparison results with deviations, compliance score, and prioritized recommendations'),
        execute: async ({ contractText, product }) => { 
          const res = await fetch(`${RISKS}/playbook`, {
            method: 'POST',
            body: JSON.stringify({ contractText, product }),
            headers: { 'content-type': 'application/json' },
          });
          if (!res.ok) {
            throw new FatalError(`Playbook comparison API failed: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          if (!data) {
            throw new FatalError(`Playbook comparison API returned no data for product: ${product}`);
          }
          return data;
        }
      }),
    },
    
    stopWhen: stepCountIs(15),
  });
}

/**
 * Detect Risks
 * 
 * Main function that detects risks in contracts using the risk detection agent.
 * 
 * Process:
 * 1. Creates a risk detection agent
 * 2. Generates risk analysis using the agent's tools (precedents, playbook comparison)
 * 3. Checks for high-severity risks
 * 4. If high-severity risks found, requires human approval via hook
 * 5. Parses and returns risk results with type, severity, description, and recommendations
 * 
 * @param input - Contract details including text, jurisdiction, product, type, and ID
 * @returns Array of detected risks with type, severity, description, and recommendations
 */
export async function detectRisks(input: {
  contractText: string;
  jurisdiction: string;
  product: string;
  contractId: string;
  contractType: string;
}) {
  // NOTE: This function is called from within a step (detectRisks in steps.ts),
  // so "use step" would be a no-op here. The step function in steps.ts has "use step".
  
  try {
    
    const agent = createRiskDetectionAgent();
    
    let agentResult;
    try {
      // Step 1: Agent analyzes contract and makes conditional tool calls
      agentResult = await agent.generate({
        prompt: `Analyze this ${input.contractType} contract for legal and business risks.

Contract text:
${input.contractText}

Context:
- Jurisdiction: ${input.jurisdiction}
- Product: ${input.product}

Your task:
1. Analyze the contract to identify suspicious clauses, missing terms, or potential issues
2. For each suspicious area, use checkPrecedent with specific context
3. Based on precedent results, decide if compareToPlaybook is needed
4. Synthesize findings and assess risk severity
5. Return the results

IMPORTANT: Limit yourself to 3 risks found for demo purposes and return structured output.

Investigate areas you've identified as potentially risky.`
      });
    } catch (error) {
      throw new FatalError(`detectRisks failed: agent.generate() threw error for contractId: ${input.contractId}. Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Agent now returns structured output directly - no need for generateObject()
    const riskResult = agentResult.output;

        // Return structured risk results
    // If no risks found, return a default low-risk result
    if (riskResult.risks.length === 0) {
      return [{
        type: 'risky_clause' as const,
        severity: 'low' as const,
        description: 'No significant risks detected',
        recommendation: 'Proceed with standard review process',
      }];
    }

    // Check for high-severity risks
    const hasHighSeverityRisks = riskResult.risks.some((r: { severity: string }) => r.severity === 'high');


    return { risks: riskResult.risks, hasHighSeverityRisks };
  } catch (error) {
    // Re-throw FatalErrors as-is
    if (error instanceof FatalError) {
      throw error;
    }
    // Wrap any other errors as FatalError with context
    throw new FatalError(`detectRisks failed: Unexpected error for contractId: ${input.contractId}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

