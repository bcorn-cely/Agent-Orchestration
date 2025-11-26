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
  firstName?: string;
  lastName?: string;
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
  firstName?: string;
  lastName?: string;
  state: string;
  verified: boolean;
  registryMatch: {
    [key: string]: any;
  };
  error?: string;
};

