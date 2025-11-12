import {
    convertToModelMessages,
    streamText,
    validateUIMessages,
    generateObject,
    stepCountIs,
    createUIMessageStream,
    createUIMessageStreamResponse,
  } from "ai"
  import { loadChatMessages, convertSelectMessagesToChatUIMessages, convertUIMessagesToNewMessages, saveChatMessages, getChat, type ChatUIMessage } from "@/lib/chat"
  import { z } from "zod"
  import { updateChatTitle, createChat } from "@/db/operations/chat"
  import { fetchJson } from "@/lib/utils"
  import type { RenewalInput } from "@/lib/workflows/renewals/steps"
  import { start } from "workflow/api"
  import { renewal } from "@/lib/workflows/renewals/workflow"
  
  export const maxDuration = 60
  
  // Define a minimal message type; the client will look for "ai-notification" parts.
  type ChatDataParts = {
    "ai-notification": { message: string; approvalUrl?: string; token?: string; email?: string }
    "progress-line": { text: string }
  }
  type ChatMessage = import("ai").UIMessage<never, ChatDataParts>
  
  export async function POST(req: Request) {
    const { message, chatId, model } = (await req.json()) as {
      message?: ChatMessage
      chatId?: string
      model?: string
    }
  
    const systemPrompt = `You are Newfront Intelligence, an AI assistant for Newfront Insurance. You help insurance brokers and clients with:
      
      - Policy renewals and workflow management
      - Loss trend analysis and risk assessment
      - Statement of Values (SOV) extraction and processing
      - Carrier quote requests and comparisons
      - Account insights and recommendations
      
      When responding:
      - Use markdown formatting for clear, readable messages
      - Include headers (##), lists, **bold**, and *italic* for emphasis
      - Be professional yet conversational
      - If customers need to complete tasks like renewals but don't provide all required data, you can generate sample data for testing purposes
      - Leverage available tools to complete insurance-specific tasks
      
      You represent Newfront's commitment to modern, efficient insurance operations.`
  
    let validatedMessages: ChatUIMessage[] = []

    // Only process messages if we have a message and chatId
    if (message && chatId) {
      // Ensure the chat exists before saving messages
      const existingChat = await getChat(chatId)
      if (!existingChat) {
        await createChat({ id: chatId })
      }
      
      // Save the user message immediately
      const userMessages = convertUIMessagesToNewMessages([message as any as ChatUIMessage], chatId)
      await saveChatMessages({ messages: userMessages })

      const previousMessages = await loadChatMessages(chatId)

      if (!previousMessages || previousMessages.length === 0) {
        const firstPart = message.parts[0]
        const userText = firstPart && "text" in firstPart ? firstPart.text : ""
        const {
          object: { title },
        } = await generateObject({
          model: "openai/gpt-5-mini",
          schema: z.object({
            title: z.string(),
          }),
          prompt: `Your role is to create a title for an AI chat conversation using the "system prompt" and "user message" I provide below.\n
            "system prompt" : ${systemPrompt}\n
            "user message" : ${userText}\n
            `,
        })
        await updateChatTitle(chatId, title)
      }
      // Convert previous messages from database format to UI format
      const previousUIMessages = convertSelectMessagesToChatUIMessages(previousMessages)
      // Add the current user message to the conversation (avoid duplicate if already saved)
      const messageAlreadyInHistory = previousUIMessages.some(msg => msg.id === message.id)
      const allMessages = messageAlreadyInHistory 
        ? previousUIMessages 
        : [...previousUIMessages, message]
      validatedMessages = await validateUIMessages({
        messages: allMessages,
      })
    }
  
    // 2) Build a UI message stream (SSE)
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        // Merge LLM output into the same SSE stream
        if (message && validatedMessages.length > 0 && chatId) {
          const llm = streamText({
            model: model || "openai/gpt-5-mini",
            messages: convertToModelMessages(validatedMessages),
            system: systemPrompt,
            abortSignal: req.signal,
            stopWhen: stepCountIs(10),
            tools: {
              getLossTrends: {
                description: "loss frequency/severity by year for an account",
                inputSchema: z.object({
                  accountId: z.string(),
                }),
                execute: async ({ accountId }) => fetchJson(`/api/mocks/losses/${accountId}`),
              },
              extractSov: {
                description: "Parse SOV and normalize values",
                inputSchema: z.object({
                  sovFileId: z.string(),
                }),
                execute: async ({ sovFileId }) => fetchJson(`/api/mocks/sov/${sovFileId}`),
              },
              startRenewalWorkflow: {
                description: "Kick off durable orchestration of renewal workflow",
                inputSchema: z.object({
                  accountId: z.string(),
                  effectiveDate: z.string(),
                  sovFileId: z.string(),
                  state: z.string(),
                  brokerEmail: z.string(),
                  carriers: z.array(z.string()),
                }),
                execute: async (accountData: RenewalInput) => {
                  const response = await start(renewal, [accountData])
                  return response
                },
              },
            },
          })
          writer.merge(llm.toUIMessageStream())
        }
      },
      onFinish: async ({ responseMessage }) => {
        // Save the AI assistant's response after streaming completes
        if (chatId && responseMessage) {
          const assistantMessages = convertUIMessagesToNewMessages([responseMessage as any as ChatUIMessage], chatId)
          await saveChatMessages({ messages: assistantMessages })
        }
      },
    })

    return createUIMessageStreamResponse({ stream })
  }
  