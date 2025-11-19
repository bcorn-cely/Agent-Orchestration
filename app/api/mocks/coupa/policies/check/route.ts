export async function POST(req: Request) {
  const body = await req.json();
  const { itemDescription, estimatedCost, department, budgetCode } = body;
  
  // Simulate policy compliance check
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Check for high-value items requiring approval
  if (estimatedCost && estimatedCost > 10000) {
    warnings.push('High-value purchase requires manager approval');
  }
  
  // Check for restricted items
  const restrictedItems = ['alcohol', 'weapon', 'firearm'];
  const descriptionLower = itemDescription.toLowerCase();
  if (restrictedItems.some(item => descriptionLower.includes(item))) {
    violations.push('Item is restricted by company policy');
  }
  
  // Check department-specific restrictions
  if (department === 'IT' && descriptionLower.includes('software') && !budgetCode) {
    warnings.push('Software purchases require budget code');
  }
  
  // Simulate delay
  await new Promise((r) => setTimeout(r, 300));
  
  return Response.json({
    ok: violations.length === 0,
    violations: violations.length > 0 ? violations : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}

