/**
 * Teacher Verification API Route
 * 
 * API endpoint to trigger teacher verification workflow.
 */

import { teacherVerification } from '@/agents/teacher-verification';
import type { TeacherVerificationInput } from '@/agents/teacher-verification/types';

/**
 * POST Handler for Teacher Verification
 */
export async function POST(req: Request) {
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
    
    const result = await teacherVerification(input);
    
    return Response.json({
      ok: true,
      result,
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

