// app/api/workflows/renewal/approve/route.ts
import { brokerApprovalHook } from "@/lib/workflows/renewals/hooks";

export async function POST(req: Request) {
  const { token, approved, comment, by } = await req.json();
  if (typeof token !== "string" || typeof approved !== "boolean") {
    return new Response("Bad Request", { status: 400 });
  }
  const result = await brokerApprovalHook.resume(token, { approved, comment, by });
  return result ? Response.json({ ok: true, runId: result.runId })
                : new Response("Not found", { status: 404 });
}

