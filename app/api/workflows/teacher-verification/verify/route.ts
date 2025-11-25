/**
 * Teacher Verification API Route
 * 
 * API endpoint to trigger teacher verification workflow.
 */

import { RequestWithResponse } from 'workflow';
import { start } from 'workflow/api';
import { teacherVerification } from '@/workflows/teacher-verification/workflow';
import { TeacherVerificationInput } from '@/workflows/teacher-verification/steps';

/**
 * POST Handler for Teacher Verification
 */
export async function POST(req: RequestWithResponse) {
  try {
    const body = await req.json();
    const { memberId, memberName, dateOfBirth, state, msrId } = body;
    
    if (!state || !msrId) {
      return Response.json(
        { ok: false, error: 'State and MSR ID are required' },
        { status: 400 }
      );
    }
    
    if (!memberId && (!memberName || !dateOfBirth)) {
      return Response.json(
        { ok: false, error: 'Either memberId or (memberName + dateOfBirth) is required' },
        { status: 400 }
      );
    }
    
    console.log('[Teacher Verification API] Starting verification', {
      memberId,
      state,
      msrId,
    });
    
    const input: TeacherVerificationInput = {
      memberId,
      memberName,
      dateOfBirth,
      state,
      msrId,
    };
    
    const run = await start(teacherVerification, [input]);
    
    return Response.json({
      ok: true,
      runId: run.runId,
      memberId,
    });
  } catch (error) {
    console.error('[Teacher Verification API] Error', error);
    return Response.json(
      {
        ok: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

