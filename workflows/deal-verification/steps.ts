/**
 * Deal Verification Workflow Steps
 * 
 * This file defines all durable steps used in the deal verification workflow.
 * Supports two modes: Playwright (browser automation) or HTTP probes (fallback).
 * 
 * Workflow Flow Overview:
 * 1. Fetch offer details from Shop or email
 * 2. Verify offer using Playwright (if available) or HTTP probes
 * 3. Classify failures (technical vs business logic)
 * 4. Persist artifacts (HTML snippets, JSON captures)
 */

import { FatalError, fetch } from 'workflow';

/**
 * Input type for deal verification workflow
 */
export type DealVerificationInput = {
  offerId?: string;
  shopUrl?: string;
  emailContent?: string;
  partnerUrl: string;
  expectedDiscount?: string;
  expectedPrice?: number;
};

/**
 * Result type returned from the deal verification workflow
 */
export type DealVerificationResult = {
  offerId?: string;
  verified: boolean;
  offerValid: boolean;
  failureType?: 'technical' | 'business_logic';
  error?: string;
  artifacts: {
    htmlSnippet?: string;
    jsonCapture?: any;
    screenshots?: string[];
  };
  verificationDetails: {
    method: 'playwright' | 'http_probe';
    offerFound: boolean;
    discountMatches: boolean;
    priceMatches: boolean;
    executionTime: number;
    stepCount: number;
  };
};

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const SHOP_API = process.env.DEAL_VERIFICATION_SHOP ?? `${BASE}/api/mocks/deal-verification/shop-offer`;

// Feature flag: Use HTTP probes only (skip Playwright)
const USE_HTTP_PROBES_ONLY = process.env.USE_HTTP_PROBES_ONLY === 'true';

/**
 * Step 1: Fetch Offer Details
 * 
 * Fetches offer information from Shop or parses from email content.
 */
export async function fetchOfferDetails(input: {
  offerId?: string;
  shopUrl?: string;
  emailContent?: string;
}) {
  "use step";
  
  if (input.emailContent) {
    // Parse offer from email content
    // In a real implementation, this would use NLP to extract offer details
    return {
      partnerUrl: 'https://example-partner.com',
      expectedDiscount: '20%',
      expectedPrice: 100,
      offerDescription: '20% off all items',
    };
  }
  
  if (input.shopUrl || input.offerId) {
    const res = await fetch(`${SHOP_API}`, {
      method: 'POST',
      body: JSON.stringify({ offerId: input.offerId, shopUrl: input.shopUrl }),
      headers: { 'content-type': 'application/json' },
    });
    
    if (!res.ok) {
      throw new FatalError(`Failed to fetch offer: ${res.status}`);
    }
    
    return res.json();
  }
  
  throw new FatalError('No offer source provided (offerId, shopUrl, or emailContent)');
}
fetchOfferDetails.maxRetries = 3;

/**
 * Step 2: Verify Offer with Playwright
 * 
 * Uses browser automation to simulate customer journey and verify offer.
 */
export async function verifyOfferWithPlaywright(input: {
  partnerUrl: string;
  expectedDiscount?: string;
  expectedPrice?: number;
}) {
  "use step";
  
  // In a real implementation, this would use Playwright to:
  // 1. Navigate to partner URL
  // 2. Search for products
  // 3. Apply discount code
  // 4. Check cart/checkout for discount
  // 5. Capture screenshots and HTML
  
  // For demo, simulate Playwright verification
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock verification result
  const offerFound = true;
  const discountMatches = Math.random() > 0.3; // 70% chance of match
  const priceMatches = discountMatches;
  
  return {
    verified: offerFound && discountMatches && priceMatches,
    offerValid: discountMatches,
    failureType: discountMatches ? undefined : ('business_logic' as const),
    artifacts: {
      htmlSnippet: '<div class="discount">20% OFF</div>',
      jsonCapture: { discount: '20%', price: 100 },
      screenshots: ['screenshot-1.png'],
    },
    verificationDetails: {
      method: 'playwright' as const,
      offerFound,
      discountMatches,
      priceMatches,
      executionTime: 2000,
      stepCount: 5,
    },
  };
}
verifyOfferWithPlaywright.maxRetries = 2;

/**
 * Step 3: Verify Offer with HTTP Probe
 * 
 * Fallback mode: Uses HTTP requests and content extraction.
 */
export async function verifyOfferWithHttpProbe(input: {
  partnerUrl: string;
  expectedDiscount?: string;
  expectedPrice?: number;
}) {
  "use step";
  
  // In a real implementation, this would:
  // 1. Fetch partner URL
  // 2. Extract metadata (JSON-LD, Open Graph)
  // 3. Search for discount codes/prices in HTML
  // 4. Parse structured data
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock HTTP probe result
  const res = await fetch(input.partnerUrl);
  const html = await res.text();
  
  const offerFound = html.includes('discount') || html.includes('sale');
  const discountMatches = html.includes(input.expectedDiscount || '20%');
  const priceMatches = true; // Simplified for demo
  
  return {
    verified: offerFound && discountMatches && priceMatches,
    offerValid: discountMatches,
    failureType: discountMatches ? undefined : ('business_logic' as const),
    artifacts: {
      htmlSnippet: html.substring(0, 1000),
      jsonCapture: { 
        metadata: { title: 'Partner Store' },
        discountFound: discountMatches,
      },
    },
    verificationDetails: {
      method: 'http_probe' as const,
      offerFound,
      discountMatches,
      priceMatches,
      executionTime: 1000,
      stepCount: 3,
    },
  };
}
verifyOfferWithHttpProbe.maxRetries = 3;

