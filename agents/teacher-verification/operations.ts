/**
 * Teacher Verification Operations
 * 
 * Helper functions for teacher verification operations.
 * Implements the verification flow: copy ID → query registry → validate
 */

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const REGISTRY_API = process.env.TEACHER_REGISTRY_API ?? `${BASE}/api/mocks/teacher-verification/registry`;

/**
 * Copy Member Identifier
 * 
 * Extracts member ID (or Name + DOB) from input.
 * In real implementation, this would copy from support tool UI.
 */
export async function copyMemberIdentifier(input: {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
}) {
  // Validate that we have either memberId or (memberName + dateOfBirth)
  if (!input.memberId && (!input.memberName || !input.dateOfBirth)) {
    throw new Error('Either memberId or (memberName + dateOfBirth) is required');
  }
  
  return {
    memberId: input.memberId,
    memberName: input.memberName,
    dateOfBirth: input.dateOfBirth,
  };
}

/**
 * Query State Registry
 * 
 * Queries the state teacher registry database to find member.
 */
export async function queryStateRegistry(input: {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
  state: string;
}) {
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
    throw new Error(`State registry query failed: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Validate Member Details
 * 
 * Validates that the registry match is correct (name, DOB, employment status).
 */
export async function validateMemberDetails(input: {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
  registryResult: any;
}) {
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

