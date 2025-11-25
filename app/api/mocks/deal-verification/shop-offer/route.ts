/**
 * Mock Shop Offer API
 * 
 * Returns mock offer details from Shop.
 */

export async function POST(req: Request) {
  const { offerId, shopUrl } = await req.json();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock offer data
  const mockOffers: Record<string, any> = {
    'offer-123': {
      partnerUrl: 'https://example-partner.com',
      expectedDiscount: '20%',
      expectedPrice: 80,
      offerDescription: '20% off all items',
      validUntil: '2025-12-31',
    },
  };
  
  const result = mockOffers[offerId || 'default'] || {
    partnerUrl: shopUrl || 'https://example-partner.com',
    expectedDiscount: '15%',
    expectedPrice: 85,
    offerDescription: '15% off selected items',
    validUntil: '2025-12-31',
  };
  
  return Response.json(result);
}

