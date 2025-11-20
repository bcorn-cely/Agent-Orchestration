import { ToolLoopAgent } from 'ai'
import { z } from 'zod';
import { ProcurementRequestInput } from '../steps';
import { procurementRequest as procurementRequestWorkflow } from '../workflow';
import { tool } from 'ai';
import { start } from 'workflow/api';

const procurementTool = tool({
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
        // return await procurementRequestWorkflow(input)
        const run = await start(procurementRequestWorkflow, [input]);
        return { runId: run.runId };
    },
    needsApproval: true,
})

/**
 * Call Options Schema for AI SDK 6
 * 
 * This schema defines the runtime inputs that can be passed to dynamically configure the agent.
 * 
 * Key capability demonstrated:
 * - abTestVariant: Enables A/B testing by routing to different models (user-selectable in chat)
 * 
 * Note: taskComplexity is NOT a runtime input. It's predetermined by the developer
 * based on which tools are used or the nature of the request. See determineTaskComplexity().
 */
const callOptionsSchema = z.object({
    selectedModel: z.string().optional(),
});

/**
 * Determines task complexity based on the prompt and tools being used.
 * 
 * This is predetermined logic set by the developer, not based on runtime input.
 * Different tools or types of requests map to different complexity levels:
 * - Simple tasks (e.g., basic questions, simple lookups) → use cheap models
 * - Complex tasks (e.g., procurement requests with workflows) → use premium models
 * 
 * @param prompt - The user's prompt (may be string, array of messages, or undefined)
 * @param tools - The tools available to the agent
 */
function determineTaskComplexity(prompt: string | Array<any> | undefined, tools: Record<string, any>): 'simple' | 'complex' {
    // If the procurement tool is available, this agent handles complex procurement workflows
    // Any request that might use this tool should be considered complex
    if ('procurementRequest' in tools) {
        // Check if prompt indicates a procurement-related request
        if (prompt) {
            const promptText = typeof prompt === 'string' 
                ? prompt 
                : JSON.stringify(prompt);
            const lowerPrompt = promptText.toLowerCase();
            
            // Simple questions about procurement (explanations, definitions)
            if (
                lowerPrompt.includes('what is') ||
                lowerPrompt.includes('explain') ||
                lowerPrompt.includes('tell me about') ||
                lowerPrompt.includes('how does')
            ) {
                return 'simple';
            }
            
            // Complex tasks: Actual procurement requests, creating purchase orders, etc.
            if (
                lowerPrompt.includes('create') ||
                lowerPrompt.includes('request') ||
                lowerPrompt.includes('purchase order') ||
                lowerPrompt.includes('procurement request') ||
                lowerPrompt.includes('buy') ||
                lowerPrompt.includes('order')
            ) {
                return 'complex';
            }
        }
        
        // Default: If procurement tool is available and prompt is unclear, assume complex
        // (since this is a procurement agent, most requests will be procurement-related)
        return 'complex';
    }
    
    // No procurement tool = simple tasks
    return 'simple';
}

/**
 * Model Selection Strategy
 * 
 * This function determines which model to use based on:
 * 1. A/B test variant (runtime input from user selection - highest priority)
 * 2. Task complexity (predetermined by developer based on tools/prompt)
 */
function selectModel(taskComplexity: 'simple' | 'complex'): string {
    // Model switching based on predetermined task complexity
    if (taskComplexity === 'complex') {
        // Complex tasks: Use premium models for better reasoning
        return 'anthropic/claude-sonnet-4.5';
    } else {
        // Simple tasks: Use cheaper models for cost efficiency
        return 'openai/gpt-4o-mini';
    }
}

/**
 * Creates a procurement agent with dynamic model switching and A/B testing capabilities
 * 
 * This demonstrates AI SDK 6's callOptions feature which allows:
 * 1. Type-safe runtime configuration via callOptionsSchema
 * 2. Dynamic model selection via prepareCall
 * 3. A/B testing by routing requests to different models (user-selectable)
 * 4. Predetermined task complexity based on tools/prompts (developer-set)
 * 
 * @param defaultModelId - Fallback model if no callOptions are provided
 */
