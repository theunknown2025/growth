"use client"

import { useEffect, useState } from "react"
import BrandLogo from "@/components/logo/brand-logo"

export function ChatLoadingIndicator() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-primary/20 rounded-full animate-ping"></div>
        <div className="relative h-12 w-12 animate-pulse">
          <BrandLogo />
        </div>
      </div>
      <p className="mt-4 text-sm text-white/70">Thinking{dots}</p>
    </div>
  )
}