/**
 * Teacher Verification Workflow
 * 
 * This workflow verifies teacher community membership via database lookup.
 * Implements the 4-step support flow:
 * 1. Copy member ID (or Name + DOB)
 * 2. Open state registry lookup website
 * 3. Find member in registry and confirm details
 * 4. Approve community verification in Support tool
 * 
 * Key Features:
 * - State-specific registry lookup
 * - Member validation (name, DOB, employment)
 * - MSR approval gate (human-in-the-loop)
 * - Final decision after approval
 */

import { sleep, FatalError } from 'workflow';
import {
  copyMemberIdentifier,
  queryStateRegistry,
  validateMemberDetails,
  TeacherVerificationInput,
  TeacherVerificationResult,
} from './steps';
import { teacherVerificationApprovalHook } from './hooks';
import { sendApprovalRequest } from './steps';

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';

/**
 * Main Teacher Verification Workflow Function
 * 
 * @param input - Member details and state
 * @returns Verification result with approval status
 */
export async function teacherVerification(input: TeacherVerificationInput): Promise<TeacherVerificationResult> {
  'use workflow'
  
  const startTime = Date.now();
  const verificationId = `teacher-verification:${input.msrId}:${Date.now()}`;
  
  console.log(`[Teacher Verification] Started`, {
    verificationId,
    memberId: input.memberId,
    state: input.state,
    msrId: input.msrId,
  });
  
  // ========== Step 1: Copy Member Identifier ==========
  // Extract member ID or Name + DOB from input
  const identifier = await copyMemberIdentifier({
    memberId: input.memberId,
    memberName: input.memberName,
    dateOfBirth: input.dateOfBirth,
  });
  
  console.log(`[Teacher Verification] Identifier copied`, {
    verificationId,
    hasMemberId: !!identifier.memberId,
    hasName: !!identifier.memberName,
  });
  
  // ========== Step 2: Query State Registry ==========
  // Query the state-specific teacher registry database
  const registryResult = await queryStateRegistry({
    memberId: identifier.memberId,
    memberName: identifier.memberName,
    dateOfBirth: identifier.dateOfBirth,
    state: input.state,
  });
  
  console.log(`[Teacher Verification] Registry queried`, {
    verificationId,
    found: registryResult?.found || false,
  });
  
  // ========== Step 3: Validate Member Details ==========
  // Validate that registry match is correct
  const validation = await validateMemberDetails({
    memberId: identifier.memberId,
    memberName: identifier.memberName,
    dateOfBirth: identifier.dateOfBirth,
    registryResult,
  });
  
  console.log(`[Teacher Verification] Member validated`, {
    verificationId,
    verified: validation.verified,
    nameMatch: validation.registryMatch.nameMatch,
    dobMatch: validation.registryMatch.dobMatch,
    employmentStatus: validation.registryMatch.employmentStatus,
  });
  
  // ========== Step 4: Approval Gate ==========
  // MSR must approve the verification before finalizing
  const approvalToken = `${verificationId}:approval`;
  const approval = teacherVerificationApprovalHook.create({ token: approvalToken });
  
  await sendApprovalRequest(
    approvalToken,
    `msr-${input.msrId}@example.com`,
    'teacher_verification',
    {
      verificationId,
      memberId: identifier.memberId,
      memberName: identifier.memberName,
      state: input.state,
      registryMatch: validation.registryMatch,
      validationResult: validation,
    }
  );
  
  const approvalTimeout = '1h';
  const approvalDecision = await Promise.race([
    approval,
    (async () => {
      await sleep(approvalTimeout);
      return { approved: false, comment: 'Approval timeout' };
    })(),
  ]);
  
  if (!approvalDecision.approved) {
    return {
      verificationId,
      memberId: identifier.memberId,
      memberName: identifier.memberName,
      state: input.state,
      verified: validation.verified,
      approved: false,
      registryMatch: validation.registryMatch,
      approval: approvalDecision,
      error: 'Verification not approved by MSR',
    };
  }
  
  const totalLatency = Date.now() - startTime;
  
  console.log(`[Teacher Verification] Complete`, {
    verificationId,
    verified: validation.verified,
    approved: approvalDecision.approved,
    totalLatency,
  });
  
  return {
    verificationId,
    memberId: identifier.memberId,
    memberName: identifier.memberName,
    state: input.state,
    verified: validation.verified,
    approved: true,
    registryMatch: validation.registryMatch,
    approval: approvalDecision,
  };
}

