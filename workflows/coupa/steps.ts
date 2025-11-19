// workflows/coupa/steps.ts
import { FatalError, RetryableError } from 'workflow';
import { UIMessageChunk } from 'ai';
import { aiTell } from '../events';

export type ProcurementRequestInput = {
  employeeId: string;
  itemDescription: string;
  quantity: number;
  estimatedCost?: number;
  department: string;
  budgetCode?: string;
  urgency: 'routine' | 'urgent' | 'critical';
  preferredSupplier?: string;
  justification?: string;
  requesterEmail: string;
};

export type ProcurementRequestResult = {
  requestId: string;
  compliance: { 
    ok: boolean; 
    violations?: string[];
    warnings?: string[];
  };
  suppliers: Array<{
    supplierId: string;
    name: string;
    price: number;
    deliveryDays: number;
    rating: number;
    contractExists: boolean;
  }>;
  approval?: {
    approved: boolean;
    approvedBy?: string;
    comment?: string;
  };
  purchaseOrder?: {
    poNumber: string;
    supplierId: string;
    totalAmount: number;
    estimatedDelivery: string;
  };
  poUrl?: string;
};

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const POLICY = process.env.POLICY ?? `${BASE}/api/mocks/coupa`;
const SUPPLIER = process.env.SUPPLIER ?? `${BASE}/api/mocks/coupa`;
const BUDGET = process.env.BUDGET ?? `${BASE}/api/mocks/coupa`;
const PO = process.env.PO ?? `${BASE}/api/mocks/coupa`;
const NOTIFY = process.env.NOTIFY ?? `${BASE}/api/mocks/notify`;

/** ---------- Durable steps ---------- */

export async function checkPolicyCompliance(input: {
  itemDescription: string;
  estimatedCost?: number;
  department: string;
  budgetCode?: string;
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${POLICY}/policies/check`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 404) throw new FatalError(`Policy service unavailable`);
  if (!res.ok) throw new Error(`checkPolicyCompliance failed: ${res.status}`);
  
  return res.json();
}
checkPolicyCompliance.maxRetries = 3;

export async function checkBudgetAvailability(input: {
  department: string;
  budgetCode?: string;
  amount: number;
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${BUDGET}/budgets/check`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 404) throw new FatalError(`Budget service unavailable`);
  if (!res.ok) throw new Error(`checkBudgetAvailability failed: ${res.status}`);
  
  return res.json();
}
checkBudgetAvailability.maxRetries = 3;

export async function searchSuppliers(input: {
  itemDescription: string;
  quantity: number;
  preferredSupplier?: string;
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${SUPPLIER}/suppliers/search`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 429) throw new RetryableError('Rate limited', { retryAfter: '30s' });
  if (res.status >= 500) throw new RetryableError(`Supplier service error`);
  if (!res.ok) throw new Error(`searchSuppliers failed: ${res.status}`);
  
  return res.json();
}
searchSuppliers.maxRetries = 5;

export async function createPurchaseOrder(input: {
  supplierId: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  department: string;
  budgetCode?: string;
  requestId: string;
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${PO}/purchase-orders/create`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 409) throw new FatalError('Purchase order creation conflict');
  if (!res.ok) throw new Error(`createPurchaseOrder failed: ${res.status}`);
  
  return res.json();
}
createPurchaseOrder.maxRetries = 3;

export async function sendApprovalRequest(writable: WritableStream<UIMessageChunk>, token: string, approverEmail: string, requestDetails: any) {
  "use step";
  
  const approvalUrl = `${BASE}/coupa/procurement/approve?token=${encodeURIComponent(token)}`;
  
  await sendApprovalEmail(approverEmail, approvalUrl, requestDetails);
  
  await aiTell(writable,
    `I've sent an approval request to ${approverEmail}. Please check your inbox to review and approve this procurement request.`,
    { token, approvalUrl, approverEmail, requestDetails }
  );
}

export async function sendApprovalEmail(email: string, url: string, details: any) {
  "use step";
  await fetch(`${NOTIFY}/email`, {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      subject: 'Procurement Request Approval Required - Coupa',
      url,
      details,
    }),
    headers: { 'content-type': 'application/json' },
  });
}

export async function sendConfirmationEmail(writable: WritableStream<UIMessageChunk>, token: string, requesterEmail: string, poDetails: any) {
  "use step";
  
  const confirmationUrl = `${BASE}/coupa/procurement/confirm?token=${encodeURIComponent(token)}`;
  
  await sendPOConfirmationEmail(requesterEmail, confirmationUrl, poDetails);
  
  await aiTell(writable,
    `I've sent a confirmation email to ${requesterEmail} with your purchase order details. Please check your inbox.`,
    { token, confirmationUrl, requesterEmail, poDetails }
  );
}

export async function sendPOConfirmationEmail(email: string, url: string, details: any) {
  "use step";
  await fetch(`${NOTIFY}/email`, {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      subject: 'Purchase Order Confirmed - Coupa',
      url,
      details,
    }),
    headers: { 'content-type': 'application/json' },
  });
}

