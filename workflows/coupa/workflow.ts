import { sleep, getWritable } from 'workflow';
import {
  checkPolicyCompliance,
  checkBudgetAvailability,
  searchSuppliers,
  createPurchaseOrder,
  sendApprovalRequest,
  sendConfirmationEmail,
  ProcurementRequestInput,
} from './steps';
import { aiTell } from '../events';
import { procurementApprovalHook } from './hooks';

export async function procurementRequest(input: ProcurementRequestInput) {
  'use workflow';

  const writable = getWritable();
  const requestId = `procurement:${input.employeeId}:${Date.now()}`;

  // Step 1: Check policy compliance
  await aiTell(writable, `Checking procurement policies and compliance requirements...`, { token: requestId });
  const compliance = await checkPolicyCompliance({
    itemDescription: input.itemDescription,
    estimatedCost: input.estimatedCost,
    department: input.department,
    budgetCode: input.budgetCode,
  });

  if (!compliance.ok) {
    await aiTell(writable, 
      `This request violates procurement policies: ${compliance.violations?.join(', ')}. Please revise your request.`,
      { token: requestId, compliance }
    );
    return {
      requestId,
      compliance,
      suppliers: [],
      error: 'Policy violation',
    };
  }

  if (compliance.warnings && compliance.warnings.length > 0) {
    await aiTell(writable,
      `Policy warnings: ${compliance.warnings.join(', ')}. Proceeding with approval required.`,
      { token: requestId, compliance }
    );
  }

  // Step 2: Check budget availability
  const estimatedCost = input.estimatedCost || 0;
  if (estimatedCost > 0) {
    await aiTell(writable, `Checking budget availability...`, { token: requestId });
    const budgetCheck = await checkBudgetAvailability({
      department: input.department,
      budgetCode: input.budgetCode,
      amount: estimatedCost,
    });

    if (!budgetCheck.available) {
      await aiTell(writable,
        `Insufficient budget: ${budgetCheck.reason || 'Budget limit exceeded'}. Please contact your finance team.`,
        { token: requestId, budgetCheck }
      );
      return {
        requestId,
        compliance,
        suppliers: [],
        error: 'Insufficient budget',
      };
    }

    if (budgetCheck.warning) {
      await aiTell(writable,
        `Budget warning: ${budgetCheck.warning}. Approval may be required.`,
        { token: requestId, budgetCheck }
      );
    }
  }

  // Step 3: Search for suppliers
  await aiTell(writable, `Searching for suppliers and getting quotes...`, { token: requestId });
  const suppliers = await searchSuppliers({
    itemDescription: input.itemDescription,
    quantity: input.quantity,
    preferredSupplier: input.preferredSupplier,
  });

  if (suppliers.length === 0) {
    await aiTell(writable,
      `No suppliers found for "${input.itemDescription}". Would you like to expand your search criteria?`,
      { token: requestId }
    );
    return {
      requestId,
      compliance,
      suppliers: [],
      error: 'No suppliers found',
    };
  }

  // Step 4: Determine if approval is required
  // Approval required if: high cost, policy warnings, or critical urgency
  const requiresApproval = 
    (estimatedCost > 5000) || 
    (compliance.warnings && compliance.warnings.length > 0) ||
    (input.urgency === 'critical');

  if (requiresApproval) {
    const token = requestId;
    const approval = procurementApprovalHook.create({ token });
    
    // Determine approver based on amount and department
    const approverEmail = estimatedCost > 10000 
      ? `finance-manager@company.com`
      : `department-manager-${input.department}@company.com`;

    await sendApprovalRequest(writable, token, approverEmail, {
      requestId,
      itemDescription: input.itemDescription,
      quantity: input.quantity,
      estimatedCost,
      department: input.department,
      suppliers: suppliers.slice(0, 3), // Top 3 suppliers
      urgency: input.urgency,
      justification: input.justification,
    });

    // Wait for approval OR timeout (5 minutes for critical, 1 hour for routine)
    const timeout = input.urgency === 'critical' ? '5m' : '1h';
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
        requestId,
        compliance,
        suppliers,
        approval: decision,
        error: 'Approval denied or timeout',
      };
    }

    await aiTell(writable, `Approval received. Proceeding with purchase order creation.`, { token, decision });

    // If alternative supplier suggested, use it
    if ('alternativeSupplierId' in decision) {
      const altSupplier = suppliers.find((s: any) => s.supplierId === decision.alternativeSupplierId);
      if (altSupplier) {
        suppliers.unshift(altSupplier); // Move to front
      }
    }
  }

  // Step 5: Create purchase order with top supplier
  const selectedSupplier = suppliers[0];
  await aiTell(writable, 
    `Creating purchase order with ${selectedSupplier.name}...`,
    { token: requestId, supplier: selectedSupplier }
  );

  const totalAmount = selectedSupplier.price * input.quantity;
  const purchaseOrder = await createPurchaseOrder({
    supplierId: selectedSupplier.supplierId,
    itemDescription: input.itemDescription,
    quantity: input.quantity,
    unitPrice: selectedSupplier.price,
    totalAmount,
    department: input.department,
    budgetCode: input.budgetCode,
    requestId,
  });

  // Step 6: Send confirmation
  const confirmationToken = `confirmation:${requestId}`;
  await sendConfirmationEmail(writable, confirmationToken, input.requesterEmail, {
    requestId,
    purchaseOrder,
    supplier: selectedSupplier,
  });

  const poUrl = `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/coupa/procurement/confirm?token=${encodeURIComponent(confirmationToken)}`;

  await aiTell(writable,
    `Purchase order ${purchaseOrder.poNumber} has been created successfully! Total: $${totalAmount.toLocaleString()}.`,
    { token: requestId, purchaseOrder, poUrl }
  );

  return {
    requestId,
    compliance,
    suppliers,
    approval: requiresApproval ? { approved: true } : undefined,
    purchaseOrder: {
      poNumber: purchaseOrder.poNumber,
      supplierId: selectedSupplier.supplierId,
      totalAmount,
      estimatedDelivery: purchaseOrder.estimatedDelivery,
    },
    poUrl,
  };
}

