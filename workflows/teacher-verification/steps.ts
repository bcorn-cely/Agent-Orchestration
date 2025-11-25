/**
 * Teacher Verification Workflow Steps
 * 
 * This file defines all durable steps used in the teacher verification workflow.
 * Implements the 4-step support flow: copy ID → query registry → validate → approve
 * 
 * Workflow Flow Overview:
 * 1. Copy member ID (or Name + DOB)
 * 2. Query state registry database
 * 3. Validate member details and employment
 * 4. Approval gate (MSR approval required)
 * 5. Final decision
 */

import { FatalError, fetch } from 'workflow';

/**
 * Input type for teacher verification workflow
 */
export type TeacherVerificationInput = {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
  state: string;
  msrId: string;
};

/**
 * Result type returned from the teacher verification workflow
 */
export type TeacherVerificationResult = {
  verificationId: string;
  memberId?: string;
  memberName?: string;
  state: string;
  verified: boolean;
  approved: boolean;
  registryMatch: {
    found: boolean;
    nameMatch: boolean;
    dobMatch: boolean;
    employmentStatus: string;
    details: any;
  };
  approval?: {
    approved: boolean;
    approvedBy?: string;
    comment?: string;
    timestamp?: string;
  };
  error?: string;
};

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const REGISTRY_API = process.env.TEACHER_REGISTRY_API ?? `${BASE}/api/mocks/teacher-verification/registry`;
const NOTIFY = process.env.NOTIFY ?? `${BASE}/api/mocks/notify`;

/**
 * Step 1: Copy Member Identifier
 * 
 * Extracts member ID (or Name + DOB) from input.
 * In real implementation, this would copy from support tool UI.
 */
export async function copyMemberIdentifier(input: {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
}) {
  "use step";
  
  // Validate that we have either memberId or (memberName + dateOfBirth)
  if (!input.memberId && (!input.memberName || !input.dateOfBirth)) {
    throw new FatalError('Either memberId or (memberName + dateOfBirth) is required');
  }
  
  return {
    memberId: input.memberId,
    memberName: input.memberName,
    dateOfBirth: input.dateOfBirth,
  };
}
copyMemberIdentifier.maxRetries = 1;

/**
 * Step 2: Query State Registry
 * 
 * Queries the state teacher registry database to find member.
 */
export async function queryStateRegistry(input: {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
  state: string;
}) {
  "use step";
  
  const res = await fetch(`${REGISTRY_API}/${input.state}`, {
    method: 'POST',
    body: JSON.stringify({
      memberId: input.memberId,
      memberName: input.memberName,
      dateOfBirth: input.dateOfBirth,
    }),
    headers: { 'content-type': 'application/json' },
  });
  
  if (!res.ok) {
    throw new FatalError(`State registry query failed: ${res.status}`);
  }
  
  return res.json();
}
queryStateRegistry.maxRetries = 3;

/**
 * Step 3: Validate Member Details
 * 
 * Validates that the registry match is correct (name, DOB, employment status).
 */
export async function validateMemberDetails(input: {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
  registryResult: any;
}) {
  "use step";
  
  const registry = input.registryResult;
  
  if (!registry || !registry.found) {
    return {
      verified: false,
      registryMatch: {
        found: false,
        nameMatch: false,
        dobMatch: false,
        employmentStatus: 'unknown',
        details: null,
      },
    };
  }
  
  // Check name match
  const nameMatch = input.memberName
    ? registry.name?.toLowerCase() === input.memberName.toLowerCase()
    : true; // If no name provided, assume match
  
  // Check DOB match
  const dobMatch = input.dateOfBirth
    ? registry.dateOfBirth === input.dateOfBirth
    : true; // If no DOB provided, assume match
  
  // Check employment status
  const employmentStatus = registry.employmentStatus || 'unknown';
  const isActive = employmentStatus === 'active' || employmentStatus === 'employed';
  
  return {
    verified: nameMatch && dobMatch && isActive,
    registryMatch: {
      found: true,
      nameMatch,
      dobMatch,
      employmentStatus,
      details: registry,
    },
  };
}
validateMemberDetails.maxRetries = 1;

/**
 * Step 4: Send Approval Request
 * 
 * Sends approval request to MSR for teacher verification.
 */
export async function sendApprovalRequest(
  token: string,
  msrEmail: string,
  role: string,
  requestDetails: any
) {
  "use step";
  
  const approvalUrl = `${BASE}/teacher-approve?token=${encodeURIComponent(token)}`;
  
  await sendApprovalEmail(msrEmail, approvalUrl, role, requestDetails);
}

/**
 * Helper Step: Send Approval Email
 */
export async function sendApprovalEmail(
  email: string,
  url: string,
  role: string,
  details: any
) {
  const emailBody = `Teacher Verification Approval Required - ${role}

Verification ID: ${details.verificationId || 'N/A'}
Member ID: ${details.memberId || 'N/A'}
Member Name: ${details.memberName || 'N/A'}
State: ${details.state || 'N/A'}

=== REGISTRY MATCH DETAILS ===
Found: ${details.registryMatch?.found ? 'Yes' : 'No'}
Name Match: ${details.registryMatch?.nameMatch ? 'Yes' : 'No'}
DOB Match: ${details.registryMatch?.dobMatch ? 'Yes' : 'No'}
Employment Status: ${details.registryMatch?.employmentStatus || 'Unknown'}

${details.registryMatch?.details ? `Registry Details:
${JSON.stringify(details.registryMatch.details, null, 2)}` : ''}

Please review the verification details above and approve or reject.

Approval URL: ${url}`;

  await fetch(`${NOTIFY}/email`, {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      subject: `Teacher Verification Approval Required - ${details.verificationId || ''}`,
      body: emailBody,
      url,
      details: { ...details, role },
    }),
    headers: { 'content-type': 'application/json' },
  });
}
