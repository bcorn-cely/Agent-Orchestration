// lib/workflows/events.ts
import { getWritable } from "workflow";

const enc = new TextEncoder();

/**
 * Emit a machine-readable JSONL line from a workflow.
 * NOTE: getWritable() takes no args; "namespace" is just a field in the JSON.
 */
export async function emitEvent(params: {
  namespace: string;  // e.g. "AI" or "Renewal"
  step: string;        // e.g. "UserNotification" or "Progress"
  message: string;
  data?: unknown;
}) {
  'use step'
  const { namespace, step, message, data } = params;
  const ts = new Date().toISOString();
  const writable = getWritable(); // <- no options
  const writer = writable.getWriter();
  const line = JSON.stringify({ ts, namespace, step, message, data }) + "\n";
  await writer.write(enc.encode(line));
  writer.releaseLock();
  // Don't close the stream; many events may follow
  return { ts };
}

/** Convenience wrapper for user-facing chat notices. */
export async function aiTell(message: string, data?: unknown) {
  'use step'
  return emitEvent({
    namespace: "AI",
    step: "UserNotification",
    message,
    data,
  });
}

