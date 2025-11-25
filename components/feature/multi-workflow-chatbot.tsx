/**
 * Multi-Workflow Chatbot Component
 * 
 * Unified chatbot that supports multiple workflows:
 * - Contract Management
 * - Organization Validation
 * - Deal Verification
 * - Teacher Verification
 * 
 * Switches between different chat API endpoints based on selected workflow.
 */

"use client"
import type React from "react"
import { useState, useRef, useEffect, startTransition } from "react"
import { useChat, type UIMessage } from "@ai-sdk/react"
//@ts-ignore
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, FileText, Maximize2, Minimize2, Settings, Scale, ShieldCheck, Building2, ShoppingBag, UserCheck, CheckCircle2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Available workflows
export type WorkflowType = 'contract-management' | 'org-validation' | 'deal-verification' | 'teacher-verification';

const WORKFLOWS = [
  { 
    id: 'contract-management' as WorkflowType, 
    name: 'Contract Management', 
    description: 'Draft contracts, detect risks, manage approvals',
    icon: Scale,
    apiPath: '/api/chat/unified',
  },
  { 
    id: 'org-validation' as WorkflowType, 
    name: 'Organization Validation', 
    description: 'Validate organizations by domain with parallel workers',
    icon: Building2,
    apiPath: '/api/chat/unified',
  },
  { 
    id: 'deal-verification' as WorkflowType, 
    name: 'Deal Verification', 
    description: 'Verify retail deals with browser automation',
    icon: ShoppingBag,
    apiPath: '/api/chat/unified',
  },
  { 
    id: 'teacher-verification' as WorkflowType, 
    name: 'Teacher Verification', 
    description: 'Verify teacher community membership',
    icon: UserCheck,
    apiPath: '/api/chat/unified',
  },
];

/**
 * Organization Validation Tool View Component
 */
