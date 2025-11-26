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
    const { memberId, firstName, lastName, dateOfBirth, state, msrId } = body;
    
    if (!state || !msrId) {
      return Response.json(
        { ok: false, error: 'State and MSR ID are required' },
        { status: 400 }
      );
    }
    
    if (!memberId && (!firstName || !lastName || !dateOfBirth)) {
      return Response.json(
        { ok: false, error: 'Either memberId or (firstName + lastName + dateOfBirth) is required' },
        { status: 400 }
      );
    }
    
    console.log('[Teacher Verification API] Starting verification', {
      memberId,
      firstName,
      lastName,
      state,
      msrId,
    });
    
    const input: TeacherVerificationInput = {
      memberId,
      firstName,
      lastName,
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

