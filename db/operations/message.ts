import { db } from "../client";
import type { Message, NewMessage } from "../schema";
import { messages } from "../schema";
import { eq } from "drizzle-orm";

export async function createMessage(message: NewMessage): Promise<Message> {
    const result = await db.insert(messages).values({
        id: message.id,
        chatId: message.chatId,
        role: message.role,
        content: message.content,
    }).returning();
    
    console.log('savedMessage ', result[0]);
    return result[0];
}

export async function getMessages(chatId: string): Promise<Message[]> {
    try {
        const result = await db.select().from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(messages.createdAt);
        return result || [];
    } catch (error) {
        console.error('Error getting messages:', error);
        return [];
    }
}

export async function saveMessages(newMessages: NewMessage[]): Promise<Message[]> {
    if (newMessages.length === 0) {
        return [];
    }

    const result = await db.insert(messages).values(
        newMessages.map(msg => ({
            id: msg.id,
            chatId: msg.chatId,
            role: msg.role,
            content: msg.content,
        }))
    ).returning();
    
    return result;
}
