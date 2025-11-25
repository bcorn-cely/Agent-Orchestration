/**
 * Mock Legal Information API
 * 
 * Returns mock legal information for organization validation.
 */

export async function POST(req: Request) {
  const { domain } = await req.json();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Extract organization name from domain
  const orgName = domain.split('.')[0];
  const capitalizedName = orgName.charAt(0).toUpperCase() + orgName.slice(1);
  
  // Mock legal data based on domain
  const mockData: Record<string, any> = {
    'reebok.com': {
      legalName: 'Reebok International Limited',
      jurisdiction: 'United Kingdom',
      registrationNumber: 'UK-12345678',
      status: 'active',
    },
    'nike.com': {
      legalName: 'Nike, Inc.',
      jurisdiction: 'United States - Delaware',
      registrationNumber: 'DE-98765432',
      status: 'active',
    },
  };
  
  const result = mockData[domain] || {
    legalName: `${capitalizedName} Corporation`,
    jurisdiction: 'United States - Delaware',
    registrationNumber: `US-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    status: 'active',
  };
  
  return Response.json(result);
}

