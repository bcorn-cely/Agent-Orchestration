import {
    // @ts-ignore
  createUIMessageStreamResponse,
  validateUIMessages,
  convertToModelMessages,
  createUIMessageStream,
  generateId,
} from 'ai';
import { createProcurementAgent } from '@/workflows/coupa/agent/procurement-agent';
import { loadChatMessages, convertSelectMessagesToChatUIMessages, convertUIMessagesToNewMessages, saveChatMessages, getChat, type ChatUIMessage } from '@/lib/chat';
import { createChat } from '@/db/operations/chat';
import { start } from 'workflow/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;


export async function POST(req: Request) {
  const body = await req.json();
  const { messages, chatId, model: modelId } = body as {
    messages?: ChatUIMessage[];
    chatId?: string;
    model?: string;
  };
  console.log('model id ', modelId);
  // Handle chat history if chatId is provided
  // IMPORTANT: When messages are provided (including after approval), use them directly
  // The client sends the complete conversation state, so we should trust it
  let allMessages: ChatUIMessage[] = messages || [];
  if (chatId) {
    // Ensure the chat exists
    const existingChat = await getChat(chatId);
    if (!existingChat) {
      await createChat({ id: chatId });
    }

    // If messages are provided, use them directly (client has the full conversation state)
    // Only load from DB if no messages are provided
    if (messages && messages.length > 0) {
      allMessages = messages;
      
      // Save new user messages to DB for persistence (avoid duplicates)
      const previousMessages = await loadChatMessages(chatId);
      const existingIds = new Set(previousMessages.map(m => m.id));
      const newUserMessages = allMessages.filter(m => m.role === 'user' && !existingIds.has(m.id));
      if (newUserMessages.length > 0) {
        const userMessagesToSave = convertUIMessagesToNewMessages(newUserMessages, chatId);
        await saveChatMessages({ messages: userMessagesToSave });
      }
    } else {
      // No messages provided, load from DB
      const previousMessages = await loadChatMessages(chatId);
      allMessages = convertSelectMessagesToChatUIMessages(previousMessages);
    }
  }

  // Filter out invalid messages (empty parts, etc.) before validation
  const validMessages = allMessages.filter((message) => {
    // Messages must have at least one part
    if (!message.parts || message.parts.length === 0) {
      return false;
    }
    return true;
  });


  // Validate messages
  const validatedMessages = await validateUIMessages({
    messages: validMessages,
  });

  const modelMessages = convertToModelMessages(validatedMessages);


  // 1) Create agent with the selected model (default to gpt-4o-mini if not provided)
  const selectedModelId = modelId || 'openai/gpt-4o-mini';

  const run = await start(createProcurementAgent, [modelMessages, selectedModelId]);

  const wrappedStream = createUIMessageStream({
    execute: async ({writer}) => {
        writer.merge(run.readable);
    },
    onFinish: async ({responseMessage}) => {
        console.log('responseMessage', responseMessage);
        if (responseMessage && chatId) {
            const newResponseMessage = responseMessage as ChatUIMessage;
            newResponseMessage.id =  newResponseMessage.id || generateId();
            const assistantMessages = convertUIMessagesToNewMessages([newResponseMessage], chatId);
            await saveChatMessages({ messages: assistantMessages });
        }
        if('approval' in responseMessage) {
            console.log('approval', responseMessage.approval);
        }
        
    }
  })
  // @ts-ignore
  return createUIMessageStreamResponse({ stream: wrappedStream });
}

