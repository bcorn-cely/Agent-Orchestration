// workflows/renewal.ts
import { FatalError, RetryableError } from 'workflow';
import { aiTell } from '../events';


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


/** ---------- Durable steps ---------- */

export async function extractSoV(fileId: string) {
  "use step";
  const res = await fetch(`${DOCSVC}/sov/${fileId}`);
  if (!res.ok) throw new Error(`extractSoV failed: ${res.status}`);
  return res.json();
}
(extractSoV as any).maxRetries = 3;

export async function getLossTrends(accountId: string) {
  "use step";
  const res = await fetch(`${LOSS}/losses/${accountId}`);
  if (!res.ok) throw new Error(`loss trends failed: ${res.status}`);
  return res.json();
}

export async function quoteCarrier(carrier: string, sov: any, loss: any) {
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

export async function complianceCheck(input: { quotes: any[]; state: string }) {
  "use step";
  const ok = input.quotes.length > 0;
  return ok ? { ok: true } : { ok: false, reasons: ['No bindable quotes'] };
}

export async function compileMarketSummary(payload: any) {
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

/** ---------- Human-in-the-loop via typed hook ---------- */

/**
 * Step function that sends approval request email and emits notification.
 * Hook creation/awaiting happens in the workflow, not here.
 */
export async function sendBrokerApprovalRequest(token: string, brokerEmail: string) {
  "use step";
  
  const approvalUrl = `${BASE}/renewals/approve?token=${encodeURIComponent(token)}`;

  // Send the email
  await sendApprovalRequest(brokerEmail, approvalUrl);

  // Stream a chat notice
  await aiTell(
    `I've emailed ${brokerEmail} a secure approval link. Please check your inbox to continue.`,
    { token, approvalUrl, brokerEmail }
  );
}

export async function sendApprovalRequest(email: string, url: string) {
  "use step";
  await fetch(`${NOTIFY}/notify/email`, {
    method: 'POST',
    body: JSON.stringify({ to: email, subject: 'Approve Renewal Plan', url }),
    headers: { 'content-type': 'application/json' },
  });
}
