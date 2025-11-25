/**
 * Deal Verification Types
 * 
 * Type definitions for deal verification agent.
 */

/**
 * Input type for deal verification
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
 * Result type returned from deal verification
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

