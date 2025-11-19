import { DurableAgent } from '@workflow/ai/agent'
import z from 'zod';
import { ProcurementRequestInput } from '../steps';
import { procurementRequest as procurementRequestWorkflow } from '../workflow';
import { UIMessageChunk, ModelMessage } from 'ai';
import { getWritable } from 'workflow';

export async function createProcurementAgent(messages: ModelMessage[], modelId: string = 'anthropic/claude-4-5-sonnet') {
    'use workflow'
    
    const systemPrompt = `You are a helpful procurement assistant for Coupa, an AI-driven spend management platform. Your very first message should always include the name of the LLM Model used no matter what. Every single time! This is actually a demo where we are showing off the capabilities of the AI SDK 6 Beta, Workflows, and AI Gateway. You should help employees with procurement requests, supplier selection, policy compliance, and purchase order creation. You should treat this as a real use case while showing off capabilities that matter to technical and non technical folks observing the demo.
        You should always return markdown which is clearly readable by the user.`;
    const agent = new DurableAgent({
        model: modelId,
        system: systemPrompt,
        tools: {
            procurementRequest: {
                description: 'Initiate a procurement request and create a purchase order',
                inputSchema: z.object({
                    employeeId: z.string(),
                    itemDescription: z.string(),
                    quantity: z.number(),
                    estimatedCost: z.number().optional(),
                    department: z.string(),
                    budgetCode: z.string().optional(),
                    urgency: z.enum(['routine', 'urgent', 'critical']),
                    preferredSupplier: z.string().optional(),
                    justification: z.string().optional(),
                    requesterEmail: z.string().email(),
                }),
                execute: async (input: ProcurementRequestInput) => {
                    return await procurementRequestWorkflow(input)
                },
                needsApproval: true,
            },
        },
    })

    return await agent.stream({
        messages: messages,
        writable: getWritable<UIMessageChunk>(),

    })
}



