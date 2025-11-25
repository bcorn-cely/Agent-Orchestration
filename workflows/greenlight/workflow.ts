import { sleep, getWritable } from 'workflow';
import {
  fetchCampaignData,
  checkBudgetConstraints,
  generateForecast,
  generateReport,
  sendApprovalRequest,
  sendReportEmail,
  CampaignAnalysisInput,
} from './steps';
import { aiTell } from '../events';
import { campaignApprovalHook } from './hooks';

export async function campaignAnalysis(input: CampaignAnalysisInput) {
  'use workflow'

  const writable = getWritable();
  const analysisId = `analysis:${input.analystId}}`;

  // Step 1: Fetch campaign data
  await aiTell(writable, `Fetching campaign data and performance metrics...`, { token: analysisId });
  const campaignData = await fetchCampaignData({
    campaignName: input.campaignName,
    campaignId: input.campaignId,
    dateRange: input.dateRange,
    channels: input.channels,
  });

  if (!campaignData || !campaignData.performance) {
    await aiTell(writable,
      `Unable to fetch campaign data for "${input.campaignName}". Please verify the campaign name and date range.`,
      { token: analysisId }
    );
    return {
      analysisId,
      error: 'Campaign data not found',
    };
  }

  // Step 2: Check budget constraints if threshold is provided
  if (input.budgetThreshold && input.campaignId) {
    await aiTell(writable, `Checking budget constraints and availability...`, { token: analysisId });
    const budgetCheck = await checkBudgetConstraints({
      campaignId: input.campaignId,
      requestedBudget: input.budgetThreshold,
      dateRange: input.dateRange,
    });

    if (!budgetCheck.available) {
      await aiTell(writable,
        `Budget constraint: ${budgetCheck.reason || 'Budget limit exceeded'}. Please adjust your request or contact finance.`,
        { token: analysisId, budgetCheck }
      );
      return {
        analysisId,
        campaignPerformance: campaignData.performance,
        error: 'Budget constraint violation',
      };
    }

    if (budgetCheck.warning) {
      await aiTell(writable,
        `Budget warning: ${budgetCheck.warning}. Approval may be required for budget adjustments.`,
        { token: analysisId, budgetCheck }
      );
    }
  }

  // Step 3: Generate forecast if we have historical data
  let forecast = undefined;
  if (campaignData.performance && campaignData.historicalData) {
    await aiTell(writable, `Generating performance forecast and predictions...`, { token: analysisId });
    try {
      forecast = await generateForecast({
        campaignId: input.campaignId || input.campaignName,
        historicalData: campaignData.historicalData,
        proposedChanges: campaignData.recommendations,
      });
      
      if (forecast) {
        await aiTell(writable,
          `Forecast generated: Projected revenue $${forecast.projectedRevenue?.toLocaleString() || 'N/A'} with ${forecast.confidence || 0}% confidence.`,
          { token: analysisId, forecast }
        );
      }
    } catch (error) {
      await aiTell(writable,
        `Forecast generation encountered an issue, but continuing with analysis...`,
        { token: analysisId }
      );
    }
  }

  // Step 4: Determine if approval is required
  // Approval required if: high budget impact, negative ROI, or significant changes recommended
  const requiresApproval = true;

  if (requiresApproval) {
    const token = analysisId;
    const approval = campaignApprovalHook.create({ token });
    
    // Determine approver based on budget impact
    const approverEmail = input.budgetThreshold && input.budgetThreshold > 100000
      ? `cmo@greenlight.com`
      : `marketing-manager@greenlight.com`;

    await sendApprovalRequest(writable, token, approverEmail, {
      analysisId,
      campaignName: input.campaignName,
      campaignPerformance: campaignData.performance,
      recommendations: campaignData.recommendations,
      forecast,
      budgetThreshold: input.budgetThreshold,
      dateRange: input.dateRange,
    });

    // Wait for approval OR timeout (15 minutes for high-impact, 1 hour for routine)
    const timeout = input.budgetThreshold && input.budgetThreshold > 100000 ? '15m' : '1h';
    const decision = await Promise.race([
      approval,
      (async () => {
        await sleep(timeout);
        return { approved: false, comment: 'Approval timeout' };
      })(),
    ]);

    if (decision.approved === false) {
      await aiTell(writable,
        `Approval ${decision.comment === 'Approval timeout' ? 'timed out' : 'denied'}${decision.comment ? `: ${decision.comment}` : ''}.`,
        { token, decision }
      );
      return {
        analysisId,
        campaignPerformance: campaignData.performance,
        channelBreakdown: campaignData.channelBreakdown,
        recommendations: campaignData.recommendations,
        forecast,
        approval: decision,
        error: 'Approval denied or timeout',
      };
    }

    await aiTell(writable, `Approval received. Proceeding with report generation.`, { token, decision });

    // If budget adjustment suggested, apply it
    if ('budgetAdjustment' in decision && decision.budgetAdjustment) {
      input.budgetThreshold = decision.budgetAdjustment;
    }

    // If alternative channels suggested, update recommendations
    if ('alternativeChannels' in decision && decision.alternativeChannels) {
      campaignData.recommendations = campaignData.recommendations?.map((rec: any) => {
        if (rec.type === 'reallocate') {
          return { ...rec, suggestedChannels: decision.alternativeChannels };
        }
        return rec;
      });
    }
  }

  // Step 5: Generate comprehensive report
  await aiTell(writable, 
    `Generating comprehensive campaign analysis report...`,
    { token: analysisId }
  );

  const report = await generateReport({
    analysisId,
    campaignData: campaignData.performance,
    recommendations: campaignData.recommendations || [],
    forecast,
  });

  // Step 6: Send report email
  const reportToken = `report:${analysisId}`;
  await sendReportEmail(writable, reportToken, input.requesterEmail, {
    analysisId,
    report,
    campaignPerformance: campaignData.performance,
    recommendations: campaignData.recommendations,
    forecast,
  });

  const reportUrl = `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/greenlight/campaigns/report?token=${encodeURIComponent(reportToken)}`;

  await aiTell(writable,
    `Campaign analysis complete! Report ${report.reportId || analysisId} has been generated. Total ROI: ${campaignData.performance?.roi?.toFixed(2) || 'N/A'}%.`,
    { token: analysisId, report, reportUrl }
  );

  return {
    analysisId,
    campaignPerformance: campaignData.performance,
    channelBreakdown: campaignData.channelBreakdown || [],
    recommendations: campaignData.recommendations || [],
    forecast,
    approval: requiresApproval ? { approved: true } : undefined,
    report: {
      reportId: report.reportId || analysisId,
      reportUrl,
    },
  };
}

