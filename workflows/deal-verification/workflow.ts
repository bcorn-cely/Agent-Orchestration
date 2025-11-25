/**
 * Deal Verification Workflow
 * 
 * This workflow verifies retail deals/offers by simulating customer journeys.
 * Supports two modes:
 * 1. Playwright mode: Full browser automation (if available)
 * 2. HTTP probe mode: HTTP requests + content extraction (fallback)
 * 
 * Key Features:
 * - Feature flag to switch between Playwright and HTTP modes
 * - Artifact persistence (HTML snippets, JSON captures, screenshots)
 * - Failure classification (technical vs business logic)
 * - Performance metrics (execution time, step count)
 */

import {
  fetchOfferDetails,
  verifyOfferWithPlaywright,
  verifyOfferWithHttpProbe,
  DealVerificationInput,
  DealVerificationResult,
} from './steps';

// Feature flag: Use HTTP probes only (skip Playwright)
const USE_HTTP_PROBES_ONLY = process.env.USE_HTTP_PROBES_ONLY === 'true';

/**
 * Main Deal Verification Workflow Function
 * 
 * @param input - Offer details (from Shop or email)
 * @returns Verification result with artifacts and failure classification
 */
export async function dealVerification(input: DealVerificationInput): Promise<DealVerificationResult> {
  'use workflow'
  
  const startTime = Date.now();
  
  console.log(`[Deal Verification] Started`, {
    offerId: input.offerId,
    partnerUrl: input.partnerUrl,
    mode: USE_HTTP_PROBES_ONLY ? 'HTTP_PROBE' : 'PLAYWRIGHT',
  });
  
  // ========== Step 1: Fetch Offer Details ==========
  const offerDetails = await fetchOfferDetails({
    offerId: input.offerId,
    shopUrl: input.shopUrl,
    emailContent: input.emailContent,
  });
  
  const partnerUrl = input.partnerUrl || offerDetails.partnerUrl;
  const expectedDiscount = input.expectedDiscount || offerDetails.expectedDiscount;
  const expectedPrice = input.expectedPrice || offerDetails.expectedPrice;
  
  console.log(`[Deal Verification] Offer details fetched`, {
    partnerUrl,
    expectedDiscount,
  });
  
  // ========== Step 2: Verify Offer ==========
  // Choose verification method based on feature flag
  let verificationResult;
  
  if (USE_HTTP_PROBES_ONLY) {
    console.log(`[Deal Verification] Using HTTP probe mode`);
    verificationResult = await verifyOfferWithHttpProbe({
      partnerUrl,
      expectedDiscount,
      expectedPrice,
    });
  } else {
    console.log(`[Deal Verification] Using Playwright mode`);
    try {
      verificationResult = await verifyOfferWithPlaywright({
        partnerUrl,
        expectedDiscount,
        expectedPrice,
      });
    } catch (error) {
      // Fallback to HTTP probe if Playwright fails
      console.log(`[Deal Verification] Playwright failed, falling back to HTTP probe`, error);
      verificationResult = await verifyOfferWithHttpProbe({
        partnerUrl,
        expectedDiscount,
        expectedPrice,
      });
      verificationResult.failureType = 'technical';
      verificationResult.error = error instanceof Error ? error.message : 'Playwright unavailable';
    }
  }
  
  const totalLatency = Date.now() - startTime;
  
  console.log(`[Deal Verification] Complete`, {
    verified: verificationResult.verified,
    offerValid: verificationResult.offerValid,
    failureType: verificationResult.failureType,
    method: verificationResult.verificationDetails.method,
    totalLatency,
  });
  
  return {
    offerId: input.offerId,
    ...verificationResult,
  };
}

