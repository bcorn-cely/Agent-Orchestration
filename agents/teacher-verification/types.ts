/**
 * Teacher Verification Types
 * 
 * Type definitions for teacher verification agent.
 */

/**
 * Input type for teacher verification
 */
export type TeacherVerificationInput = {
  memberId?: string;
  memberName?: string;
  dateOfBirth?: string;
  state: string;
  msrId: string;
};

/**
 * Result type returned from teacher verification
 */
export type TeacherVerificationResult = {
  verificationId: string;
  memberId?: string;
  memberName?: string;
  state: string;
  verified: boolean;
  registryMatch: {
    found: boolean;
    nameMatch: boolean;
    dobMatch: boolean;
    employmentStatus: string;
    details: any;
  };
  error?: string;
};

