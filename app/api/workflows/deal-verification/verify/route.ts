/**
 * Deal Verification API Route
 * 
 * API endpoint to trigger deal verification workflow.
 */

import { dealVerification } from '@/agents/deal-verification';
import type { DealVerificationInput } from '@/agents/deal-verification/types';

/**
 * POST Handler for Deal Verification
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { offerId, shopUrl, emailContent, partnerUrl, expectedDiscount, expectedPrice } = body;
    
    if (!partnerUrl && !shopUrl && !emailContent) {
      return Response.json(
        { ok: false, error: 'Partner URL, Shop URL, or email content is required' },
        { status: 400 }
      );
    }
    
    console.log('[Deal Verification API] Starting verification', {
      offerId,
      partnerUrl,
      mode: process.env.USE_HTTP_PROBES_ONLY === 'true' ? 'HTTP_PROBE' : 'PLAYWRIGHT',
    });
    
    const input: DealVerificationInput = {
      offerId,
      shopUrl,
      emailContent,
      partnerUrl,
      expectedDiscount,
      expectedPrice,
    };
    
    const result = await dealVerification(input);
    
    return Response.json({
      ok: true,
      result,
      offerId,
    });
  } catch (error) {
    console.error('[Deal Verification API] Error', error);
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

