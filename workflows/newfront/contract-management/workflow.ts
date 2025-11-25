/**
 * Contract Management Workflow
 * 
 * This is the main orchestration workflow for contract management.
 * It coordinates all steps in the contract lifecycle:
 * 
 * Workflow Steps:
 * 1. Policy Compliance Check - Verify persona can perform action
 * 2. Draft Contract - Generate from template
 * 3. Extract Structured Data - Extract parties, dates, amounts (cheap model)
 * 4. Validate Clauses - Check required/optional clauses (cheap model)
 * 5. Detect Risks - Identify legal/business risks (premium model)
 * 6. Contract Manager Review - If requester initiated (optional, with timeout)
 * 7. Legal Approval - Required for all contracts (with timeout)
 * 8. Send to Counterparty - External review (separate workflow)
 * 9. Archive Contract - Store final version
 * 
 * Key Features:
 * - Persona-based access control (requester/manager/legal)
 * - Model routing (cheap for extraction, premium for risk analysis)
 * - Human-in-the-loop approvals with timeouts
 * - Comprehensive audit logging (cost, latency, model used)
 * - Error handling and retry logic
 */

import { sleep } from 'workflow';
import { FatalError } from 'workflow';
import {
  draftContract,
  extractStructuredData,
  validateClauses,
  detectRisks,
  checkPolicyCompliance,
  generateRedline,
  sendApprovalRequest,
  archiveContract,
  ContractDraftInput,
} from './steps';
import { contractApprovalHook, contractManagerReviewHook } from './hooks';
import { clauseValidationApprovalHook } from './agent/subagents/clause-validation-agent';

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';

/**
 * Main Contract Management Workflow Function
 * 
 * Orchestrates the entire contract lifecycle from drafting to archiving.
 * 
 * @param input - Contract draft input with requester info, contract type, parties, etc.
 * @returns Contract result with draft, analysis, approvals, and audit log
 */
