export async function POST(req: Request) {
  const body = await req.json();
  const { itemDescription, quantity, preferredSupplier } = body;
  
  // Simulate supplier search results
  const allSuppliers = [
    {
      supplierId: 'supp-001',
      name: 'Office Supply Pro',
      price: 150,
      deliveryDays: 5,
      rating: 4.8,
      contractExists: true,
    },
    {
      supplierId: 'supp-002',
      name: 'Global Office Solutions',
      price: 145,
      deliveryDays: 7,
      rating: 4.6,
      contractExists: true,
    },
    {
      supplierId: 'supp-003',
      name: 'QuickShip Supplies',
      price: 160,
      deliveryDays: 3,
      rating: 4.7,
      contractExists: false,
    },
    {
      supplierId: 'supp-004',
      name: 'Premium Office Co',
      price: 175,
      deliveryDays: 10,
      rating: 4.9,
      contractExists: true,
    },
    {
      supplierId: 'supp-005',
      name: 'Budget Office Warehouse',
      price: 135,
      deliveryDays: 14,
      rating: 4.4,
      contractExists: false,
    },
  ];
  
  // If preferred supplier is specified, prioritize it
  let suppliers = [...allSuppliers];
  if (preferredSupplier) {
    const preferred = suppliers.find(s => 
      s.name.toLowerCase().includes(preferredSupplier.toLowerCase()) ||
      s.supplierId === preferredSupplier
    );
    if (preferred) {
      suppliers = [preferred, ...suppliers.filter(s => s.supplierId !== preferred.supplierId)];
    }
  }
  
  // Sort by: contract exists first, then by price
  suppliers.sort((a, b) => {
    if (a.contractExists !== b.contractExists) {
      return a.contractExists ? -1 : 1;
    }
    return a.price - b.price;
  });
  
  // Return top 5 suppliers
  const results = suppliers.slice(0, 5);
  
  // Simulate delay
  await new Promise((r) => setTimeout(r, 300));
  
  return Response.json(results);
}

