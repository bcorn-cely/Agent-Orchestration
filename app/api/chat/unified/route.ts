/**
 * Unified Chat API Route
 * 
 * API endpoint for the unified multi-workflow chatbot.
 * Uses the unified orchestrator agent that can trigger any workflow.
 */

import {
  createAgentUIStream,
  createUIMessageStreamResponse,
  validateUIMessages,
} from 'ai';
import { createUnifiedOrchestratorAgent } from '@/workflows/unified-orchestrator/orchestrator-agent';
import { loadChatMessages, convertSelectMessagesToChatUIMessages, convertUIMessagesToNewMessages, saveChatMessages, getChat, type ChatUIMessage } from '@/lib/chat';
import { createChat } from '@/db/operations/chat';
import { generateId } from 'ai';

/**
 * POST Handler for Chat Messages
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { messages, chatId, model: modelId } = body as {
    messages?: ChatUIMessage[];
    chatId?: string;
    model?: string;
  };

  console.log('[Unified Chat API] Received request', {
    chatId,
    modelId: modelId || 'No Model Selected',
    messageCount: messages?.length || 0,
  });

  // Handle chat history and persistence
  let allMessages: ChatUIMessage[] = messages || [];
  if (chatId) {
    const existingChat = await getChat(chatId);
    if (!existingChat) {
      await createChat({ id: chatId });
    }

    if (messages && messages.length > 0) {
      allMessages = messages;
      const previousMessages = await loadChatMessages(chatId);
      const existingIds = new Set(previousMessages.map(m => m.id));
      const newUserMessages = allMessages.filter(m => m.role === 'user' && !existingIds.has(m.id));
      if (newUserMessages.length > 0) {
        const userMessagesToSave = convertUIMessagesToNewMessages(newUserMessages, chatId);
        await saveChatMessages({ messages: userMessagesToSave });
      }
    } else {
      const previousMessages = await loadChatMessages(chatId);
      allMessages = convertSelectMessagesToChatUIMessages(previousMessages);
    }
  }

  // Validate messages
  const validMessages = allMessages.filter((message) => {
    if (!message.parts || message.parts.length === 0) {
      return false;
    }
    return true;
  });

  // Ensure we have at least one valid message
  if (validMessages.length === 0) {
    return Response.json(
      { error: 'No valid messages provided' },
      { status: 400 }
    );
  }

  const validatedMessages = await validateUIMessages({
    messages: validMessages,
  });

  // Ensure validated messages exist
  if (!validatedMessages || validatedMessages.length === 0) {
    return Response.json(
      { error: 'Message validation failed' },
      { status: 400 }
    );
  }

  // Create unified orchestrator agent
  const defaultModelId = 'openai/gpt-4o-mini';
  const agent = createUnifiedOrchestratorAgent(defaultModelId);

  const callOptions = modelId ? { selectedModel: modelId } : undefined;

  // Create agent stream
  const agentStream = await createAgentUIStream({
    agent,
    messages: validatedMessages,
    originalMessages: allMessages,
    options: callOptions,
    sendStart: true,
    sendFinish: true,
    onFinish: async ({ responseMessage }: any) => {
      if (responseMessage && chatId) {
        const newResponseMessage = responseMessage as ChatUIMessage;
        newResponseMessage.id = newResponseMessage.id || generateId();
        const assistantMessages = convertUIMessagesToNewMessages([newResponseMessage], chatId);
        await saveChatMessages({ messages: assistantMessages });
      }
    },
  });

  // @ts-ignore
  return createUIMessageStreamResponse({ stream: agentStream });
}

