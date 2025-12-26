"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import type { Message } from "@/types/chat"
import { v4 as uuidv4 } from "uuid"
import { useRegenerateAnswer, useCreateConversation } from "@/actions/chat"
import { useGetConversation } from "@/actions/chat"

type ChatHook = {
  conversationId?: string
}

export function useChat({ conversationId }: ChatHook = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoricalLoad, setIsHistoricalLoad] = useState(false)
  
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>(
    conversationId
  )

  const { regenerateAnswer } = useRegenerateAnswer()
  const { createConversation } = useCreateConversation()
  const { conversation } = useGetConversation(selectedConversation || "")

  // Load conversation messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setIsLoading(true);
      setIsHistoricalLoad(true); // Mark that we're loading historical messages
      
      if (conversation && Array.isArray((conversation as { messages: Message[] }).messages) && (conversation as { messages: Message[] }).messages.length > 0) {
        // Add isHistorical flag to loaded messages
        const historicalMessages = (conversation as { messages: Message[] }).messages.map(msg => ({
          ...msg,
          isHistorical: true
        }));
        
        setMessages(historicalMessages);
      }
      
      setIsLoading(false);
      
      // Reset historical flag after a short delay
      setTimeout(() => {
        setIsHistoricalLoad(false);
      }, 500);
    }
  }, [selectedConversation, conversation]);

  // Update selectedConversation when conversationId prop changes
  useEffect(() => {
    if (conversationId && conversationId !== selectedConversation) {
      setSelectedConversation(conversationId);
    }
  }, [conversationId, selectedConversation]);

  const addMessage = useCallback((sender: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      _id: uuidv4(),
      sender,
      message: content,
      timestamp: new Date(),
      isHistorical: false // New messages are never historical
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }, [])

  // This function handles the common submission logic
  const onSubmit = useCallback(
    async (e: React.FormEvent, convId: string) => {
      addMessage("user", input)
      try {
        const message = {
          sender: "user",
          message: input,
        }
        const aiResponse = await regenerateAnswer(message, convId)
        if (aiResponse && aiResponse.message) {
          addMessage("assistant", aiResponse.message)
        }
      } catch (error) {
        console.error("Failed to get AI response:", error)
      } finally {
        setInput("")
      }
    },
    [input, addMessage, regenerateAnswer]
  )

  // Modified handleSubmit with isLoading logic
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || isSending) return

      setIsSending(true)
      setIsLoading(true)

      if (!selectedConversation) {
        const response = await createConversation({ title: input })
        console.log("Created conversation:", response._id)
        if (response) {
          setSelectedConversation(response._id)
          setInput("")
          await onSubmit(e, response._id)
        } else {
          setIsSending(false)
          setIsLoading(false)
          return
        }
      } else {
        await onSubmit(e, selectedConversation)
      }

      setIsSending(false)
      setIsLoading(false)
    },
    [input, isSending, selectedConversation, createConversation, onSubmit]
  )

  const deletechat = useCallback((conversationId?: string) => {
    setMessages([])
    setInput("")
    setIsSending(false)
    setIsLoading(false) // Also reset loading state
    setSelectedConversation(undefined)
  }, [])

  return {
    messages,
    input,
    setInput,
    isSending,
    isLoading,
    isHistoricalLoad,
    handleSubmit,
    deletechat,
    selectedConversation,
    setSelectedConversation,
  }
}