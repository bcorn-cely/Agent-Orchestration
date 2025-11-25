/**
 * Mock Trust Information API
 * 
 * Returns mock trust/confidence information for organization validation.
 */

export async function POST(req: Request) {
  const { domain } = await req.json();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock trust data based on domain
  const mockData: Record<string, any> = {
    'reebok.com': {
      confidence: 0.92,
      score: 0.92,
      sources: ['WHOIS Database', 'Business Registry', 'Industry Reports'],
      indicators: ['Long-established domain', 'Verified business registration', 'Active industry presence'],
    },
    'nike.com': {
      confidence: 0.95,
      score: 0.95,
      sources: ['WHOIS Database', 'SEC Filings', 'Business Registry'],
      indicators: ['Publicly traded company', 'Verified business registration', 'Strong brand presence'],
    },
  };
  
  const result = mockData[domain] || {
    confidence: 0.75,
    score: 0.75,
    sources: ['WHOIS Database', 'Business Registry'],
    indicators: ['Domain registered', 'Business entity found'],
  };
  
  return Response.json(result);
}

