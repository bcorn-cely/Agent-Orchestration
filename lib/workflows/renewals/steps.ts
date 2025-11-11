// workflows/renewal.ts
import { sleep, createWebhook, FatalError, RetryableError } from 'workflow';

export type RenewalInput = {
  accountId: string;
  effectiveDate: string; // ISO
  sovFileId: string;
  state: string;
  brokerEmail: string;
  carriers: string[]; // e.g., ["Acme","Bravo"]
};

export type RenewalResult = {
  accountId: string;
  quotes: Array<{ carrier: string; premium: number; terms: string }>;
  compliance: { ok: boolean; reasons?: string[] };
  summaryUrl: string;
};

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const DOCSVC = process.env.DOCSVC ?? `${BASE}/api/mocks`;
const LOSS   = process.env.LOSS   ?? `${BASE}/api/mocks`;
const QUOTE  = process.env.QUOTE  ?? `${BASE}/api/mocks`;
const SUMMARY= process.env.SUMMARY?? `${BASE}/api/mocks`;
const NOTIFY = process.env.NOTIFY ?? `${BASE}/api/mocks`;

// export async function renewalWorkflow(input: RenewalInput): Promise<RenewalResult> {
//   "use workflow";

//   const writable = getWritable();
//   await writeProgress(writable, `Starting renewal for ${input.accountId}`);

//   const sov = await extractSoV(input.sovFileId);
//   await writeProgress(writable, `Parsed SoV rows: ${sov?.rows ?? 0}`);

//   const loss = await getLossTrends(input.accountId);
//   await writeProgress(writable, `Loaded loss trends for ${input.accountId}`);

//   const quotes = await Promise.all(input.carriers.map((c) => quoteCarrier(c, sov, loss)));
//   await writeProgress(writable, `Received ${quotes.length} carrier quotes`);

//   const compliance = await complianceCheck({ quotes, state: input.state });
//   if (!compliance.ok) throw new FatalError(`Compliance failed: ${(compliance.reasons ?? []).join(', ')}`);

//   await writeProgress(writable, `Awaiting broker approval…`);
//   const approval = await waitForBrokerApproval(input.brokerEmail);
//   if (!approval.approved) throw new FatalError('Broker rejected the recommendation');

//   const summaryUrl = await compileMarketSummary({
//     accountId: input.accountId,
//     quotes,
//     notes: approval.comment,
//   });
//   await writeProgress(writable, `Market summary ready: ${summaryUrl}`);

//   await writeProgress(writable, 'Renewal complete');
//   return { accountId: input.accountId, quotes, compliance, summaryUrl };
// }

/** ---------- Durable steps ---------- */

async function extractSoV(fileId: string) {
  "use step";
  const res = await fetch(`${DOCSVC}/sov/${fileId}`);
  if (!res.ok) throw new Error(`extractSoV failed: ${res.status}`);
  return res.json();
}
(extractSoV as any).maxRetries = 3;

async function getLossTrends(accountId: string) {
  "use step";
  const res = await fetch(`${LOSS}/losses/${accountId}`);
  if (!res.ok) throw new Error(`loss trends failed: ${res.status}`);
  return res.json();
}

async function quoteCarrier(carrier: string, sov: any, loss: any) {
  "use step";
  const res = await fetch(`${QUOTE}/quote/carrier/${carrier}`, {
    method: 'POST',
    body: JSON.stringify({ sov, loss }),
    headers: { 'content-type': 'application/json' },
  });

  if (res.status === 429) throw new RetryableError('Rate limited', { retryAfter: '45s' });
  if (res.status >= 500)  throw new Error(`carrier ${carrier} transient error`);
  if (res.status === 404) throw new FatalError(`carrier ${carrier} unsupported product`);

  return res.json();
}
(quoteCarrier as any).maxRetries = 5;

async function complianceCheck(input: { quotes: any[]; state: string }) {
  "use step";
  const ok = input.quotes.length > 0;
  return ok ? { ok: true } : { ok: false, reasons: ['No bindable quotes'] };
}

async function compileMarketSummary(payload: any) {
  "use step";
  const res = await fetch(`${SUMMARY}/summary/compile`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
  });
  if (!res.ok) throw new Error('summary failed');
  const { url } = await res.json();
  return url as string;
}

/** ---------- Human-in-the-loop via webhook ---------- */

async function waitForBrokerApproval(brokerEmail: string) {
  "use workflow";
  const webhook = createWebhook({ respondWith: Response.json({ received: true }) });
  await sendApprovalRequest(brokerEmail, webhook.url);
  const request = await webhook; // resumes on incoming POST
  const data = await request.json();
  return data as { approved: boolean; comment?: string };
}

async function sendApprovalRequest(email: string, url: string) {
  "use step";
  await fetch(`${NOTIFY}/notify/email`, {
    method: 'POST',
    body: JSON.stringify({ to: email, subject: 'Approve Renewal Plan', url }),
    headers: { 'content-type': 'application/json' },
  });
}
