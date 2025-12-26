"use client"

import { useEffect, useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar"
import { Button } from "@/shadcn/ui/button"
import { Copy, Volume2, Check, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/shadcn/lib/utils"
import type { Message } from "@/types/chat"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {messages.map((message) => (
        <ChatMessage key={message._id} message={message} />
      ))}

      {isLoading && (
        <div className="flex items-start gap-4 animate-fadeIn w-full">
          <Avatar className="h-8 w-8 border border-purple-light/30">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Growth AI" />
            <AvatarFallback className="bg-gradient-to-br from-purple-light to-purple-primary text-white">
              G
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <ChatLoadingIndicator />
          </div>
        </div>
      )}
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  // Check if this message is from a historical conversation
  const isHistorical = "isHistorical" in message && message.isHistorical === true

  const [typingComplete, setTypingComplete] = useState(isHistorical)
  const [displayedContent, setDisplayedContent] = useState(isHistorical ? message.message : "")
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Enhanced typing effect for AI messages, but only for new messages
  useEffect(() => {
    // Skip typing animation for historical messages or user messages
    if (isHistorical || message.sender === "user") {
      setDisplayedContent(message.message)
      setTypingComplete(true)
      return
    }

    if (message.sender === "assistant") {
      setDisplayedContent("")
      setTypingComplete(false)

      const content = message.message
      let currentIndex = 0
      const typingSpeed = 2 // Base typing speed (milliseconds)

      const typeNextCharacter = () => {
        if (currentIndex < content.length) {
          // Add the next character
          setDisplayedContent(content.substring(0, currentIndex + 1))
          currentIndex++

          // Vary typing speed based on punctuation
          const currentChar = content[currentIndex - 1]
          if ([".", "!", "?"].includes(currentChar)) {
            setTimeout(typeNextCharacter, typingSpeed * 15) // Pause longer at punctuation
          } else if ([",", ";", ":"].includes(currentChar)) {
            setTimeout(typeNextCharacter, typingSpeed * 8)
          } else if (currentChar === " ") {
            setTimeout(typeNextCharacter, typingSpeed * 2)
          } else {
            const randomVariation = Math.random() * 10 + 5
            setTimeout(typeNextCharacter, typingSpeed + randomVariation)
          }
        } else {
          setTypingComplete(true)
        }
      }

      // Start typing
      typeNextCharacter()

      return () => {
        // If component unmounts, show full content immediately
        setDisplayedContent(content)
        setTypingComplete(true)
      }
    } else {
      setDisplayedContent(message.message)
      setTypingComplete(true)
    }
  }, [message, isHistorical])

  const handleCopy = () => {
    if (message.message) {
      navigator.clipboard.writeText(message.message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVoice = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message.message)
      window.speechSynthesis.speak(utterance)
    }
  }

  const isUser = message.sender === "user"

  return (
    <div
      className={cn("flex items-start gap-4", isUser ? "flex-row-reverse" : "", "animate-fadeIn")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={() => setShowActions(true)}
    >
      {isUser ? (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="h-8 w-8 border border-purple-light/30">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Growth AI" />
          <AvatarFallback className="bg-gradient-to-br from-purple-light to-purple-primary text-white">
            G
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex-1 space-y-2", isUser ? "text-right" : "")}>
        <div
          className={cn(
            "inline-block rounded-lg px-4 py-3 max-w-[85%]",
            isUser
              ? "bg-gradient-to-r from-purple-light to-purple-primary text-white"
              : "bg-card/50 backdrop-blur-sm border border-purple-primary/10"
          )}
        >
          <div
            ref={contentRef}
            className={cn(
              "prose prose-sm dark:prose-invert max-w-none break-words",
              !typingComplete && !isUser && "after:inline-block after:w-1 after:h-4 after:bg-purple-primary after:animate-blink"
            )}
          >
            <ReactMarkdown>{displayedContent}</ReactMarkdown>
          </div>
        </div>

        {!isUser && typingComplete && (
          <div className={cn("flex gap-2", isUser ? "justify-end" : "")}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/50 hover:text-white hover:bg-purple-primary/20"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/50 hover:text-white hover:bg-purple-primary/20"
              onClick={handleVoice}
            >
              <Volume2 className="h-3.5 w-3.5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/50 hover:text-white hover:bg-purple-primary/20"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/50 hover:text-white hover:bg-purple-primary/20"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// You'll need to implement this component for loading indicators
function ChatLoadingIndicator() {
  return (
    <div className="inline-block rounded-lg px-4 py-3 bg-card/50 backdrop-blur-sm border border-purple-primary/10">
      <div className="flex space-x-2 items-center h-6">
        <div className="w-2 h-2 rounded-full bg-purple-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-purple-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-purple-primary/60 animate-bounce"></div>
      </div>
    </div>
  )
}