function OrgValidationToolView({ 
  invocation, 
  addToolApprovalResponse,
}: { 
  invocation: any
  addToolApprovalResponse: (response: { id: string; approved: boolean }) => void
}) {
  if (invocation.state === 'approval-requested') {
    const input = invocation.input || {};
    const domain = input.domain || 'N/A';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border-2 border-green-500/30 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">Organization Validation Approval Required</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Domain</span>
                <span className="text-sm font-semibold text-card-foreground font-mono">{domain}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  This will run parallel worker agents (Legal Scout, Sector Analyst, Trust Officer) to validate the organization.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button
                size="sm"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: true,
                  })
                }
                className="flex-1 bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                Approve Validation
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: false,
                  })
                }
                className="flex-1 border-border hover:bg-muted"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'output-available') {
    const output = invocation.output || {};
    const runId = output.runId || 'N/A';
    const domain = output.domain || invocation.input?.domain || 'N/A';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-green-500/20 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-card-foreground mb-1">Organization Validation Started</div>
              <div className="text-xs text-muted-foreground">
                Domain: <span className="font-mono text-green-600 dark:text-green-400">{domain}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Run ID: <span className="font-mono text-green-600 dark:text-green-400">{runId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'partial') {
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-card-foreground">Processing organization validation...</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Deal Verification Tool View Component
 */
function DealVerificationToolView({ 
  invocation, 
  addToolApprovalResponse,
}: { 
  invocation: any
  addToolApprovalResponse: (response: { id: string; approved: boolean }) => void
}) {
  if (invocation.state === 'approval-requested') {
    const input = invocation.input || {};
    const partnerUrl = input.partnerUrl || 'N/A';
    const offerId = input.offerId || input.shopUrl || 'N/A';
    const expectedDiscount = input.expectedDiscount || 'N/A';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border-2 border-purple-500/30 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-purple-500/10 border-b border-purple-500/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Deal Verification Approval Required</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Partner URL</span>
                <span className="text-sm font-semibold text-card-foreground font-mono text-xs break-all">{partnerUrl}</span>
              </div>
              {offerId !== 'N/A' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Offer ID</span>
                  <span className="text-sm text-card-foreground">{offerId}</span>
                </div>
              )}
              {expectedDiscount !== 'N/A' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expected Discount</span>
                  <span className="text-sm text-card-foreground">{expectedDiscount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  This will verify the deal using browser automation (Playwright) or HTTP probes.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button
                size="sm"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: true,
                  })
                }
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                Approve Verification
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: false,
                  })
                }
                className="flex-1 border-border hover:bg-muted"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'output-available') {
    const output = invocation.output || {};
    const runId = output.runId || 'N/A';
    const partnerUrl = output.partnerUrl || invocation.input?.partnerUrl || 'N/A';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-purple-500/20 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-card-foreground mb-1">Deal Verification Started</div>
              <div className="text-xs text-muted-foreground">
                Partner: <span className="font-mono text-purple-600 dark:text-purple-400 text-xs">{partnerUrl}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Run ID: <span className="font-mono text-purple-600 dark:text-purple-400">{runId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'partial') {
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-sm text-card-foreground">Processing deal verification...</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Teacher Verification Tool View Component
 */
function TeacherVerificationToolView({ 
  invocation, 
  addToolApprovalResponse,
}: { 
  invocation: any
  addToolApprovalResponse: (response: { id: string; approved: boolean }) => void
}) {
  if (invocation.state === 'approval-requested') {
    const input = invocation.input || {};
    const memberId = input.memberId || input.memberName || 'N/A';
    const state = input.state || 'N/A';
    const msrId = input.msrId || 'N/A';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border-2 border-orange-500/30 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Teacher Verification Approval Required</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Member</span>
                <span className="text-sm font-semibold text-card-foreground">{memberId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State</span>
                <span className="text-sm text-card-foreground">{state}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">MSR ID</span>
                <span className="text-sm text-card-foreground">{msrId}</span>
              </div>
              {input.dateOfBirth && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</span>
                  <span className="text-sm text-card-foreground">{input.dateOfBirth}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  This will query the state registry and require MSR approval before completion.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button
                size="sm"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: true,
                  })
                }
                className="flex-1 bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                Approve Verification
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: false,
                  })
                }
                className="flex-1 border-border hover:bg-muted"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'output-available') {
    const output = invocation.output || {};
    const runId = output.runId || 'N/A';
    const memberId = output.memberId || invocation.input?.memberId || 'N/A';
    const state = output.state || invocation.input?.state || 'N/A';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-orange-500/20 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-card-foreground mb-1">Teacher Verification Started</div>
              <div className="text-xs text-muted-foreground">
                Member: <span className="text-orange-600 dark:text-orange-400">{memberId}</span> ({state})
              </div>
              <div className="text-xs text-muted-foreground">
                Run ID: <span className="font-mono text-orange-600 dark:text-orange-400">{runId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'partial') {
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-sm text-card-foreground">Processing teacher verification...</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Contract Draft Tool View Component (reused from chatbot.tsx pattern)
 */
function ContractDraftToolView({ 
  invocation, 
  addToolApprovalResponse,
}: { 
  invocation: any
  addToolApprovalResponse: (response: { id: string; approved: boolean }) => void
}) {
  if (invocation.state === 'approval-requested') {
    const input = invocation.input || {};
    const contractType = input.contractType || 'Contract';
    const jurisdiction = input.jurisdiction || 'N/A';
    const requesterRole = input.requesterRole || 'requester';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border-2 border-blue-500/30 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Contract Draft Approval Required</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contract Type</span>
                <span className="text-sm font-semibold text-card-foreground">{contractType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Jurisdiction</span>
                <span className="text-sm text-card-foreground">{jurisdiction}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Requester Role</span>
                <span className="text-sm text-card-foreground capitalize">{requesterRole}</span>
              </div>
              {input.parties && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Parties</span>
                  <div className="text-sm text-card-foreground">
                    <div>{input.parties.party1?.name} ({input.parties.party1?.role})</div>
                    <div>{input.parties.party2?.name} ({input.parties.party2?.role})</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button
                size="sm"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: true,
                  })
                }
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Approve Draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addToolApprovalResponse({
                    id: invocation.approval.id,
                    approved: false,
                  })
                }
                className="flex-1 border-border hover:bg-muted"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'output-available') {
    const output = invocation.output || {};
    const contractId = output.contractId || output.runId || 'N/A';
    
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-blue-500/20 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-card-foreground mb-1">Contract Draft Initiated</div>
              <div className="text-xs text-muted-foreground">
                Contract ID: <span className="font-mono text-blue-600 dark:text-blue-400">{contractId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invocation.state === 'partial') {
    return (
      <div className="max-w-[85%] mb-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm text-card-foreground">Processing contract draft...</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Available AI models
const AI_MODELS = [
  { id: '', name: 'Auto (Smart Routing)', provider: 'System' },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", cost: "Cheap" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", cost: "Premium" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic", cost: "Premium" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", cost: "Premium" },
];

/**
 * Multi-Workflow Chatbot Main Component
 */
export function MultiWorkflowChatbot({ 
  id, 
  initialMessages,
  initialWorkflow = 'org-validation',
}: { 
  id: string
  initialMessages?: UIMessage[]
  initialWorkflow?: WorkflowType
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalMode, setIsModalMode] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>(initialWorkflow)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const [input, setInput] = useState("")

  const currentWorkflow = WORKFLOWS.find(w => w.id === selectedWorkflow) || WORKFLOWS[0];
  const WorkflowIcon = currentWorkflow.icon;

  // Set chat ID cookie for persistence
  useEffect(() => {
    startTransition(async () => {
      await setChatIdCookie(id)
    })
  }, [id])
  
  // Initialize chat hook with workflow-specific API endpoint
  //@ts-ignore
  const { messages, sendMessage, status, addToolApprovalResponse } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: currentWorkflow.apiPath,
      prepareSendMessagesRequest({ messages, id }: { messages: UIMessage[]; id: string }) {
        return { body: { messages, chatId: id, model: selectedModel } };
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  })

  // Reset messages when workflow changes
  useEffect(() => {
    // Clear messages when switching workflows (optional - you might want to keep history)
    // For now, we'll keep messages but the API endpoint will change
  }, [selectedWorkflow])

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
      if (isDropdownOpen) {
        return
      }
      if (chatRef.current && !chatRef.current.contains(target)) {
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
          "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-110",
          "before:absolute before:inset-0 before:rounded-full before:bg-blue-500/20 before:animate-ping before:duration-2000",
          isOpen && "rotate-180 scale-95",
        )}
        size="icon"
      >
        {isOpen ? <X className="h-7 w-7" /> : <WorkflowIcon className="h-7 w-7" />}
      </Button>

      {isOpen && isModalMode && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" />}
      {isOpen && !isModalMode && <div className="fixed inset-0 z-30" />}

      {/* Chat Window */}
      {isOpen && (
        <div ref={chatRef}>
          <Card
            className={cn(
              "pt-0 pb-6 flex flex-col shadow-2xl border-2 border-blue-500/20 bg-card backdrop-blur-sm",
              isModalMode
                ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[90vw] max-w-4xl h-[85vh]"
                : "fixed bottom-24 right-6 z-40 w-[420px] h-[650px]",
            )}
          >
            <div className="px-6 pb-5 pt-4 border-b border-blue-500/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white rounded-t-xl" style={{ minHeight: 'fit-content' }}>
              <div className="flex items-center justify-between" style={{ contain: 'layout style' }}>
                <div className="flex items-center gap-2">
                  <WorkflowIcon className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">{currentWorkflow.name} AI</h3>
                </div>
                <div className="flex items-center gap-2 relative" style={{ contain: 'layout', transform: 'translateZ(0)' }}>
                  <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 min-w-8 min-h-8 hover:bg-white/10 text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none focus:outline-none data-[state=open]:bg-white/10"
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
                      <DropdownMenuLabel>Select Workflow</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {WORKFLOWS.map((workflow) => {
                        const Icon = workflow.icon;
                        return (
                          <DropdownMenuItem
                            key={workflow.id}
                            onSelect={() => {
                              setSelectedWorkflow(workflow.id);
                            }}
                            className={cn(
                              "cursor-pointer",
                              selectedWorkflow === workflow.id && "bg-blue-600 text-white"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className={cn("font-medium", selectedWorkflow === workflow.id && "text-white")}>
                                  {workflow.name}
                                </span>
                                <span className={cn("text-xs text-muted-foreground", selectedWorkflow === workflow.id && "text-white/80")}>
                                  {workflow.description}
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Select AI Model</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onSelect={() => {
                            setSelectedModel(model.id || undefined)
                          }}
                          className={cn(
                            "cursor-pointer",
                            selectedModel === model.id && "bg-blue-600 text-white"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className={cn("font-medium", selectedModel === model.id && "text-white")}>
                              {model.name}
                            </span>
                            <span className={cn("text-xs text-muted-foreground", selectedModel === model.id && "text-white/80")}>
                              {model.provider} {model.cost && `• ${model.cost}`}
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
                    className="h-8 w-8 hover:bg-white/10 text-white"
                  >
                    {isModalMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm opacity-90">AI-powered workflow automation</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-card">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 mb-4">
                    <WorkflowIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-2">AI Workflows Assistant</p>
                  <p className="text-sm text-muted-foreground mb-4">I can help you with multiple automated workflows</p>
                  <div className="grid gap-2 text-left max-w-xs mx-auto">
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span><strong>Organization Validation:</strong> Validate organizations by domain using parallel worker agents</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span><strong>Deal Verification:</strong> Verify retail deals with browser automation or HTTP probes</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span><strong>Teacher Verification:</strong> Verify teacher membership via state registry with MSR approval</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">Try: "Validate reebok.com" or "Verify a deal" or "Verify teacher John Doe in California"</p>
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
                        ? "bg-blue-600 text-white rounded-br-sm dark:bg-blue-500"
                        : "bg-card border border-border rounded-bl-sm text-card-foreground",
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
                          <code className="text-xs bg-muted px-1 py-0.5 rounded text-foreground">{children}</code>
                        ),
                      }}
                    >
                      {message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Render tool invocations inline with assistant messages */}
                  {message.role === "assistant" &&
                    message.parts
                      ?.filter((p: any) => p.type?.startsWith('tool-'))
                      .map((part: any, i: number) => {
                        const toolName = part.type.replace('tool-', '')
                        const toolCallId = part.toolCallId || part.id || part.toolUseId || part.toolCall?.id || `tool-${i}`
                        const invocation = {
                          id: toolCallId,
                          name: toolName,
                          input: part.input || {},
                          state: part.state || 'partial',
                          approval: part.approval,
                          output: part.output,
                        }
                        
                        // Render appropriate tool view based on tool name
                        if (toolName === 'contractDraft') {
                          return (
                            <ContractDraftToolView
                              key={invocation.id}
                              invocation={invocation}
                              addToolApprovalResponse={addToolApprovalResponse}
                            />
                          )
                        }
                        if (toolName === 'orgValidate') {
                          return (
                            <OrgValidationToolView
                              key={invocation.id}
                              invocation={invocation}
                              addToolApprovalResponse={addToolApprovalResponse}
                            />
                          )
                        }
                        if (toolName === 'dealVerify') {
                          return (
                            <DealVerificationToolView
                              key={invocation.id}
                              invocation={invocation}
                              addToolApprovalResponse={addToolApprovalResponse}
                            />
                          )
                        }
                        if (toolName === 'teacherVerify') {
                          return (
                            <TeacherVerificationToolView
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

              {(() => {
                const lastMessage = messages[messages.length - 1];
                const isAssistantWithoutContent = lastMessage?.role === "assistant" && 
                  (!lastMessage.parts || 
                   lastMessage.parts.filter((p: any) => p.type === "text" && p.text?.trim()).length === 0);
                
                const shouldShowLoader = status === "submitted" || isAssistantWithoutContent;
                
                return shouldShowLoader ? (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <ThinkingLoader />
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            <form onSubmit={handleSubmit} className="px-4 pt-4 border-t border-border bg-card">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about workflows, validate organizations, verify deals..."
                  className="flex-1 rounded-xl bg-background border-border focus-visible:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                  autoComplete="off"
                  disabled={status === "submitted"}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={status === "submitted" || !input.trim()}
                  className="rounded-xl h-10 w-10 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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

