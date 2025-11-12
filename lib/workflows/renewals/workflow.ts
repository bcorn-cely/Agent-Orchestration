import { FatalError, sleep } from 'workflow';
import { complianceCheck, extractSoV, getLossTrends, quoteCarrier, RenewalInput, sendBrokerApprovalRequest, compileMarketSummary} from './steps';
import { emitEvent, aiTell } from '../events';
import { brokerApprovalHook } from './hooks';


export async function renewal(input: RenewalInput) {
    'use workflow';

    // first logging
    await writeProgress({ namespace: 'Renewal', step: 'Started', message: 'Starting the renewal workflow' });

    // perform renewal work here
    const sov = await extractSoV(input.sovFileId);
    await writeProgress({ namespace: 'Renewal', step: 'Extracted SoV', message: `Parsed SoV rows: ${sov?.rows ?? 0}` });

    const loss = await getLossTrends(input.accountId);
    await writeProgress({ namespace: 'Renewal', step: 'Loaded loss trends', message: `Loaded loss trends for ${input.accountId}` });

    const quotes = await Promise.all(input.carriers.map((c) => quoteCarrier(c, sov, loss)));
    await writeProgress({ namespace: 'Renewal', step: 'Received quotes', message: `Received ${quotes.length} carrier quotes` });

    const compliance = await complianceCheck({ quotes, state: input.state });
    await writeProgress({ namespace: 'Renewal', step: 'Checked compliance', message: `Compliance checked: ${compliance.ok ? 'ok' : 'failed'}` });

    const token = `renewal:${input.accountId}:${input.effectiveDate}`;

    // Create the hook in workflow context (required)
    const approval = brokerApprovalHook.create({ token });
    
    // Send email and emit notification (step)
    await sendBrokerApprovalRequest(token, input.brokerEmail);

    // Pause: wait for approval OR timeout (in workflow context)
    const decision = await Promise.race([
      approval, // resolved when /api/workflows/renewal/approve calls brokerApprovalHook.resume(token, { ... })
      (async () => { await sleep("1m"); return { approved: false, comment: "timeout" as const }; })(),
    ]);

    // Post-outcome notices
    if (decision.comment === "timeout") {
      await aiTell(`Approval timed out after 1 minute. You can restart when ready.`, { token });
    } else if (decision.approved === false) {
      await aiTell(`Broker requested changes${decision.comment ? `: ${decision.comment}` : ""}.`, { token });
    } else {
      await aiTell(`Approval received. Continuing.`, { token });
    }

    await writeProgress({
      namespace: "Renewal",
      step: "Checked approval",
      message: `Approval: ${decision.approved ? "approved" : `rejected (${decision.comment ?? "no reason"})`}`,
      data: decision,
    });

    if (!decision.approved) {
        throw new FatalError("Broker rejected or timed out");
    }

    const summaryUrl = await compileMarketSummary({
        accountId: input.accountId,
        quotes,
    });
    await writeProgress({ namespace: 'Renewal', step: 'Compiled market summary', message: `Market summary compiled: ${summaryUrl}` });

    return { accountId: input.accountId, quotes, compliance, summaryUrl };
}


export async function writeProgress({
    namespace,
    step,
    message,
    data = {}
}: { namespace: string, step: string, message: string, data?: unknown }) {
    'use step'
    return emitEvent({ namespace, step, message, data });
}

// num retries
writeProgress.maxRetries = 3;