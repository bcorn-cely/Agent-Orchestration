/**
 * Mock Sector Information API
 * 
 * Returns mock sector/industry information for organization validation.
 */

export async function POST(req: Request) {
  const { domain } = await req.json();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Extract organization name from domain
  const orgName = domain.split('.')[0];
  const capitalizedName = orgName.charAt(0).toUpperCase() + orgName.slice(1);
  
  // Mock sector data based on domain
  const mockData: Record<string, any> = {
    'reebok.com': {
      sector: 'Consumer Goods',
      industry: 'Athletic Footwear and Apparel',
      organizationName: 'Reebok International Limited',
      naicsCode: '316210',
    },
    'nike.com': {
      sector: 'Consumer Goods',
      industry: 'Athletic Footwear and Apparel',
      organizationName: 'Nike, Inc.',
      naicsCode: '316210',
    },
  };
  
  const result = mockData[domain] || {
    sector: 'Technology',
    industry: 'Software and Services',
    organizationName: `${capitalizedName} Corporation`,
    naicsCode: '541511',
  };
  
  return Response.json(result);
}

