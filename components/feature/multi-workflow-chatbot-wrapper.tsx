/**
 * Multi-Workflow Chatbot Wrapper
 * 
 * Server component that wraps the MultiWorkflowChatbot client component.
 * Handles chat persistence.
 */

import { Suspense } from "react"
import { cookies } from "next/headers"
import { MultiWorkflowChatbot } from "./multi-workflow-chatbot"
import { createChat, loadChatMessages, convertSelectMessagesToChatUIMessages } from "@/lib/chat"
import type { ChatUIMessage } from "@/lib/chat"
import { Card } from "@/components/ui/card"
import { Building2 } from "lucide-react"

/**
 * Multi-Workflow Chatbot Wrapper Component
 */
export async function MultiWorkflowChatbotWrapper() {
  const cookieStore = await cookies()
  let chatId = cookieStore.get('chat_id')?.value

  // Generate new chatId if it doesn't exist
  if (!chatId) {
    chatId = await createChat()
  }

  // Fetch initial messages for this chat
  const messages = await loadChatMessages(chatId)
  const initialMessages: ChatUIMessage[] = convertSelectMessagesToChatUIMessages(messages)

  return (
    <Suspense fallback={
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="p-4 border-blue-500/20">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600 animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading chatbot...</span>
          </div>
        </Card>
      </div>
    }>
      <MultiWorkflowChatbot id={chatId} initialMessages={initialMessages} initialWorkflow="org-validation" />
    </Suspense>
  )
}

