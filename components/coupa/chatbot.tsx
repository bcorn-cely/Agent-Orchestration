"use client"
import type React from "react"
import { useState, useRef, useEffect, startTransition } from "react"
import { useChat, type UIMessage } from "@ai-sdk/react"
//@ts-ignore
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, Maximize2, Minimize2, Settings, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { setChatIdCookie } from "@/actions"
import { ThinkingLoader } from "@/components/thinking-loader"
import ReactMarkdown from "react-markdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Tool view component for rendering tool invocations inline
function ProcurementRequestToolView({ 
  invocation, 
  addToolApprovalResponse 
}: { 
  invocation: any
  addToolApprovalResponse: (response: { id: string; approved: boolean }) => void
}) {
  if (invocation.state === 'approval-requested') {
    return (
      <div className="p-3 border rounded mb-2 bg-yellow-50 dark:bg-yellow-900/20 max-w-[85%]">
        <div className="text-sm mb-2">
          Approve <b>{invocation.name}</b>?
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(invocation.input, null, 2)}
          </pre>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              addToolApprovalResponse({
                id: invocation.approval.id,
                approved: true,
              })
            }
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              addToolApprovalResponse({
                id: invocation.approval.id,
                approved: false,
              })
            }
          >
            Deny
          </Button>
        </div>
      </div>
    )
  }

  if (invocation.state === 'output-available') {
    return (
      <div className="max-w-[85%] text-xs bg-slate-50 dark:bg-slate-900 border rounded p-2 overflow-x-auto">
        <div className="font-semibold mb-1">Procurement Request Started</div>
        {invocation.output?.purchaseOrder && (
          <div className="text-muted-foreground mt-1">
            Purchase Order {invocation.output.purchaseOrder.poNumber} created
          </div>
        )}
      </div>
    )
  }

  // Handle other states (partial, error, etc.)
  if (invocation.state === 'partial') {
    return (
      <div className="max-w-[85%] text-xs bg-muted/50 border rounded p-2">
        Processing {invocation.name}...
      </div>
    )
  }

  return null
}

