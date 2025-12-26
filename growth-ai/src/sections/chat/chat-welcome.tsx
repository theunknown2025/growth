"use client"

import type React from "react"

import { Button } from "@/shadcn/ui/button"
import { Card, CardContent } from "@/shadcn/ui/card"
import { Image, Mic, Code, Briefcase, TrendingUp, UserCheck } from "lucide-react"
import { useChat } from "@/hooks/use-chat"

export function ChatWelcome() {
  const { setInput } = useChat()

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto w-full">
      <div className="text-center mb-8 md:mb-12 animate-slideUp">
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl mb-6 bg-gradient-to-br from-purple-light to-purple-primary">
          <MessageIcon className="h-7 w-7 md:h-8 md:w-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-light to-white">
          How Can I Assist You?
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Quickly find answers, get assistance, and explore AI-powered insights—all in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl">
        <FeatureCard
          title="Business Strategy"
          description="Drive success with innovative planning and sound business management practices."
          icon={<Briefcase className="h-5 w-5" />}
          delay={100}
        />

        <FeatureCard
          title="Brand Impact"
          description="Enhance your company's market presence with cohesive strategies and impactful messaging."
          icon={<TrendingUp className="h-5 w-5" />}
          delay={200}
        />

        <FeatureCard
          title="Leadership Excellence"
          description="Inspire teams with forward-thinking leadership and a collaborative culture."
          icon={<UserCheck className="h-5 w-5" />}
          delay={300}
        />
      </div>

      <div className="mt-8 flex gap-3 flex-wrap justify-center">
        <SuggestionButton onClick={() => handleSuggestionClick("What is Brand AI?")}>
          What is Brand AI?
        </SuggestionButton>
        <SuggestionButton onClick={() => handleSuggestionClick("Any marketing strategy ideas?")}>
          Marketing Strategy?
        </SuggestionButton>
        <SuggestionButton onClick={() => handleSuggestionClick("Tips for business management?")}>
          Business Management?
        </SuggestionButton>
      </div>
    </div>
  )
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h6" />
    </svg>
  )
}

function FeatureCard({
  title,
  description,
  icon,
  delay = 0,
}: {
  title: string
  description: string
  icon: React.ReactNode
  delay?: number
}) {
  return (
    <Card
      className="card-hover border-purple-primary/10 bg-[#1A1625]/50 backdrop-blur-sm animate-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="feature-icon mb-4">{icon}</div>
        <h3 className="font-semibold text-lg mb-2 text-white">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
        <Button variant="link" className="p-0 mt-2 text-purple-light hover:text-purple-primary">
          Learn More →
        </Button>
      </CardContent>
    </Card>
  )
}

function SuggestionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="rounded-full border-purple-primary/20 bg-[#1A1625]/50 backdrop-blur-sm hover:bg-purple-primary/10 text-white"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

