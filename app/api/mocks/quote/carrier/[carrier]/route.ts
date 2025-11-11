

function shouldFlake(carrier: string) {
  const target = (process.env.DEMO_FLAKY_CARRIER ?? '').toLowerCase();
  if (!target || target !== carrier.toLowerCase()) return false;
  return Math.random() < 0.5; // 50% rate-limit to demo retries
}

export async function POST(req: Request, { params }: { params: { carrier: string } }) {
  const carrier = params.carrier;
  if (shouldFlake(carrier)) {
    return new Response('rate limited', { status: 429 });
  }
  // slight delay for realism
  await new Promise(r => setTimeout(r, 300));
  return Response.json({
    carrier,
    premium: Math.round(100000 + Math.random() * 200000),
    terms: 'subject to inspection'
  });
}