export async function contractManagement(input: ContractDraftInput) {
  'use workflow'
  
  // Generate unique contract ID (without dates to avoid approval token issues)
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const contractId = `contract:${input.requesterId}:${randomSuffix}`;
  const startTime = Date.now();

  // Log workflow start
  console.log(`[Contract Workflow] Started for ${contractId}`, {
    requesterId: input.requesterId,
    role: input.requesterRole,
    contractType: input.contractType,
    jurisdiction: input.jurisdiction,
  });

  // ========== Step 1: Policy Compliance Check ==========
  // Verify that the requester's persona has permission to draft contracts
  // This enforces role-based access control (requester can draft, legal cannot)
  const policyCheck = await checkPolicyCompliance({
    persona: input.requesterRole,
    action: 'draft',
  });

  if (!policyCheck.allowed) {
    const errorMsg = `Policy violation: ${input.requesterRole} cannot draft contracts. ${policyCheck.reason || ''}`;
    console.error(`[Contract Workflow] ${errorMsg}`, { contractId, policyCheck });
    return {
      contractId,
      error: 'Policy violation',
      policyCheck,
    };
  }

  // ========== Step 2: Draft Contract from Template ==========
  // Generate the initial contract document from approved templates
  // This is a mock service that simulates template-based generation
  const draftStartTime = Date.now();
  const draft = await draftContract({
    contractType: input.contractType,
    jurisdiction: input.jurisdiction,
    product: input.product,
    parties: input.parties,
    keyTerms: input.keyTerms,
  });
  const draftLatency = Date.now() - draftStartTime;
  console.log(`[Contract Workflow] Draft generated`, {
    contractId,
    latency: draftLatency,
    model: 'openai/gpt-4o-mini',
  });

  // ========== Step 3: Extract Structured Data ==========
  // Use a cheap AI model (gpt-4o-mini) to extract structured information
  // This is cost-optimized since extraction is simpler than legal reasoning
  const extractStartTime = Date.now();
  const structuredData = await extractStructuredData(draft.contractText);
  const extractLatency = Date.now() - extractStartTime;
  const extractCost = 0.001; // Mock cost for cheap model

  console.log(`[Contract Workflow] Structured data extracted`, {
    contractId,
    latency: extractLatency,
    usage: structuredData.usage,
    providerMetadata: structuredData.providerMetadata,
    model: 'gpt-4o-mini',
  });

  // ========== Step 4: Validate Clauses ==========
  // Check that all required clauses are present for the contract type and jurisdiction
  // Uses a clause validation agent that looks up clause definitions and jurisdiction rules
  console.log(`[Contract Workflow] Starting clause validation`, {
    contractId,
    contractType: input.contractType,
    jurisdiction: input.jurisdiction,
    hasContractText: !!draft?.contractText,
    contractTextLength: draft?.contractText?.length || 0,
  });
  
  const clauseValidation = await validateClauses({
    contractText: draft.contractText,
    contractType: input.contractType,
    jurisdiction: input.jurisdiction,
    product: input.product,
    contractId,
  });

  if (!clauseValidation) {
    throw new FatalError(`[Contract Workflow] Clause validation returned undefined for contractId: ${contractId}`);
  }

  console.log(`[Contract Workflow] Clause Validation Complete`, {
    contractId,
    hasResult: !!clauseValidation,
    requiredCount: clauseValidation?.required?.length || 0,
    missingCount: clauseValidation?.missing?.length || 0,
    issuesCount: clauseValidation?.issues?.length || 0,
    needsApproval: clauseValidation?.needsApproval || false,
    model: 'gpt-5-mini',
  });

  // If high-risk clause validation issues found, require human approval
  // Human gets FULL CONTEXT: contract + agent analysis + clause library reference
  if (clauseValidation.needsApproval) {
    const approvalToken = `${contractId}:clause-validation-approval`;
    const approval = clauseValidationApprovalHook.create({ token: approvalToken });

    // Send approval email with FULL CONTEXT
    await sendApprovalRequest(
      approvalToken,
      'legal@newfront.com',
      'clause-validation',
      {
        contractId,
        contractType: input.contractType,
        draft: draft.contractText,
        clauseValidation,
      }
    );

    const approvalTimeout = '2h';
    const approvalDecision = await Promise.race([
      approval,
      (async () => {
        await sleep(approvalTimeout);
        return { approved: false, comment: 'Clause validation approval timeout' };
      })(),
    ]);

    if (!approvalDecision.approved) {
      throw new FatalError(`Clause validation not approved for contractId: ${contractId}. Comment: ${approvalDecision.comment || 'Approval denied'}`);
    }
  }

  // ========== Step 5: Detect Risks ==========
  // Use a premium AI model (claude-sonnet-4.5) for legal risk analysis
  // This is where we invest in a better model for complex legal reasoning
  const riskStartTime = Date.now();
  
  console.log(`[Contract Workflow] Starting risk detection`, {
    contractId,
    contractType: input.contractType,
    jurisdiction: input.jurisdiction,
    product: input.product,
    hasContractText: !!draft?.contractText,
    contractTextLength: draft?.contractText?.length || 0,
  });
  
  const risks = await detectRisks({
    contractText: draft.contractText,
    jurisdiction: input.jurisdiction,
    product: input.product,
    contractId,
    contractType: input.contractType,
  });

  if (!risks) {
    throw new FatalError(`[Contract Workflow] Risk detection returned undefined for contractId: ${contractId}`);
  }

  let riskCount = 0;

  if (Array.isArray(risks)) {
    riskCount = risks.length
  }
  else{
    riskCount = risks.risks.length;
  }


  const riskLatency = Date.now() - riskStartTime;
  
  console.log(`[Contract Workflow] Risk detection complete`, {
    contractId,
    riskCount,
    latency: riskLatency,
  });

  console.log(`[Contract Workflow] Risk analysis complete`, {
    contractId,
    latency: riskLatency,
    // cost: riskCost,
    model: 'claude-sonnet-4.5',
    riskCount: risks,
  });

  // ========== Step 6: Contract Manager Review ==========
  // If a requester (non-manager) initiated this, route to contract manager for review
  // This is an optional step that only happens for requester-initiated contracts
  // The workflow pauses here and waits for manager approval (with timeout)
  if (input.requesterRole === 'requester') {
    const managerToken = `${contractId}:manager-review`;
    const managerApproval = contractManagerReviewHook.create({ token: managerToken });
    
    await sendApprovalRequest(
      managerToken,
      'contract-manager@newfront.com',
      'contract_manager',
      {
        contractId,
        contractType: input.contractType,
        draft: draft.contractText,
        structuredData,
        clauseValidation,
        risks,
      }
    );

    const managerTimeout = '1h';
    const managerDecision = await Promise.race([
      managerApproval,
      (async () => {
        await sleep(managerTimeout);
        return { approved: false, comment: 'Manager review timeout' };
      })(),
    ]);

    if (managerDecision.approved === false) {
      // If edits provided, generate redline
      if ('edits' in managerDecision && managerDecision.edits && managerDecision.edits.length > 0) {
        const revisedText = draft.contractText; // In real implementation, apply edits
        const redline = await generateRedline({
          originalText: draft.contractText,
          revisedText,
          reasonCodes: managerDecision.edits.map((e: any) => e.reason),
        });

        console.log(`[Contract Workflow] Redline document generated with ${managerDecision.edits.length} changes.`, {
          contractId,
          redline,
        });
      }

      return {
        contractId,
        draft: draft.contractText,
        structuredData,
        clauseValidation,
        risks,
        managerReview: managerDecision,
        error: 'Manager review not approved',
      };
    }
  }

  // ========== Step 7: Legal Approval ==========
  // Legal approval is REQUIRED for all contracts, regardless of who initiated
  // This is a critical checkpoint that ensures legal compliance
  // The workflow pauses here and waits for legal approval (with timeout)
  const legalToken = `${contractId}:legal-approval`;
  const legalApproval = contractApprovalHook.create({ token: legalToken });

  await sendApprovalRequest(
    legalToken,
    'legal@newfront.com',
    'legal',
    {
      contractId,
      contractType: input.contractType,
      draft: draft.contractText,
      structuredData,
      clauseValidation,
      risks,
    }
  );

  const legalTimeout = '2h';
  const legalDecision = await Promise.race([
    legalApproval,
    (async () => {
      await sleep(legalTimeout);
      return { approved: false, comment: 'Legal approval timeout' };
    })(),
  ]);

  if (legalDecision.approved === false) {
    return {
      contractId,
      draft: draft.contractText,
      structuredData,
      clauseValidation,
      risks,
      legalApproval: legalDecision,
      error: 'Legal approval denied or timeout',
    };
  }

  // ========== Step 8: Send to Counterparty ==========
  // After internal approvals, send contract to external counterparty for review
  // Note: Counterparty review is handled in a separate workflow
  // Get counterparty email from parties (party2 is typically the counterparty)
  const counterpartyEmail = input.parties.party2?.name 
    ? `${input.parties.party2.name.toLowerCase().replace(/\s+/g, '-')}@example.com`
    : 'counterparty@example.com';

  await sendApprovalRequest(
    `${contractId}:counterparty`,
    counterpartyEmail,
    'counterparty',
    {
      contractId,
      contractType: input.contractType,
      draft: draft.contractText,
      structuredData,
      clauseValidation,
      risks,
      legalApproval: legalDecision,
    }
  );

  // Step 9: Archive contract
  const archiveStartTime = Date.now();

  const archiveResult = await archiveContract({
    contractId,
    finalVersion: draft.contractText,
    metadata: {
      contractType: input.contractType,
      jurisdiction: input.jurisdiction,
      product: input.product,
      structuredData,
      clauseValidation,
      risks,
      approvals: {
        legal: legalDecision,
        counterpartySent: true,
      },
    },
  });

  const archiveLatency = Date.now() - archiveStartTime;
  const totalLatency = Date.now() - startTime;
  // const totalCost = extractCost + riskCost; // Sum of all AI model costs


  const contractUrl = `${BASE}/newfront/contracts/${contractId}`;

  // Final completion log with all metrics
  console.log(`[Contract Workflow] Complete`, {
    contractId,
    contractUrl,
    totalLatency,
    // totalCost,
    extractLatency,
    riskLatency,
    extractCost,
    archiveLatency,
    // riskCost,
  });

  // Return final result with complete contract data, analysis, and audit trail
  return {
    contractId,
    draft: draft.contractText,
    structuredData,
    clauseCoverage: clauseValidation,
    risks,
    policyViolations: [],
    // Audit log tracks all AI operations with cost, latency, and model used
    auditLog: [
      {
        timestamp: new Date().toISOString(),
        persona: input.requesterRole,
        action: 'draft',
        model: 'openai/gpt-4o-mini',
        latency: draftLatency,
      },
      {
        timestamp: new Date().toISOString(),
        persona: input.requesterRole,
        action: 'extract',
        model: 'openai/gpt-5-mini',
        cost: extractCost,
        latency: extractLatency,
      },
      {
        timestamp: new Date().toISOString(),
        persona: input.requesterRole,
        action: 'risk_detection',
        model: 'claude-sonnet-4.5',
        // cost: riskCost,
        latency: riskLatency,
      },
    ],
    approval: legalDecision,
    contractUrl,
  };
}

