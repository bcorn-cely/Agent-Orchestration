export async function POST(req: Request) {
  const body = await req.json();
  const { department, budgetCode, amount } = body;
  
  // Simulate budget availability check
  // Mock budget limits by department
  const departmentBudgets: Record<string, number> = {
    'IT': 50000,
    'Facilities': 30000,
    'Marketing': 25000,
    'HR': 20000,
    'Finance': 15000,
  };
  
  const departmentBudget = departmentBudgets[department] || 20000;
  const available = departmentBudget * 0.3; // Assume 30% remaining
  
  const availableAmount = available;
  const isAvailable = amount <= availableAmount;
  
  let warning: string | undefined;
  if (amount > availableAmount * 0.8) {
    warning = 'Budget is running low. Consider alternative options.';
  }
  
  // Simulate delay
  await new Promise((r) => setTimeout(r, 300));
  
  return Response.json({
    available: isAvailable,
    availableAmount,
    totalBudget: departmentBudget,
    usedAmount: departmentBudget - availableAmount,
    reason: isAvailable ? undefined : 'Insufficient budget remaining',
    warning,
  });
}

