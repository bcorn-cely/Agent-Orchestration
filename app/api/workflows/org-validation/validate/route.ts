/**
 * Organization Validation API Route
 * 
 * API endpoint to trigger organization validation workflow.
 */

import { RequestWithResponse } from 'workflow';
import { start } from 'workflow/api';
import { orgValidation } from '@/workflows/org-validation/workflow';
import { OrgValidationInput } from '@/workflows/org-validation/steps';

/**
 * POST Handler for Organization Validation
 * 
 * Starts the organization validation workflow.
 */
export async function POST(req: RequestWithResponse) {
  try {
    const { domain, requesterId } = await req.json();
    
    if (!domain || typeof domain !== 'string') {
      return Response.json(
        { ok: false, error: 'Domain is required' },
        { status: 400 }
      );
    }
    
    console.log('[Org Validation API] Starting validation', { domain, requesterId });
    
    const input: OrgValidationInput = { domain, requesterId };
    const run = await start(orgValidation, [input]);
    
    return Response.json({
      ok: true,
      runId: run.runId,
      domain,
    });
  } catch (error) {
    console.error('[Org Validation API] Error', error);
    return Response.json(
      {
        ok: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

