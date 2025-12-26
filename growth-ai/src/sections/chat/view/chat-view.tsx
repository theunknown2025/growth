"use client"

import { useState, useEffect, useRef } from "react"
import { ChatHistory } from "../chat-history"
import { ChatInput } from "../chat-input"
import { ChatMessages } from "../chat-messages"
import { ChatWelcome } from "../chat-welcome"
import { useChat } from "@/hooks/use-chat"
import { Button } from "@/shadcn/ui/button"
import { MessageSquare, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { useGetConversations } from "@/actions/chat"

export function ChatView() {
  
  const [showMobileHistory, setShowMobileHistory] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const isMobile = useIsMobile()

  const { conversations } = useGetConversations()

  const { 
    messages, 
    input, 
    setInput, 
    isSending, 
    isLoading, 
    handleSubmit, 
    deletechat, 
    setSelectedConversation 
  } = useChat({ conversationId: activeConversationId ?? undefined })
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Hide welcome screen when there are messages
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false)
    }
  }, [messages])

  useEffect(() => {
    if (!activeConversationId) {
      setShowWelcome(true);
    }
  }, [activeConversationId]);

  // Close mobile history when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setShowMobileHistory(false)
    }
  }, [isMobile])

  // Callback when a conversation is clicked
  const handleConversationClick = (conversationId: string) => {
    setActiveConversationId(conversationId)
    setSelectedConversation(conversationId)
    setShowWelcome(false)
    if (isMobile) {
      setShowMobileHistory(false)
    }
  }

  // Add a new function to handle new chat creation
  const handleNewChat = () => {
    setActiveConversationId(null)
    deletechat("")
    setShowWelcome(true)
  }

  return (
    <div className="flex h-full w-full">
      {/* Desktop Chat History Sidebar */}
      {!isMobile && (
        <div className="w-72 h-full bg-[#0F0A19] flex-shrink-0 border-r border-purple-primary/20">
          <ChatHistory
            conversations={conversations ? conversations : []}
            onConversationSelect={handleConversationClick}
            setShowWelcome={setShowWelcome}
            deletechat={handleNewChat}
          />
        </div>
      )}

      {/* Mobile Chat History Drawer */}
      {isMobile && showMobileHistory && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setShowMobileHistory(false)} />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-[300px] bg-[#0F0A19] z-50 border-r border-purple-primary/20 animate-in slide-in-from-left">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileHistory(false)}
                className="text-white/70 hover:text-white hover:bg-purple-primary/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-full overflow-hidden">
              <ChatHistory
                conversations={conversations ? conversations : []}
                onConversationSelect={handleConversationClick}
                setShowWelcome={setShowWelcome}
                deletechat={deletechat}
              />
            </div>
          </div>
        </>
      )}

      {/* Chat Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Chat History Button */}
        {isMobile && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              size="icon"
              className="bg-purple-primary/20 border-purple-primary/30"
              onClick={() => setShowMobileHistory(true)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {showWelcome ? (
            <ChatWelcome />
          ) : (
            <div
              className="flex-1 overflow-y-auto p-4 md:p-6 w-full"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              <ChatMessages messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 w-full">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isSending={isSending}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}