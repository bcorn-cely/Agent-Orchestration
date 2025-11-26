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
      instructions: `You are a teacher registry search specialist. Your job is to search for teacher registration information in the ${input.state} state registry database.

Search for:
${input.memberId ? `- Member ID: ${input.memberId}` : ''}
${input.firstName ? `- First Name: ${input.firstName}` : ''}
${input.lastName ? `- Last Name: ${input.lastName}` : ''}
${input.dateOfBirth ? `- Date of Birth: ${input.dateOfBirth}` : ''}

CRITICAL REQUIREMENTS:
1. You MUST use the browser tools (browser_navigate, browser_snapshot, browser_click, browser_type, etc.) to actually navigate to the state registry website and perform the search. Only use browser automation tools.
2. **MANDATORY: The browser MUST run in headless mode. NO browser window or UI should be opened or displayed. All browser operations must be performed invisibly in the background.**

Steps to follow:
1. Use browser_navigate to go to the ${input.state} state teacher registry website (headless mode only)
2. Use browser_snapshot to see the page structure
3. Use browser_click and browser_type to fill out the search form with the teacher's information
4. Use browser_snapshot again to see the search results
5. Extract the verification information from the results

Return a JSON object with: verified (boolean), url (string to the verification page), and inputData (the original input).`,
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
    
    const result = await agent.generate({
      prompt: `Navigate to the ${input.state} state teacher registry website using browser_navigate (MUST be headless - no browser window should open), then use browser_snapshot to see the page. Fill out the search form using browser_click and browser_type with:
${input.firstName ? `First Name: ${input.firstName}` : ''}
${input.lastName ? `Last Name: ${input.lastName}` : ''}
${input.dateOfBirth ? `Date of Birth: ${input.dateOfBirth}` : ''}
${input.memberId ? `Member ID: ${input.memberId}` : ''}

IMPORTANT: All browser operations must be performed in headless mode. Do not open any visible browser windows.

After submitting the search, use browser_snapshot to see the results and extract the verification information. Return a JSON object with verified (boolean), url (string), and inputData (object).`,
    });

    // const steps = (result as any).steps;
    // steps.forEach((step: any) => {
    //   console.log('step content ', step.content);
    //   console.log('step messages ', step.messages);
    //   console.log('step tool calls ', step.toolCalls);
    //   console.log('step tool results ', step.toolResults);
    //   if (step.toolResults.length > 0) step.toolResults.forEach((result: any) => console.log(result.output))
    //   console.log('step finish reason ', step.finishReason);
    //   console.log('step usage ', step.usage);
    //   console.log('step model ', step.model);
    //   console.log('step prompt ', step.prompt);
    //   console.log('step options ', step.options);
    // });

    const obj = await generateObject({
      model: 'openai/gpt-4o-mini',
      prompt: `Your purpose is to extract the necessary data from the input text and return it in the provided format matching our output schema: \n\n ${result.text}`,
      schema: z.object({
        verified: z.boolean().describe('whether the teacher is verified'),
        url: z.string().describe('the url with the page showing all verified information for the teacher'),
        results: z.record(z.any()).describe('the results of the search')
      })
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
  
  if (!registry || !registry.found) {
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
  
  // Check first name match
  const firstNameMatch = input.firstName
    ? registry.firstName?.toLowerCase() === input.firstName.toLowerCase() ||
      registry.name?.split(' ')[0]?.toLowerCase() === input.firstName.toLowerCase()
    : true; // If no first name provided, assume match
  
  // Check last name match
  const lastNameMatch = input.lastName
    ? registry.lastName?.toLowerCase() === input.lastName.toLowerCase() ||
      registry.name?.split(' ').slice(-1)[0]?.toLowerCase() === input.lastName.toLowerCase()
    : true; // If no last name provided, assume match
  
  const nameMatch = firstNameMatch && lastNameMatch;
  
  // Check DOB match
  const dobMatch = input.dateOfBirth
    ? registry.dateOfBirth === input.dateOfBirth
    : true; // If no DOB provided, assume match
  
  // Check employment status
  const employmentStatus = registry.employmentStatus || 'unknown';
  const isActive = employmentStatus === 'active' || employmentStatus === 'employed';
  
  return {
    verified: nameMatch && dobMatch && isActive,
    registryMatch: {
      found: true,
      nameMatch,
      dobMatch,
      employmentStatus,
      details: registry,
    },
  };
}

