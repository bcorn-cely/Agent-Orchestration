// lib/workflows/renewals/hooks.ts
import { defineHook } from "workflow";
import { z } from "zod";

// Type-safe human approval payload; automatically validated.
export const brokerApprovalHook = defineHook({
  schema: z.object({
    approved: z.boolean(),
    comment: z.string().optional(),
    by: z.string().email().optional(),
  }),
});
