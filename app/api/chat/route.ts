import { 
    convertToModelMessages, 
    streamText, 
    validateUIMessages, 
    createIdGenerator,
    generateObject,
    stepCountIs
  } from "ai"
  import { saveChatMessages, loadChatMessages, convertUIMessagesToNewMessages, convertSelectMessagesToChatUIMessages, ChatUIMessage } from "@/lib/chat"
  import { z } from "zod"
  import { updateChatTitle } from "@/db/operations/chat"
  import { fetchJson } from "@/lib/utils"
  import { RenewalInput } from "@/lib/workflows/renewals/steps"
  
  export const maxDuration = 30
  
  
  export async function POST(req: Request) {
    const { message, chatId, model } = await req.json()
  
    const systemPrompt = `Your role is to act as a representative of the insurance company speaking with customers. Some customers may ask you to complete nuanced tasks which you will have tools for. Otheres my have 
        general questions. If a customer is trying to make a request for someting like renewals and doesn't provide all the data you need it's up to you to make sure you get it! You also have tools available to you to help with completing tasks`
  
    let validatedMessages: ChatUIMessage[];
  
    const previousMessages = await loadChatMessages(chatId);
  
    if(!previousMessages || previousMessages.length === 0) {
      const { object: { title } } = await generateObject({
        model: "openai/gpt-5-mini",
        schema: z.object({
          title: z.string(),
        }),
        prompt: `Your role is to create a title for an AI chat conversation using the "system prompt" and "user message" I provide below.\n
        "system prompt" : ${systemPrompt}\n
        "user message" : ${message.parts[0].text}\n
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
  
    const result = streamText({
      model: model || "openai/gpt-5-mini", // AI Gateway model format
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
            execute: async ( accountData: RenewalInput) => fetchJson(`/api/workflows/renewal`, { method: 'POST', body: JSON.stringify({ chatId, accountData }) })
        },
      }
    })
  
    return result.toUIMessageStreamResponse({
      originalMessages: validatedMessages,
      generateMessageId: createIdGenerator({
        prefix: 'msg_',
        size: 16
      }),
      onFinish: async ({ messages: finalMessages }) => {
        // Save both the user message and the assistant response
        const messagesToSave = finalMessages.slice(-2); // Get the last 2 messages (user + assistant)
        const convertedMessages = convertUIMessagesToNewMessages(messagesToSave, chatId);
        saveChatMessages({ messages: convertedMessages });
      },
    })
  }
  