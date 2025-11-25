// workflows/greenlight/steps.ts
import { FatalError, RetryableError } from 'workflow';
import { UIMessageChunk } from 'ai';
import { aiTell } from '../events';

export type CampaignAnalysisInput = {
  analystId: string;
  campaignName: string;
  campaignId?: string;
  dateRange: {
    start: string;
    end: string;
  };
  channels?: string[];
  metrics?: string[];
  budgetThreshold?: number;
  requesterEmail: string;
};

export type CampaignAnalysisResult = {
  analysisId: string;
  campaignPerformance: {
    totalSpend: number;
    totalRevenue: number;
    roi: number;
    cac: number;
    conversions: number;
    conversionRate: number;
  };
  channelBreakdown: Array<{
    channel: string;
    spend: number;
    revenue: number;
    roi: number;
    conversions: number;
  }>;
  recommendations: Array<{
    type: 'scale' | 'pause' | 'optimize' | 'reallocate';
    channel?: string;
    reason: string;
    expectedImpact: string;
  }>;
  forecast?: {
    projectedRevenue: number;
    projectedCAC: number;
    confidence: number;
  };
  approval?: {
    approved: boolean;
    approvedBy?: string;
    comment?: string;
  };
  reportUrl?: string;
};

const BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const ANALYTICS = process.env.ANALYTICS ?? `${BASE}/api/mocks/greenlight`;
const BUDGET = process.env.BUDGET ?? `${BASE}/api/mocks/greenlight`;
const FORECAST = process.env.FORECAST ?? `${BASE}/api/mocks/greenlight`;
const NOTIFY = process.env.NOTIFY ?? `${BASE}/api/mocks/notify`;

/** ---------- Durable steps ---------- */

export async function fetchCampaignData(input: {
  campaignName: string;
  campaignId?: string;
  dateRange: {
    start: string;
    end: string;
  };
  channels?: string[];
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${ANALYTICS}/campaigns/data`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 404) throw new FatalError(`Campaign data service unavailable`);
  if (!res.ok) throw new Error(`fetchCampaignData failed: ${res.status}`);
  
  return res.json();
}
fetchCampaignData.maxRetries = 3;






export async function checkBudgetConstraints(input: {
  campaignId: string;
  requestedBudget?: number;
  dateRange: {
    start: string;
    end: string;
  };
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${BUDGET}/budgets/check`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 404) throw new FatalError(`Budget service unavailable`);
  if (!res.ok) throw new Error(`checkBudgetConstraints failed: ${res.status}`);
  
  return res.json();
}
checkBudgetConstraints.maxRetries = 3;








export async function generateForecast(input: {
  campaignId: string;
  historicalData: any;
  proposedChanges?: any;
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${FORECAST}/forecasts/generate`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 429) throw new RetryableError('Rate limited', { retryAfter: '30s' });
  if (res.status >= 500) throw new RetryableError(`Forecast service error`);
  if (!res.ok) throw new Error(`generateForecast failed: ${res.status}`);
  
  return res.json();
}
generateForecast.maxRetries = 5;




export async function generateReport(input: {
  analysisId: string;
  campaignData: any;
  recommendations: any[];
  forecast?: any;
}) {
  "use step";
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  const res = await fetch(`${ANALYTICS}/reports/generate`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
  });
  
  if (res.status === 409) throw new FatalError('Report generation conflict');
  if (!res.ok) throw new Error(`generateReport failed: ${res.status}`);
  
  return res.json();
}
generateReport.maxRetries = 3;

export async function sendApprovalRequest(writable: WritableStream<UIMessageChunk>, token: string, approverEmail: string, requestDetails: any) {
  "use step";
  
  const approvalUrl = `${BASE}/greenlight/campaigns/approve?token=${encodeURIComponent(token)}`;
  
  await sendApprovalEmail(approverEmail, approvalUrl, requestDetails);
  
  await aiTell(writable,
    `I've sent an approval request to ${approverEmail}. Please check your inbox to review and approve this campaign analysis and budget recommendations.`,
    { token, approvalUrl, approverEmail, requestDetails }
  );
}

export async function sendApprovalEmail(email: string, url: string, details: any) {
  "use step";
  await fetch(`${NOTIFY}/email`, {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      subject: 'Campaign Analysis & Budget Approval Required - Greenlight',
      url,
      details,
    }),
    headers: { 'content-type': 'application/json' },
  });
}

export async function sendReportEmail(writable: WritableStream<UIMessageChunk>, token: string, requesterEmail: string, reportDetails: any) {
  "use step";
  
  const reportUrl = `${BASE}/greenlight/campaigns/report?token=${encodeURIComponent(token)}`;
  
  await sendReportNotificationEmail(requesterEmail, reportUrl, reportDetails);
  
  await aiTell(writable,
    `I've sent a report email to ${requesterEmail} with your campaign analysis. Please check your inbox.`,
    { token, reportUrl, requesterEmail, reportDetails }
  );
}

export async function sendReportNotificationEmail(email: string, url: string, details: any) {
  "use step";
  await fetch(`${NOTIFY}/email`, {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      subject: 'Campaign Analysis Report Ready - Greenlight',
      url,
      details,
    }),
    headers: { 'content-type': 'application/json' },
  });
}

