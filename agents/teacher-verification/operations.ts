/**
 * Teacher Verification Operations
 * 
 * Helper functions for teacher verification operations.
 * Implements the verification flow: copy ID → query registry → validate
 */

import { ToolLoopAgent, tool, Output, generateObject } from 'ai';
import { z } from 'zod';
import { createPlaywrightMCPClient } from '@/lib/playwright-mcp';
/**
 * Copy Member Identifier
 * 
 * Extracts member ID (or First Name + Last Name + DOB) from input.
 * In real implementation, this would copy from support tool UI.
 */
export async function copyMemberIdentifier(input: {
  memberId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}) {
  // Validate that we have either memberId or (firstName + lastName + dateOfBirth)
  if (!input.memberId && (!input.firstName || !input.lastName || !input.dateOfBirth)) {
    throw new Error('Either memberId or (firstName + lastName + dateOfBirth) is required');
  }
  
  return {
    memberId: input.memberId,
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth,
  };
}

/**
 * Query State Registry
 * 
 * Returns a ToolLoopAgent that uses websearch to query the state teacher registry.
 */
export async function queryStateRegistry(input: {
  memberId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  state: string;
}) {
  const playwrightClient = await createPlaywrightMCPClient();
  const tools = playwrightClient.tools;

  try {
    const agent = new ToolLoopAgent({
      model: 'openai/gpt-4o-mini',
      // INSTRUCTIONS: Defines the agent's persistent role, behavior, and capabilities.
      // This is set once when creating the agent and remains constant across all requests.
      // It should contain general rules, tool usage guidelines, and behavioral expectations.
      // Think of this as the agent's "personality" and "job description".
      instructions: `You are a teacher registry search specialist. Your job is to search for teacher registration information in state registry databases.

CRITICAL REQUIREMENTS:
1. You MUST use the browser tools (browser_navigate, browser_snapshot, browser_click, browser_type, etc.) to actually navigate to the state registry website and perform the search. Only use browser automation tools.
2. **MANDATORY: The browser MUST run in headless mode. NO browser window or UI should be opened or displayed. All browser operations must be performed invisibly in the background.**

General workflow:
1. Use browser_navigate to go to the state teacher registry website (headless mode only)
2. Use browser_snapshot to see the page structure
3. Use browser_click and browser_type to fill out search forms with the teacher's information required by the sites
4. Use browser_snapshot again to see the search results
5. Extract the verification information from the results`,
      tools: {
        ...tools, // Only browser tools, no web_search
      },
      prepareCall: ({ options, model, instructions, prompt, tools, ...settings }) => {
        // This only exists to log what's happening after each step
        // If updates to the prompt, model, or anything need to occur prior to execution then we can make those updates here before continuing
        console.log('=== ToolLoopAgent Execution Loop State ===');
        console.log('Model:', model);
        console.log('Options:', JSON.stringify(options, null, 2));
        console.log('Prompt:', typeof prompt === 'string' ? prompt : JSON.stringify(prompt, null, 2));
        console.log('Available Tools:', Object.keys(tools || {}));
        console.log('Settings:', JSON.stringify(Object.keys(settings), null, 2));
        console.log('==========================================');
        
        // Return settings unchanged (just logging for now)
        return {
          ...settings,
          model,
          instructions,
          tools,
          ...(prompt !== undefined && { prompt }),
        };
      },
    });
  
    // PROMPT: Provides the specific task and input data for THIS particular request.
    // This is passed to agent.generate() and can vary with each call.
    // It should contain request-specific information like the state, teacher details, etc.
    // Think of this as the "work order" or "task assignment" for this specific job.
    const result = await agent.generate({
      prompt: `Search for teacher registration information in the ${input.state} state registry database.

Search for:
${input.memberId ? `- Member ID: ${input.memberId}` : ''}
${input.firstName ? `- First Name: ${input.firstName}` : ''}
${input.lastName ? `- Last Name: ${input.lastName}` : ''}
${input.dateOfBirth ? `- Date of Birth: ${input.dateOfBirth}` : ''}

Navigate to the ${input.state} state teacher registry website using browser_navigate (MUST be headless - no browser window should open), then use browser_snapshot to see the page. Fill out the search form using browser_click and browser_type with the teacher's information above.

After submitting the search, use browser_snapshot to see the results and extract the verification information. Return a JSON object with verified (boolean), url (string), inputData (object), and verifiedInputData.`,
    });

 
    console.log('result.text ', result.text);
    const obj = await generateObject({
      model: 'openai/gpt-4o-mini',
      prompt: `Extract the relevant data from the following text and return it in the format specified by the schema. Analyze the input text to find the values that correspond to each schema field.

${result.text}`,
      schema: z.object({
        firstNameVerified: z.string().describe('The verified first name of the teacher. Look for this in verifiedInputData.firstName or similar fields in the input.'),
        lastNameVerified: z.string().describe('The verified last name of the teacher. Look for this in verifiedInputData.lastName or similar fields in the input.'),
        employmentStatus: z.string().nullish().describe('The employment or license status of the teacher if available in the input data. Can be null or undefined if not found.'),
        verified: z.boolean().describe('Whether the teacher verification was successful. Extract this boolean value from the input.'),
        url: z.string().describe('The URL to the verification page or search results. Extract this from the input.'),
        results: z.record(z.any()).describe('A record containing all the original data from the search result, including any nested objects like inputData and verifiedInputData.')
      }),
    });
    return obj.object;
  } finally {
    // Clean up the Playwright; MCP client (this also cleans up the config file)
    await playwrightClient.close();
  }
}

/**
 * Validate Member Details
 * 
 * Validates that the registry match is correct (first name, last name, DOB, employment status).
 */
export async function validateMemberDetails(input: {
  memberId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  registryResult: any;
}) {
  const registry = input.registryResult;
  
  if (!registry) {
    return {
      verified: false,
      registryMatch: {
        found: false,
        nameMatch: false,
        dobMatch: false,
        employmentStatus: 'unknown',
        details: null,
      },
    };
  }
  
  // Use the verified field directly from the registry result
  // Pass through the full results without parsing individual fields
  return {
    verified: registry.verified || false,
    registryMatch: {
      found: !!registry.verified,
      nameMatch: registry.firstNameVerified + registry.lastNameVerified ?? false,
      employmentStatus: registry.employmentStatus || 'unknown',
      details: registry.results,
    },
  };
}

