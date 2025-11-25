import { ToolLoopAgent } from 'ai'
import { z } from 'zod';
import { CampaignAnalysisInput } from '../steps';
import { campaignAnalysis as campaignAnalysisWorkflow } from '../workflow';
import { tool } from 'ai';
import { start } from 'workflow/api';

const campaignAnalysisTool = tool({
    description: 'Analyze marketing campaign performance, generate insights, and create optimization recommendations',
    inputSchema: z.object({
        analystId: z.string(),
        campaignName: z.string(),
        campaignId: z.string().optional(),
        dateRange: z.object({
            start: z.string(),
            end: z.string(),
        }),
        channels: z.array(z.string()).optional(),
        metrics: z.array(z.string()).optional(),
        budgetThreshold: z.number().optional(),
        requesterEmail: z.string().email(),
    }),
    execute: async (input: CampaignAnalysisInput) => {
        const run = await start(campaignAnalysisWorkflow, [input]);
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
 * - selectedModel: Enables A/B testing by routing to different models (user-selectable in chat)
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
 * - Complex tasks (e.g., campaign analysis with workflows) → use premium models
 * 
 * @param prompt - The user's prompt (may be string, array of messages, or undefined)
 * @param tools - The tools available to the agent
 */
function determineTaskComplexity(prompt: string | Array<any> | undefined, tools: Record<string, any>): 'simple' | 'complex' {
    // If the campaignAnalysis tool is available, this agent handles complex marketing workflows
    // Any request that might use this tool should be considered complex
    if ('campaignAnalysis' in tools) {
        // Check if prompt indicates a campaign analysis-related request
        if (prompt) {
            const promptText = typeof prompt === 'string' 
                ? prompt 
                : JSON.stringify(prompt);
            const lowerPrompt = promptText.toLowerCase();
            
            // Simple questions about marketing (explanations, definitions)
            if (
                lowerPrompt.includes('what is') ||
                lowerPrompt.includes('explain') ||
                lowerPrompt.includes('tell me about') ||
                lowerPrompt.includes('how does')
            ) {
                return 'simple';
            }
            
            // Complex tasks: Actual campaign analysis, performance reviews, optimizations
            if (
                lowerPrompt.includes('analyze') ||
                lowerPrompt.includes('campaign') ||
                lowerPrompt.includes('performance') ||
                lowerPrompt.includes('roi') ||
                lowerPrompt.includes('optimize') ||
                lowerPrompt.includes('forecast') ||
                lowerPrompt.includes('report')
            ) {
                return 'complex';
            }
        }
        
        // Default: If campaign analysis tool is available and prompt is unclear, assume complex
        // (since this is a marketing analytics agent, most requests will be analysis-related)
        return 'complex';
    }
    
    // No campaign analysis tool = simple tasks
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
 * Creates a marketing analytics agent with dynamic model switching and A/B testing capabilities
 * 
 * This demonstrates AI SDK 6's callOptions feature which allows:
 * 1. Type-safe runtime configuration via callOptionsSchema
 * 2. Dynamic model selection via prepareCall
 * 3. A/B testing by routing requests to different models (user-selectable)
 * 4. Predetermined task complexity based on tools/prompts (developer-set)
 * 
 * @param defaultModelId - Fallback model if no callOptions are provided
 */
export function createMarketingAgent(defaultModelId: string = 'openai/gpt-4o-mini') {
    
    const baseSystemPrompt = `You are an AI marketing analytics assistant for Greenlight, a fintech company that helps parents raise financially smart children through family finance apps.

**Your role:** Help marketing teams analyze campaign performance, optimize budgets, forecast outcomes, and make data-driven decisions to maximize ROI and customer acquisition efficiency.

**Greenlight's Marketing Context:**
- Target audience: Parents seeking financial education tools for their children
- Key channels: Digital advertising, social media, content marketing, partnerships
- Primary goals: Customer acquisition, user engagement, subscription growth
- Key metrics: CAC (Customer Acquisition Cost), LTV (Lifetime Value), ROI, conversion rates

**Core Capabilities:**
- **Campaign Analytics:** Real-time performance tracking, multi-channel attribution, conversion funnel analysis
- **Budget Optimization:** AI-powered recommendations for budget allocation across channels
- **Predictive Forecasting:** Revenue forecasting, CAC prediction, churn risk analysis
- **Customer Segmentation:** Behavioral segmentation, lifetime value analysis, cohort analysis
- **A/B Testing:** Multi-variant testing, automated winner selection, experiment monitoring
- **Performance Reports:** Custom dashboards, scheduled reports, executive summaries

**Your Approach:**
1. Ask clarifying questions to gather complete campaign details (campaign name, date range, channels, metrics of interest)
2. Analyze performance data across channels and time periods
3. Identify optimization opportunities and budget reallocation recommendations
4. Generate forecasts for future performance based on historical data
5. Route approvals for high-impact budget changes or significant strategy shifts
6. Create comprehensive reports with actionable insights
7. Provide clear, data-driven recommendations with expected impact

**Demo Context:** 
This is a demonstration of AI SDK 6 Beta, Workflows, and AI Gateway capabilities. Showcase real-time processing, durable workflows, approval mechanisms, and enterprise-grade reliability.

Be professional, data-focused, and insights-driven. Guide users through campaign analysis with clarity and confidence. Always format responses in clean, readable markdown with metrics and visual indicators where appropriate.`;
    

    const agent = new ToolLoopAgent({
        // Default model (used when no callOptions are provided)
        model: defaultModelId,
        
        // Define the schema for callOptions - enables type-safe runtime configuration
        callOptionsSchema,
        
        instructions: baseSystemPrompt,
        
        tools: {
            campaignAnalysis: campaignAnalysisTool,
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

            // Log model selection for observability
            console.log(`[Model Selection]`, {
                selectedModel,
                taskComplexity, // Predetermined by developer
            },'\n\n');

            const newInstructions = `${instructions} \n\n You are using the ${selectedModel} model. Tell the user at the beginning of the message that you are using the ${selectedModel} model.`;

            return {
                ...settings,
                tools,
                // Switch model dynamically
                prompt,
                model: selectedModel,
                // Use original instructions (no runtime customization needed for this demo)
                newInstructions,
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

