// app/api/workflows/greenlight/campaigns/approve/route.ts
import { RequestWithResponse } from 'workflow';
import { campaignApprovalHook } from "@/workflows/greenlight/hooks";

export async function POST(req: RequestWithResponse) {
  const { token: rawToken, approved, comment, by, budgetAdjustment, alternativeChannels } = await req.json();
  if (typeof rawToken !== "string" || typeof approved !== "boolean") {
    return new Response("Bad Request", { status: 400 });
  }
  
  // Clean the token - remove any trailing quotes or whitespace that might have been introduced during URL encoding/decoding
  const token = rawToken.replace(/['"]+$/, '').trim();
  
  try {    
    console.log('raw token ', rawToken);
    console.log('token ', token);
    const result = await campaignApprovalHook.resume(rawToken, { approved, comment, by, budgetAdjustment, alternativeChannels });
    console.log('campaign approval hook result ', result);
    return Response.json({ ok: true, runId: result?.runId });
  
  } catch (error) {
    return req.respondWith(Response.json(
      { 
        ok: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        token 
      },
      { status: 500 }
    ))
  }
}

