/**
 * Teacher Verification Agent
 * 
 * Main entry point for teacher verification functionality.
 * Verifies teacher community membership via database lookup.
 * 
 * Implements the verification flow:
 * 1. Copy member ID (or First Name + Last Name + DOB)
 * 2. Query state registry database
 * 3. Validate member details and employment
 * 4. Return verification result
 * 
 * Key Features:
 * - State-specific registry lookup
 * - Member validation (name, DOB, employment)
 * - Immediate result return
 */

import {
  copyMemberIdentifier,
  queryStateRegistry,
  validateMemberDetails,
} from './operations';
import type { TeacherVerificationInput, TeacherVerificationResult } from './types';

/**
 * Main Teacher Verification Function
 * 
 * @param input - Member details and state
 * @returns Verification result
 */
export async function teacherVerification(input: TeacherVerificationInput): Promise<TeacherVerificationResult> {
  const startTime = Date.now();
  const verificationId = `teacher-verification:${input.msrId}:${Date.now()}`;
  
  console.log(`[Teacher Verification] Started`, {
    verificationId,
    memberId: input.memberId,
    state: input.state,
    msrId: input.msrId,
  });
  
  // ========== Step 1: Copy Member Identifier ==========
  // Extract member ID or First Name + Last Name + DOB from input
  const identifier = await copyMemberIdentifier({
    memberId: input.memberId,
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth,
  });
  
  console.log(`[Teacher Verification] Identifier copied`, {
    verificationId,
    hasMemberId: !!identifier.memberId,
    hasFirstName: !!identifier.firstName,
    hasLastName: !!identifier.lastName,
  });
  
  // ========== Step 2: Query State Registry ==========
  // Query the state-specific teacher registry database
  const registryResult = await queryStateRegistry({
    memberId: identifier.memberId,
    firstName: identifier.firstName,
    lastName: identifier.lastName,
    dateOfBirth: identifier.dateOfBirth,
    state: input.state,
  });
  
  console.log(`[Teacher Verification] Registry queried`, {
    verificationId,
    found: registryResult || false,
  });
  
  // ========== Step 3: Validate Member Details ==========
  // Validate that registry match is correct
  const validation = await validateMemberDetails({
    memberId: identifier.memberId,
    firstName: identifier.firstName,
    lastName: identifier.lastName,
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
  
  // ========== Step 4: Return Result ==========
  // Return verification result immediately
  const totalLatency = Date.now() - startTime;
  
  console.log(`[Teacher Verification] Complete`, {
    verificationId,
    verified: validation.verified,
    totalLatency,
  });
  
  return {
    verificationId,
    memberId: identifier.memberId,
    firstName: identifier.firstName,
    lastName: identifier.lastName,
    state: input.state,
    verified: validation.verified,
    registryMatch: validation.registryMatch,
  };
}

