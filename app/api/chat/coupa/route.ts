import {
    // @ts-ignore
  createUIMessageStreamResponse,
  validateUIMessages,
  convertToModelMessages,
  createAgentUIStream,
  generateId,
} from 'ai';
import { createProcurementAgent } from '@/workflows/coupa/agent/procurement-agent';
import { loadChatMessages, convertSelectMessagesToChatUIMessages, convertUIMessagesToNewMessages, saveChatMessages, getChat, type ChatUIMessage } from '@/lib/chat';
import { createChat } from '@/db/operations/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';



export async function POST(req: Request) {
  const body = await req.json();
  const { 
    messages, 
    chatId, 
    model: modelId,
    // Extract callOptions from request body for AI SDK 6 A/B testing
    // Note: taskComplexity is NOT a runtime input - it's predetermined by the developer
    // based on which tools are used or the nature of the request
  } = body as {
    messages?: ChatUIMessage[];
    chatId?: string;
    model?: string; // Runtime input for model selection
  };
  
  console.log('[API Route] Received request with:', {
    modelId: modelId || 'No Model Selected',
  }, '\n\n');

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
      const newUserMessage = messages[messages.length - 1];
      
      console.log('already have messages');
        const userMessagesToSave = convertUIMessagesToNewMessages([newUserMessage], chatId);
        saveChatMessages({ messages: userMessagesToSave });
      
      }
    else {
      // No messages provided, load from DB
      const previousMessages = await loadChatMessages(chatId);
      allMessages = convertSelectMessagesToChatUIMessages(previousMessages);
    }
  }

  // Validate messages
  const validatedMessages = await validateUIMessages({
    messages: allMessages,
    // messages: validMessages,
  });

  // Create agent with default model(model will be selected dynamically via prepareCall based on callOptions)
  const defaultModelId = 'openai/gpt-4o-mini';
  const agent = createProcurementAgent(defaultModelId);

  // Build callOptions object for AI SDK 6
  // Only abTestVariant is passed as runtime input (user-selectable in chat)
  // taskComplexity is determined automatically by prepareCall() based on tools/prompt
  const callOptions = modelId ? { selectedModel: modelId } : undefined;

  // Create agent stream with callOptions
  // The agent's prepareCall() function will:
  // 1. Determine task complexity based on tools/prompt (predetermined by developer)
  // 2. Route to A/B test variants if specified (runtime input from user)
  // 3. Select appropriate model and adjust parameters accordingly
  const agentStream = await createAgentUIStream({
    agent,
    messages: validatedMessages,
    // Pass callOptions to the agent - enables A/B testing (runtime input)
    // Task complexity is determined automatically in prepareCall()
    options: callOptions,
    sendStart: true,
    sendFinish: true,
    onFinish: async ({ responseMessage }: any) => {
        if (responseMessage && chatId) {
            const newResponseMessage = responseMessage as ChatUIMessage;
            newResponseMessage.id =  newResponseMessage.id || generateId();
            const assistantMessages = convertUIMessagesToNewMessages([newResponseMessage], chatId);
            await saveChatMessages({ messages: assistantMessages });
        }
    }
  })


  // @ts-ignore
  return createUIMessageStreamResponse({ stream: agentStream });
}

