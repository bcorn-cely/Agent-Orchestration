export async function POST(req: Request) {
  const body = await req.json();
  const { supplierId, itemDescription, quantity, unitPrice, totalAmount, department, budgetCode, requestId } = body;
  
  // Generate a mock PO number
  const poNumber = `PO-2024-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`;
  
  // Calculate estimated delivery (7-14 days from now)
  const deliveryDays = 7 + Math.floor(Math.random() * 7);
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);
  
  // Simulate delay
  await new Promise((r) => setTimeout(r, 300));
  
  return Response.json({
    poNumber,
    supplierId,
    itemDescription,
    quantity,
    unitPrice,
    totalAmount,
    department,
    budgetCode,
    requestId,
    status: 'created',
    estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  });
}

