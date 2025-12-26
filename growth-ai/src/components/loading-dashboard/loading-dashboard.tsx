"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { Progress } from "@/shadcn/ui/progress"
import { cn } from "@/shadcn/lib/utils"

type LoadingScreenProps = React.HTMLAttributes<HTMLDivElement> & {
  portal?: boolean
  color?: string
  progressProps?: React.ComponentProps<typeof Progress>
}

export function LoadingScreen({
  portal = false,
  color = "var(--color-purple-primary)",
  className,
  progressProps,
  ...props
}: LoadingScreenProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const content = (
    <div className={cn("px-5 w-full flex-grow min-h-full flex items-center justify-center", className)} {...props}>
      <Progress
        className="w-full max-w-[360px]"
        style={
          {
            "--progress-foreground": color,
          } as React.CSSProperties
        }
        {...progressProps}
      />
    </div>
  )

  if (portal && mounted) {
    return createPortal(content, document.body)
  }

  return content
}

