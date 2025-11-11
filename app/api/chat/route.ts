import { 
    convertToModelMessages, 
    streamText, 
    validateUIMessages, 
    createIdGenerator,
    generateObject
  } from "ai"
  import { saveChatMessages, loadChatMessages, convertUIMessagesToNewMessages, convertSelectMessagesToChatUIMessages, ChatUIMessage } from "@/lib/chat"
  import { z } from "zod"
  import { updateChatTitle } from "@/db/operations/chat"
  
  
  export const maxDuration = 30
  
  
  export async function POST(req: Request) {
    const { message, chatId } = await req.json()
  
    const systemPrompt = `You are a helpful real estate assistant for Premier Properties, a luxury real estate company. 
    
    Your role is to:
    - Help users find information about properties
    - Answer questions about buying, selling, or renting real estate
    - Provide general real estate market insights
    - Guide users to contact the team for specific property inquiries
    - Be professional, knowledgeable, and friendly
    
    Keep responses concise and helpful. If users ask about specific properties, encourage them to contact the team directly for the most up-to-date information and to schedule viewings.`
  
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
      model: "openai/gpt-5-mini", // AI Gateway model format
      messages: convertToModelMessages(validatedMessages),
      system: systemPrompt,
      abortSignal: req.signal,
      temperature: 0.7,
      // maxSteps: 10,
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
  