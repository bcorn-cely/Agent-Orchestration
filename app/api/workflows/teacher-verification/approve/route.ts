/**
 * Teacher Verification Approval API Route
 * 
 * API endpoint for MSR to approve teacher verifications.
 * This resumes the workflow hook that was paused waiting for approval.
 */

import { RequestWithResponse } from 'workflow';
import { teacherVerificationApprovalHook } from "@/workflows/teacher-verification/hooks";

/**
 * POST Handler for Teacher Verification Approval
 */
export async function POST(req: RequestWithResponse) {
  const { token: rawToken, approved, comment, by } = await req.json();
  if (typeof rawToken !== "string" || typeof approved !== "boolean") {
    return new Response("Bad Request", { status: 400 });
  }
  
  let token = rawToken;
  try {
    token = decodeURIComponent(rawToken);
  } catch {
    token = rawToken;
  }
  
  token = token.replace(/['",]+$/, '').trim();
  
  try {
    console.log('[Teacher Verification Approval] Processing approval', {
      token,
      approved,
      by,
    });
    
    const result = await teacherVerificationApprovalHook.resume(token, { approved, comment, by });
    console.log('[Teacher Verification Approval] Hook result', { result });
    
    if (!result) {
      return Response.json(
        {
          ok: false,
          error: 'Hook not found',
          message: 'The approval hook was not found. The workflow may not have reached the approval point yet, or it may have already timed out.',
          token,
        },
        { status: 404 }
      );
    }
    
    return Response.json({ ok: true, runId: result?.runId });
  } catch (error) {
    console.error('[Teacher Verification Approval] Error', error);
    return req.respondWith(Response.json(
      {
        ok: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        token,
      },
      { status: 500 }
    ));
  }
}

