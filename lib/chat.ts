import { generateId, UIMessage, ToolSet, InferUITools, tool } from 'ai';
import { getMessages as getMessagesOperation, saveMessages as saveMessagesOperation } from '@/db/operations/message';
import { createChat as createChatOperation, getChat as getChatOperation } from '@/db/operations/chat';
import type{ Chat, Message, NewMessage } from '@/db/schema';
import { z } from 'zod';

// Define metadata schema for chat messages
const chatMetadataSchema = z.object({
  chatId: z.string(),
  createdAt: z.date().optional(),
});

// Define data parts schema (empty for now, can be extended later)
const chatDataPartsSchema = z.object({});

// Define tools schema (empty for now, can be extended later)
const tools = {} satisfies ToolSet;

// Create custom UIMessage type
type ChatMetadata = z.infer<typeof chatMetadataSchema>;
type ChatDataParts = z.infer<typeof chatDataPartsSchema>;
type ChatTools = InferUITools<typeof tools>;

export type ChatUIMessage = UIMessage<ChatMetadata, ChatDataParts, ChatTools>;


export function convertUIMessagesToNewMessages(messages: ChatUIMessage[], chatId: string): NewMessage[] {
    return messages.map(message => ({
        id: message.id,
        chatId: chatId,
        role: message.role,
        content: JSON.stringify(message.parts),
    }));
}


export function convertSelectMessagesToChatUIMessages(messages: Message[]): ChatUIMessage[] {
    return messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        metadata: {
            chatId: msg.chatId,
            createdAt: msg.createdAt
        },
        parts: JSON.parse(msg.content)
    }));
}


export async function createChat(): Promise<string> {
    const id = generateId();
    await createChatOperation({ id });
    return id;
}


export async function getChat(id: string): Promise<Chat | null> {
    let chat;
    try {
        chat = await getChatOperation(id);
    } catch (error) {
        if(error instanceof Error && error.message.includes('SQLITE_NOT_FOUND')) {
            return null;
        }
        throw error;
    }
    return chat || null;
}


export async function loadChatMessages(id: string): Promise<Message[]> {
    let messages;
    try {
        messages = await getMessagesOperation(id);
    } catch (error) {
        if(error instanceof Error && error.message.includes('SQLITE_NOT_FOUND')) {
            return [];
        }
        throw error;
    }
    return messages || [];
}


export async function saveChatMessages({
    messages,
}: { messages: NewMessage[] }) {
    let savedMessages;
    try {
        savedMessages = await saveMessagesOperation(messages);
    } catch (error) {
        throw error;
    }
    return savedMessages;
}
