/**
 * Web Search API Route
 * 
 * API endpoint to trigger web search using OpenAI's webSearch tool.
 */

import { performWebSearch } from '@/lib/web-search-agent';

/**
 * POST Handler for Web Search
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      return Response.json(
        { ok: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    console.log('[Web Search API] Starting search', { query });
    
    const result = await performWebSearch(query);
    console.log('result ', result);
    return Response.json({
      ok: true,
      query,
      result,
    });
  } catch (error) {
    console.error('[Web Search API] Error', error);
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

