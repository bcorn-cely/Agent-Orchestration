import { cookies } from "next/headers"
import { CoupaChatbot } from "./chatbot"
import { createChat, loadChatMessages, convertSelectMessagesToChatUIMessages } from "@/lib/chat"
import type { ChatUIMessage } from "@/lib/chat"
import { setChatIdCookie } from "@/actions"

export async function CoupaChatbotWrapper() {
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

  return <CoupaChatbot id={chatId} initialMessages={initialMessages}  />
}

