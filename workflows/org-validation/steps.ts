/**
 * Organization Validation Workflow Steps
 * 
 * This file defines all durable steps used in the organization validation workflow.
 * The workflow uses a fan-out pattern with parallel worker agents, then consolidates results.
 * 
 * Workflow Flow Overview:
 * 1. Fan out to 3 parallel workers (Legal Scout, Sector Analyst, Trust Officer)
 * 2. Consolidate and cross-check worker outputs
 * 3. Generate confidence score and reasoning
 * 4. Return typed result with sources
 */

import { FatalError, fetch } from 'workflow';
import { legalScoutWorker } from './agent/subagents/legal-scout-agent';
import { sectorAnalystWorker } from './agent/subagents/sector-analyst-agent';
import { trustOfficerWorker } from './agent/subagents/trust-officer-agent';

/**
 * Input type for organization validation workflow
 */
export type OrgValidationInput = {
  domain: string;
  requesterId?: string;
};

/**
 * Result type returned from the organization validation workflow
 */
export type OrgValidationResult = {
  domain: string;
  validated: boolean;
  organization: {
    legalName: string;
    jurisdiction: string;
    sector: string;
  };
  confidence: number; // 0-1
  sources: Array<{
    type: 'legal' | 'sector' | 'trust';
    source: string;
    data: any;
  }>;
  reasoning: string;
  workerResults: {
    legal: any;
    sector: any;
    trust: any;
  };
};

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const LEGAL_API = process.env.ORG_VALIDATION_LEGAL ?? `${BASE}/api/mocks/org-validation/legal`;
const SECTOR_API = process.env.ORG_VALIDATION_SECTOR ?? `${BASE}/api/mocks/org-validation/sector`;
const TRUST_API = process.env.ORG_VALIDATION_TRUST ?? `${BASE}/api/mocks/org-validation/trust`;

/**
 * Step 1: Legal Scout Worker
 * 
 * Looks up legal information about the organization (legal name, jurisdiction of formation).
 */
export async function runLegalScout(input: { domain: string }) {
  "use step";
  return await legalScoutWorker(input.domain);
}
runLegalScout.maxRetries = 3;

/**
 * Step 2: Sector Analyst Worker
 * 
 * Identifies the organization's sector/industry.
 */
export async function runSectorAnalyst(input: { domain: string }) {
  "use step";
  return await sectorAnalystWorker(input.domain);
}
runSectorAnalyst.maxRetries = 3;

/**
 * Step 3: Trust Officer Worker
 * 
 * Gathers trust information (confidence score, verification sources).
 */
export async function runTrustOfficer(input: { domain: string }) {
  "use step";
  return await trustOfficerWorker(input.domain);
}
runTrustOfficer.maxRetries = 3;

/**
 * Step 4: Consolidate Results
 * 
 * Cross-checks worker outputs for consistency and generates final result.
 */
export async function consolidateResults(input: {
  domain: string;
  legalResult: any;
  sectorResult: any;
  trustResult: any;
}) {
  "use step";
  
  // Cross-check consistency
  const legalName = input.legalResult?.legalName || input.legalResult?.name || 'Unknown';
  const jurisdiction = input.legalResult?.jurisdiction || 'Unknown';
  const sector = input.sectorResult?.sector || input.sectorResult?.industry || 'Unknown';
  const trustScore = input.trustResult?.confidence || input.trustResult?.score || 0;
  
  // Calculate overall confidence based on consistency
  let confidence = trustScore;
  
  // Reduce confidence if there are inconsistencies
  if (input.legalResult?.legalName && input.sectorResult?.sector) {
    // If both legal and sector agree on organization name, increase confidence
    const legalNameNormalized = legalName.toLowerCase().trim();
    const sectorNameNormalized = (input.sectorResult?.organizationName || '').toLowerCase().trim();
    if (legalNameNormalized === sectorNameNormalized || 
        legalNameNormalized.includes(sectorNameNormalized) ||
        sectorNameNormalized.includes(legalNameNormalized)) {
      confidence = Math.min(1, confidence + 0.2);
    } else {
      confidence = Math.max(0, confidence - 0.3);
    }
  }
  
  // Generate reasoning
  const reasoning = `Legal Scout identified "${legalName}" in ${jurisdiction}. Sector Analyst classified as ${sector}. Trust Officer assigned confidence ${(trustScore * 100).toFixed(0)}%. ${confidence > 0.7 ? 'High consistency across sources.' : confidence > 0.4 ? 'Moderate consistency with some discrepancies.' : 'Low consistency - manual review recommended.'}`;
  
  return {
    validated: confidence > 0.5,
    organization: {
      legalName,
      jurisdiction,
      sector,
    },
    confidence,
    sources: [
      { type: 'legal' as const, source: 'Legal Registry', data: input.legalResult },
      { type: 'sector' as const, source: 'Industry Database', data: input.sectorResult },
      { type: 'trust' as const, source: 'Trust Verification', data: input.trustResult },
    ],
    reasoning,
  };
}
consolidateResults.maxRetries = 2;

