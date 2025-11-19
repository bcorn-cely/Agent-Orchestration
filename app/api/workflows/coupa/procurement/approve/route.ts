// app/api/workflows/coupa/procurement/approve/route.ts
import { RequestWithResponse } from 'workflow';
import { procurementApprovalHook } from "@/workflows/coupa/hooks";

export async function POST(req: RequestWithResponse) {
  const { token: rawToken, approved, comment, by, alternativeSupplierId } = await req.json();
  if (typeof rawToken !== "string" || typeof approved !== "boolean") {
    return new Response("Bad Request", { status: 400 });
  }
  
  // Clean the token - remove any trailing quotes or whitespace that might have been introduced during URL encoding/decoding
  const token = rawToken.replace(/['"]+$/, '').trim();
  
  try {    
    return req.respondWith(Response.json(
      { approved, comment, by, alternativeSupplierId },
      { status: 200 }
    ))
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

