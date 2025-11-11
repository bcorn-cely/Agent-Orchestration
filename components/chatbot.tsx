"use client"
import { DefaultChatTransport } from "ai"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat, type UIMessage } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export function Chatbot({ id, initialMessages }: { id?: string | undefined; initialMessages?: UIMessage[] } = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const [input, setInput] = useState("")

  const { messages, sendMessage } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, id }) {
        return { body: { message: messages[messages.length - 1], chatId: id } }
      },
    }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: input }],
      })
      setInput("")
    }
  }

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }

  }, [isOpen])

  useEffect(() => {
    if (messagesRef.current && isOpen && messages.length > 0) {
      const lastMessage = messagesRef.current.lastElementChild
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'instant' })
      }
    }
  }, [isOpen, messages.length])

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-200",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "rotate-180",
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {isOpen && <div className="fixed inset-0 z-30" />}

      {/* Chat Window */}
      {isOpen && (
        <div ref={chatRef}>
        <Card
          className="pt-0 pb-6 fixed bottom-24 right-6 z-40 w-96 h-[600px] flex flex-col shadow-xl border-0 bg-card"
        >
          {/* Header */}
          <div className="px-4 pb-4 pt-3 border-b bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold">Real Estate Assistant</h3>
            <p className="text-sm opacity-90">Ask me about properties!</p>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                <p>👋 Hi! I'm here to help you with real estate questions.</p>
                <p className="mt-2">Ask me about:</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Property types</li>
                  <li>• Market insights</li>
                  <li>• Buying/selling process</li>
                </ul>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about real estate..."
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
        </div>
      )}
    </>
  )
}
