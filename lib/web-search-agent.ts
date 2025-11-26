/**
 * Web Search Agent
 * 
 * A simple ToolLoopAgent that uses OpenAI's webSearch tool to search the internet.
 */

import { ToolLoopAgent } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * Create a web search agent
 * 
 * Returns a ToolLoopAgent configured with OpenAI's webSearch tool.
 */
export function createWebSearchAgent() {
  // web search only works if we use that specific provider for our models, in this case openai
  const agent = new ToolLoopAgent({
    model: 'openai/gpt-4o-mini',
    instructions: `You are a helpful assistant that can search the internet for information. 
When the user asks you to search for something, use the webSearch tool to find relevant information and provide a comprehensive answer based on the search results.`,
    tools: {
      web_search: openai.tools.webSearch() as any,
    },
  });

  return agent;
}

/**
 * Perform a web search
 * 
 * @param query - The search query
 * @returns The agent's response with search results
 */
export async function performWebSearch(query: string) {
  const agent = createWebSearchAgent();
  
  const result = await agent.generate({
    prompt: `Search the internet for: ${query}`,
  });

  return {
    text: result.text,
    toolCalls: result.toolCalls,
    toolResults: result.toolResults,
    usage: result.usage,
    finishReason: result.finishReason,
  };
}

