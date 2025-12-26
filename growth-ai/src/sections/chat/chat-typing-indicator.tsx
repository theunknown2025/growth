"use client"

import { cn } from "@/shadcn/lib/utils"

export function ChatTypingIndicator() {
  return (
    <div className="flex items-center gap-1 h-4 mt-1">
      <div className={cn("h-1.5 w-1.5 rounded-full bg-purple-light animate-bounce", "animation-delay-0")} />
      <div className={cn("h-1.5 w-1.5 rounded-full bg-purple-light animate-bounce", "animation-delay-150")} />
      <div className={cn("h-1.5 w-1.5 rounded-full bg-purple-light animate-bounce", "animation-delay-300")} />
    </div>
  )
}