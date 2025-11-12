import { 
    convertToModelMessages, 
    streamText, 
    validateUIMessages, 
    createIdGenerator,
    generateObject,
    stepCountIs,
    createUIMessageStream,
    createUIMessageStreamResponse,
  } from "ai"
  import { saveChatMessages, loadChatMessages, convertUIMessagesToNewMessages, convertSelectMessagesToChatUIMessages, ChatUIMessage } from "@/lib/chat"
  import { z } from "zod"
  import { updateChatTitle } from "@/db/operations/chat"
  import { fetchJson } from "@/lib/utils"
  import { RenewalInput } from "@/lib/workflows/renewals/steps"
  import { start, getRun } from "workflow/api"
  import { renewal } from "@/lib/workflows/renewals/workflow"
  
  export const maxDuration = 60
  
  
  // Define a minimal message type; the client will look for "ai-notification" parts.
  type ChatDataParts = {
    "ai-notification": { message: string; approvalUrl?: string; token?: string; email?: string };
    "progress-line": { text: string };
  };
  type ChatMessage = import("ai").UIMessage<never, ChatDataParts>;

  export async function POST(req: Request) {
    const { message, chatId, model } = await req.json() as {
      message?: ChatMessage;
      chatId?: string;
      model?: string;
    }
  
    const systemPrompt = `Your role is to act as a representative of the insurance company speaking with customers. Some customers may ask you to complete nuanced tasks which you will have tools for. Otheres my have 
        general questions. If a customer is trying to make a request for something like renewals and doesn't provide all the data you need it's up to you to make sure you get it! You also have tools available to you to help with completing tasks`
  
    let validatedMessages: ChatUIMessage[] = [];
  
    // Only process messages if we have a message and chatId
    if (message && chatId) {
      const previousMessages = await loadChatMessages(chatId);
  
      if(!previousMessages || previousMessages.length === 0) {
        const firstPart = message.parts[0];
        const userText = firstPart && 'text' in firstPart ? firstPart.text : '';
        const { object: { title } } = await generateObject({
          model: "openai/gpt-5-mini",
          schema: z.object({
            title: z.string(),
          }),
          prompt: `Your role is to create a title for an AI chat conversation using the "system prompt" and "user message" I provide below.\n
          "system prompt" : ${systemPrompt}\n
          "user message" : ${userText}\n
          `
        });
        await updateChatTitle(chatId, title);
      }
      // Convert previous messages from database format to UI format
      const previousUIMessages = convertSelectMessagesToChatUIMessages(previousMessages);
      // Add the current user message to the conversation
      const allMessages = [...previousUIMessages, message];
      validatedMessages = await validateUIMessages({
        messages: allMessages
      });
    }

    // 2) Build a UI message stream (SSE)
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        // Merge LLM output into the same SSE stream
        if (message && validatedMessages.length > 0) {
          const llm = streamText({
            model: model || "openai/gpt-5-mini",
            messages: convertToModelMessages(validatedMessages),
            system: systemPrompt,
            abortSignal: req.signal,
            temperature: 0.7,
            stopWhen: stepCountIs(10),
            tools: {
              getLossTrends: {
                description: 'loss frequency/severity by year for an account',
                inputSchema: z.object({
                  accountId: z.string(),
                }),
                execute: async ({ accountId }) => fetchJson(`/api/mocks/losses/${accountId}`)
              },
              extractSov: {
                description: 'Parse SOV and normalize values',
                inputSchema: z.object({
                  sovFileId: z.string(),
                }),
                execute: async ({ sovFileId }) => fetchJson(`/api/mocks/sov/${sovFileId}`)
              },
              startRenewalWorkflow: {
                description: 'Kick off durable orchestration of renewal workflow',
                inputSchema: z.object({
                  accountId: z.string(),
                  effectiveDate: z.string(),
                  sovFileId: z.string(),
                  state: z.string(),
                  brokerEmail: z.string(),
                  carriers: z.array(z.string()),
                }),
                execute: async (accountData: RenewalInput) => {
                const response = await start(renewal, [accountData]);
                return response;
                }
              },
            }
          });
          writer.merge(llm.toUIMessageStream());
        }

      },
    });

    // Handle message saving after stream completes
    // Note: We'll need to handle this on the client side or via a separate mechanism
    // since createUIMessageStreamResponse doesn't support onFinish directly
    
    return createUIMessageStreamResponse({ stream });
  }
  
  