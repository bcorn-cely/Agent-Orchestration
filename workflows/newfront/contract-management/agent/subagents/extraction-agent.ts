/**
 * Extraction Agent - Structured Data Extraction
 * 
 * This agent extracts structured information from contract text using a cheap AI model.
 * It's optimized for cost efficiency since extraction is a simpler task than legal reasoning.
 * 
 * Extracts:
 * - Parties: Names, roles, types (individual/organization)
 * - Dates: Start, end, signature, effective, expiration dates
 * - Amounts: Payments, fees, penalties, limits, budgets with currency
 * 
 * Model: gpt-4o-mini (cheap model for cost optimization)
 * 
 * This is called as a durable step in the workflow, so it can be retried on failure.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { FatalError, fetch } from 'workflow';

/**
 * Extract Structured Data from Contract Text
 * 
 * Uses generateObject with a Zod schema to extract structured information.
 * The schema ensures type safety and validates the extracted data.
 * 
 * @param contractText - The full contract text to extract data from
 * @returns Structured object with parties, dates, and amounts arrays
 */
export async function extractStructuredData(contractText: string) {
  
  const result = await generateObject({
    model: 'openai/gpt-4o-mini',
    schema: z.object({
      parties: z.array(z.object({
        name: z.string(),
        role: z.string(),
        type: z.enum(['individual', 'organization']),
      })),
      dates: z.array(z.object({
        type: z.enum(['start', 'end', 'signature', 'effective', 'expiration']),
        value: z.string(),
        description: z.string().optional(),
      })),
      amounts: z.array(z.object({
        type: z.enum(['payment', 'fee', 'penalty', 'limit', 'budget']),
        value: z.number(),
        currency: z.string().optional(),
        description: z.string().optional(),
      })),
    }),
    prompt: `Extract structured data from this contract text. Identify all parties, dates, and monetary amounts.

Contract text:
${contractText}

Return a structured JSON object with parties, dates, and amounts arrays.`,
  });

  return { object: result.object, usage: result.usage, providerMetadata: result.providerMetadata };
}
extractStructuredData.maxRetries = 3;