export function createProcurementAgent(defaultModelId: string = 'openai/gpt-4o-mini') {
    
    const baseSystemPrompt = `You are an AI procurement assistant for Coupa, the leading AI-native Total Spend Management platform. Coupa powers procurement, finance, and supply chain operations for 3,000+ enterprises, leveraging $8T+ in real-world spend data from 10M+ buyers and suppliers.

**Your role:** Help employees efficiently manage procurement requests, optimize supplier selection, ensure policy compliance, verify budget availability, and streamline purchase order creation.

**Coupa's Core Capabilities:**
- **Procure-to-Pay (P2P):** Automated requisitions, smart approvals, on-contract spend optimization
- **Source-to-Contract (S2C):** Strategic sourcing, contract lifecycle management, supplier risk monitoring  
- **AP Automation:** Invoice processing, virtual card payments, fraud prevention
- **Supply Chain Collaboration:** Real-time visibility, supply risk management, supplier collaboration
- **Treasury & Cash Management:** Global cash visibility, AI fraud detection, liquidity optimization
- **Spend Analytics:** Predictive analytics, spend optimization, real-time reporting

**AI-Powered Intelligence:**
Coupa AI automates manual tasks, predicts supply chain disruptions, and provides optimization recommendations based on global spend patterns. Every suggestion you make should emphasize efficiency, compliance, cost savings, and risk mitigation.

**Your Approach:**
1. Ask clarifying questions to gather complete procurement details (item description, quantity, department, urgency, justification)
2. Proactively check policy compliance and budget availability
3. Search multiple suppliers to find the best pricing and delivery terms
4. Route approvals intelligently based on cost thresholds and organizational hierarchy
5. Create purchase orders automatically once approved
6. Provide clear status updates and next steps

**Demo Context:** 
This is a demonstration of AI SDK 6 Beta, Workflows, and AI Gateway capabilities. Your very first message should always mention the LLM model being used. Showcase real-time processing, durable workflows, approval mechanisms, and enterprise-grade reliability.

Be professional, efficient, and solutions-oriented. Guide users through the procurement process with clarity and confidence. Always format responses in clean, readable markdown.`;
    

    const agent = new ToolLoopAgent({
        // Default model (used when no callOptions are provided)
        model: defaultModelId,
        
        // Define the schema for callOptions - enables type-safe runtime configuration
        callOptionsSchema,
        
        instructions: baseSystemPrompt,
        
        tools: {
            procurementRequest: procurementTool,
        },
        
        /**
         * prepareCall: Dynamically configure the agent based on callOptions
         * 
         * This function is called before each agent.generate() or agent.stream() call,
         * allowing you to modify:
         * - model: Switch between cheap/expensive models
         * - instructions: Customize prompts based on context
         * - temperature, maxOutputTokens: Adjust generation parameters
         * 
         * Key behaviors:
         * 1. A/B test variant (runtime input): Routes to specific models for experimentation
         * 2. Task complexity (predetermined): Determined by developer based on tools/prompt
         * 
         * This is where the magic of model switching and A/B testing happens!
         */
        prepareCall: ({ options, model, instructions, prompt, tools, ...settings }) => {
            // Determine task complexity based on prompt and tools (predetermined by developer)
            // This is NOT a runtime input - it's logic set by the developer
            const taskComplexity = determineTaskComplexity(prompt, tools || {});
            
            // Select model based on A/B test variant (if provided) or task complexity
            const selectedModel = options?.selectedModel || selectModel(taskComplexity);

            // const newInstructions = `${instructions} \n\n You are using the ${selectedModel} model.`;

            // Log model selection for observability
            console.log(`[Model Selection]`, {
                selectedModel,
                taskComplexity, // Predetermined by developer
            },'\n\n');

            return {
                ...settings,
                tools,
                // Switch model dynamically
                prompt,
                model: selectedModel,
                // Use original instructions (no runtime customization needed for this demo)
                instructions,
                // Adjust generation parameters based on predetermined complexity
                temperature: taskComplexity === 'complex' ? 0.7 : 0.3,
                maxOutputTokens: taskComplexity === 'complex' ? 4096 : 2048,
            };
        },
        
        providerOptions: {
            gateway: {
                order: ['bedrock', 'openai'],
                only: ['bedrock', 'openai'],
            }
        }
    })

    return agent;
}
