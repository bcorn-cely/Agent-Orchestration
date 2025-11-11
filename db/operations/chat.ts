import { db } from "../client";
import type { Chat, NewChat } from "../schema";
import { chats } from "../schema";
import { eq } from "drizzle-orm";

export async function createChat(chat: NewChat): Promise<Chat> {
    try {
        const result = await db.insert(chats).values({
            id: chat.id,
            title: chat.title ?? null,
        }).returning();
        
        console.log('createdChat ', result);
        return result[0];
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
}

export async function getChat(chatId: string): Promise<Chat | null> {
    const result = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1);
    return result[0] || null;
}

export async function getAllChats(): Promise<Chat[]> {
    const result = await db.select().from(chats).orderBy(chats.updatedAt);
    return result;
}

export async function updateChatTitle(chatId: string, title: string): Promise<Chat | null> {
    const result = await db.update(chats)
        .set({ 
            title: title,
            updatedAt: new Date(),
        })
        .where(eq(chats.id, chatId))
        .returning();
    
    return result[0] || null;
}