const AI_MODELS = [
  { id: "openai/gpt-5-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "xai/grok-4-fast", name: "Grok 4 Fast", provider: "xAI" },
  { id: "xai/grok-2-1212", name: "Grok 2", provider: "xAI" },
]

export function CoupaChatbot({ id, initialMessages }: { id: string; initialMessages?: UIMessage[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalMode, setIsModalMode] = useState(false)
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id)
  const selectedModelRef = useRef(selectedModel)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const [input, setInput] = useState("")

  // Keep ref in sync with state
  useEffect(() => {
    selectedModelRef.current = selectedModel
  }, [selectedModel])

  // Setting the chatId Cookie
  useEffect(() => {
    startTransition(async () => {
      await setChatIdCookie(id)
    })
  }, [id])
  //@ts-ignore
  const { messages, sendMessage, status, addToolApprovalResponse } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat/coupa",
      prepareSendMessagesRequest({ messages, id }: { messages: UIMessage[]; id: string }) {
        return { body: { messages, chatId: id, model: selectedModelRef.current } };
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
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
      const target = event.target as Node
      // Don't close if dropdown is open - let the dropdown handle its own closing
      if (isDropdownOpen) {
        return
      }
      // Check if click is inside the chat window
      if (chatRef.current && !chatRef.current.contains(target)) {
        // Also check if click is inside a dropdown menu (which is in a portal)
        const isDropdownClick = (target as Element).closest('[data-slot="dropdown-menu-content"]') ||
                                (target as Element).closest('[data-slot="dropdown-menu-portal"]')
        if (!isDropdownClick) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen, isDropdownOpen])

  useEffect(() => {
    if (messagesRef.current && isOpen && messages.length > 0) {
      const lastMessage = messagesRef.current.lastElementChild
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "instant" })
      }
    }
  }, [isOpen, messages.length])

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-110",
          "before:absolute before:inset-0 before:rounded-full before:bg-primary/20 before:animate-ping before:duration-2000",
          isOpen && "rotate-180 scale-95",
        )}
        size="icon"
      >
        {isOpen ? <X className="h-7 w-7" /> : <ShoppingCart className="h-7 w-7" />}
      </Button>

      {isOpen && isModalMode && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" />}
      {isOpen && !isModalMode && <div className="fixed inset-0 z-30" />}

      {/* Chat Window */}
      {isOpen && (
        <div ref={chatRef}>
          <Card
            className={cn(
              "pt-0 pb-6 flex flex-col shadow-2xl border-2 border-primary/20 bg-card backdrop-blur-sm",
              isModalMode
                ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[90vw] max-w-4xl h-[85vh]"
                : "fixed bottom-24 right-6 z-40 w-[420px] h-[650px]",
            )}
          >
            <div className="px-6 pb-5 pt-4 border-b border-primary/20 bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground rounded-t-xl" style={{ minHeight: 'fit-content' }}>
              <div className="flex items-center justify-between" style={{ contain: 'layout style' }}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Coupa Procurement Assistant</h3>
                </div>
                <div className="flex items-center gap-2 relative" style={{ contain: 'layout', transform: 'translateZ(0)' }}>
                  <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 min-w-8 min-h-8 hover:bg-primary-foreground/10 text-primary-foreground focus-visible:ring-0 focus-visible:ring-offset-0 outline-none focus:outline-none data-[state=open]:bg-primary-foreground/10"
                        style={{ willChange: 'auto', transform: 'translateZ(0)' }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-64" 
                      onCloseAutoFocus={(e) => e.preventDefault()}
                      style={{ 
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        animation: 'none'
                      }}
                    >
                      <DropdownMenuLabel>Select AI Model</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onSelect={() => {
                            setSelectedModel(model.id)
                          }}
                          className={cn(
                            "cursor-pointer",
                            selectedModel === model.id && "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className={cn("font-medium", selectedModel === model.id && "text-white")}>
                              {model.name}
                            </span>
                            <span className={cn("text-xs text-muted-foreground", selectedModel === model.id && "text-white/80")}>
                              {model.provider}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsModalMode(!isModalMode)}
                    className="h-8 w-8 hover:bg-primary-foreground/10 text-primary-foreground"
                  >
                    {isModalMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm opacity-90 mt-1">Your AI-powered procurement assistant</p>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-2">Welcome to Coupa</p>
                  <p className="text-sm mb-4">I can help you with:</p>
                  <div className="grid gap-2 text-left max-w-xs mx-auto">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Creating procurement requests</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Finding suppliers and getting quotes</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Checking policy compliance</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Creating purchase orders</span>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={cn("flex flex-col gap-2", message.role === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/60 text-gray-900 rounded-bl-sm border border-border/50",
                    )}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="leading-relaxed my-2 first:mt-0 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="my-2 list-disc list-inside">{children}</ul>,
                        ol: ({ children }) => <ol className="my-2 list-decimal list-inside">{children}</ol>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                        h1: ({ children }) => <h1 className="text-base font-bold my-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-semibold my-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-medium my-1">{children}</h3>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                          <code className="text-xs bg-black/10 px-1 py-0.5 rounded">{children}</code>
                        ),
                      }}
                    >
                      {message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Tool invocations - render inline with assistant messages */}
                  {message.role === "assistant" &&
                    message.parts
                      ?.filter((p: any) => p.type?.startsWith('tool-'))
                      .map((part: any, i: number) => {
                        // Convert tool part to invocation format
                        const toolName = part.type.replace('tool-', '')
                        const invocation = {
                          id: part.toolCallId || `tool-${i}`,
                          name: toolName,
                          input: part.input || {},
                          state: part.state || 'partial',
                          approval: part.approval,
                          output: part.output,
                        }
                        
                        // Only render if it's a tool we want to show (e.g., procurementRequest)
                        if (toolName === 'procurementRequest') {
                          return (
                            <ProcurementRequestToolView
                              key={invocation.id}
                              invocation={invocation}
                              addToolApprovalResponse={addToolApprovalResponse}
                            />
                          )
                        }
                        return null
                      })}
                </div>
              ))}

              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3 border border-border/50 shadow-sm">
                    <ThinkingLoader />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="px-4 pt-4 border-t border-border/50">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Request items, check suppliers, create POs..."
                  className="flex-1 rounded-xl bg-muted/50 border-border/50 focus-visible:ring-primary"
                  autoComplete="off"
                  disabled={status === "submitted"}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={status === "submitted" || !input.trim()}
                  className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/90"
                >
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

