"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/shadcn/ui/button"
import { Input } from "@/shadcn/ui/input"
import { SendHorizontal, Image, Mic } from "lucide-react"
import { cn } from "@/shadcn/lib/utils"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSending: boolean
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSubmit, isSending, disabled = false }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative transition-all duration-200 w-full max-w-5xl mx-auto",
        isFocused ? "scale-[1.01]" : "scale-100",
      )}
    >
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write anything here..."
        className="pr-24 py-5 md:py-6 bg-[#1A1625] border-purple-primary/20 shadow-lg text-white w-full"
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button
          type="submit"
          size="icon"
          className={cn(
            "bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90 transition-all",
            isSending && "animate-pulse",
          )}
          disabled={disabled || !value.trim()}
        >
          {isSending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  )
}

