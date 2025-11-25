import { cookies } from "next/headers"
import { Chatbot } from "./chatbot"
import { createChat, loadChatMessages, convertSelectMessagesToChatUIMessages } from "@/lib/chat"
import type { ChatUIMessage } from "@/lib/chat"

export async function ChatbotWrapper() {
  const cookieStore = await cookies()
  let chatId = cookieStore.get('chat_id')?.value

  // Generate new chatId if it doesn't exist
  if (!chatId) {
    chatId = await createChat()
    // Set the cookie with the new chatId using Server Action
  }

  // Fetch initial messages for this chat
  const messages = await loadChatMessages(chatId)
  const initialMessages: ChatUIMessage[] = convertSelectMessagesToChatUIMessages(messages)

  return <Chatbot id={chatId} initialMessages={initialMessages}  />
}

