/**
 * Teacher Verification Workflow Hooks
 * 
 * Hooks are used to pause workflow execution and wait for human (MSR) input.
 */

import { defineHook } from "workflow";
import { z } from "zod";

/**
 * Teacher Verification Approval Hook
 * 
 * Used when MSR needs to approve a teacher verification before it can proceed.
 * This is a REQUIRED checkpoint for all verifications.
 */
export const teacherVerificationApprovalHook = defineHook({
  schema: z.object({
    approved: z.boolean(),
    comment: z.string().optional(),
    by: z.string().email().optional(),
  }),
});

