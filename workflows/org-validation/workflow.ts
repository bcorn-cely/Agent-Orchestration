/**
 * Organization Validation Workflow
 * 
 * This workflow validates an organization by domain using a fan-out pattern:
 * 1. Orchestrator fans out to 3 parallel worker agents (Legal, Sector, Trust)
 * 2. Workers run in parallel using Promise.all()
 * 3. Consolidation step cross-checks outputs for consistency
 * 4. Returns typed result with confidence score, sources, and reasoning
 * 
 * Key Features:
 * - Parallel execution of worker agents
 * - Cross-checking for data consistency
 * - Confidence scoring based on source agreement
 * - Timeouts and retries on worker steps
 * - Model/tool fallbacks logged
 */

import { FatalError } from 'workflow';
import {
  runLegalScout,
  runSectorAnalyst,
  runTrustOfficer,
  consolidateResults,
  OrgValidationInput,
  OrgValidationResult,
} from './steps';

/**
 * Main Organization Validation Workflow Function
 * 
 * @param input - Domain to validate
 * @returns Validation result with organization details, confidence, and sources
 */
export async function orgValidation(input: OrgValidationInput): Promise<OrgValidationResult> {
  'use workflow'
  
  const startTime = Date.now();
  const { domain } = input;
  
  console.log(`[Org Validation] Started for domain: ${domain}`);
  
  // ========== Step 1: Fan Out to Parallel Workers ==========
  // Run all 3 workers in parallel using Promise.all()
  // Each worker uses a different tool/data source
  console.log(`[Org Validation] Fanning out to 3 parallel workers for ${domain}`);
  
  const [legalResult, sectorResult, trustResult] = await Promise.all([
    runLegalScout({ domain }),
    runSectorAnalyst({ domain }),
    runTrustOfficer({ domain }),
  ]);
  
  console.log(`[Org Validation] All workers completed`, {
    domain,
    legalComplete: !!legalResult,
    sectorComplete: !!sectorResult,
    trustComplete: !!trustResult,
  });
  
  // ========== Step 2: Consolidate and Cross-Check ==========
  // Consolidate results, cross-check for consistency, generate confidence score
  const consolidated = await consolidateResults({
    domain,
    legalResult,
    sectorResult,
    trustResult,
  });
  
  const totalLatency = Date.now() - startTime;
  
  console.log(`[Org Validation] Complete`, {
    domain,
    validated: consolidated.validated,
    confidence: consolidated.confidence,
    legalName: consolidated.organization.legalName,
    totalLatency,
  });
  
  return {
    domain,
    ...consolidated,
    workerResults: {
      legal: legalResult,
      sector: sectorResult,
      trust: trustResult,
    },
  };
}

