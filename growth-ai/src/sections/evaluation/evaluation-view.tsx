"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shadcn/ui/button"
import { Card, CardContent } from "@/shadcn/ui/card"
import {
  ClipboardList,
  AlertCircle,
  Plus,
  Clock,
  BarChart,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/shadcn/lib/utils"
import { Badge } from "@/shadcn/ui/badge"
import { Progress } from "@/shadcn/ui/progress"
import { useGetAdvcancedEvaluation, useGetSimpleEvaluation } from "@/actions/evaluation"

export function EvaluationView() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const router = useRouter()

  const { simpleevaluations } = useGetSimpleEvaluation()
  const { advancedevaluations } = useGetAdvcancedEvaluation()

  const handleStartSimpleTest = () => {
    router.push("/dashboard/evaluation/simple-test")
  }

  const handleStartAdvancedTest = () => {
    router.push("/dashboard/evaluation/advanced-test")
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-light to-white">
          Welcome to the Growth
        </h1>
        <p className="text-lg text-muted-foreground">
          Test your knowledge and skills with our simple and advanced tests. Choose the test that suits you best and start your journey towards mastery.
        </p>
      </div>

      {/* Start New Test Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={18} className="text-purple-light" />
          <h2 className="text-xl font-semibold">Start a New Test</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TestCard
            title="Simple Test"
            icon={<ClipboardList className="h-8 w-8" />}
            description=" General overview of your activity and its alignment with the AIM Framework"
            time="30 minutes"
            buttonText="START SIMPLE TEST"
            onHover={() => setHoveredCard("simple")}
            onLeave={() => setHoveredCard(null)}
            isHovered={hoveredCard === "simple"}
            onClick={handleStartSimpleTest}
          />

          <TestCard
            title="Advanced Test"
            icon={<AlertCircle className="h-8 w-8" />}
            description="Deep dive into your activity according to the AIM Framework, we're asking more questions to better enhance your response and provide with larger understanding of your poject"
            time="60 minutes"
            buttonText="START ADVANCED TEST"
            onHover={() => setHoveredCard("advanced")}
            onLeave={() => setHoveredCard(null)}
            isHovered={hoveredCard === "advanced"}
            onClick={handleStartAdvancedTest}
          />
        </div>
      </div>

      {/* Evaluations Groups Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Simple Evaluations Column */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-purple-light" />
              <h2 className="text-xl font-semibold">Your Simple Evaluations</h2>
            </div>
            <div className="space-y-4">
              {simpleevaluations && simpleevaluations.length > 0 ? (
                simpleevaluations.map((evaluation, index) => (
                  <ContinueTestCard
                    key={`${evaluation._id}-${index}`}
                    id={evaluation._id}
                    title={evaluation.status}
                    progress={evaluation.progress || 0}
                    timeLeft={evaluation.createdAt}
                    lastUpdated={evaluation.createdAt}
                    onHover={() => setHoveredCard(evaluation._id)}
                    onLeave={() => setHoveredCard(null)}
                    isHovered={hoveredCard === evaluation._id}
                    onClick={() => router.push(`/dashboard/evaluation/simple-test?id=${evaluation._id}`)}
                  />
                ))
              ) : (
                <Card className="border-purple-primary/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-center text-muted-foreground">
                      You haven't passed any simple test yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Advanced Evaluations Column */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-purple-light" />
              <h2 className="text-xl font-semibold">Your Advanced Evaluations</h2>
            </div>
            <div className="space-y-4">
              {advancedevaluations && advancedevaluations.length > 0 ? (
                advancedevaluations.map((evaluation, index) => (
                  <ContinueTestCard
                    key={`${evaluation._id}-${index}`}
                    id={evaluation._id}
                    title={evaluation.status}
                    progress={evaluation.progress || 0}
                    timeLeft={evaluation.createdAt}
                    lastUpdated={evaluation.createdAt}
                    onHover={() => setHoveredCard(evaluation._id)}
                    onLeave={() => setHoveredCard(null)}
                    isHovered={hoveredCard === evaluation._id}
                    onClick={() => router.push(`/dashboard/evaluation/advanced-test?id=${evaluation._id}`)}
                  />
                ))
              ) : (
                <Card className="border-purple-primary/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-center text-muted-foreground">
                      You haven't passed any advanced test yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TestCardProps {
  title: string
  icon: React.ReactNode
  description: string
  time: string
  buttonText: string
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
  onClick: () => void
}

function TestCard({ title, icon, description, time, buttonText, onHover, onLeave, isHovered, onClick }: TestCardProps) {
  return (
    <Card
      className={cn(
        "border-purple-primary/10 bg-white/5 backdrop-blur-sm transition-all duration-300",
        isHovered ? "transform scale-[1.02] shadow-lg shadow-purple-primary/20" : ""
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full bg-gradient-to-r from-purple-light to-purple-primary flex items-center justify-center mb-4 transition-all duration-300",
              isHovered ? "transform scale-110" : ""
            )}
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <span>Estimated time: {time}</span>
          </div>
          <Button
            className={cn(
              "w-full bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90 transition-all duration-300"
            )}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ContinueTestCardProps {
  id: string
  title: string
  progress: number
  timeLeft: string
  lastUpdated: string
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
  onClick: () => void
}

function ContinueTestCard({
  id,
  title,
  progress,
  timeLeft,
  lastUpdated,
  onHover,
  onLeave,
  isHovered,
  onClick,
}: ContinueTestCardProps) {
  // Format the last updated date for better readability
  const formattedLastUpdated = new Date(lastUpdated).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card
      className={cn(
        "border-purple-primary/10 bg-white/5 backdrop-blur-sm transition-all duration-300",
        isHovered ? "transform scale-[1.01] shadow-lg shadow-purple-primary/20" : ""
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">{title === 'in progress' ? 'In Progress' : 'Completed'}</h3>
            <div className="text-sm text-muted-foreground mb-2">
              {formattedLastUpdated}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-2 bg-purple-primary/20" />
              </div>
              <span className="text-sm whitespace-nowrap">{progress}% complete</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "border-purple-primary/20",
                title === 'in progress' 
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-green-500/10 text-green-400"
              )}
            >
              {title === 'in progress' ? 'In Progress' : 'Completed'}
            </Badge>
            <Button
              className={cn(
                "bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90 transition-all duration-300",
                isHovered ? "opacity-90" : ""
              )}
              onClick={onClick}
            >
              {title === 'in progress' ? 'Continue' : 'View Results'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ResultCardProps {
  title: string
  score: number
  date: string
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
}

function ResultCard({ title, score, date, onHover, onLeave, isHovered }: ResultCardProps) {
  return (
    <Card
      className={cn(
        "border-purple-primary/10 bg-white/5 backdrop-blur-sm transition-all duration-300",
        isHovered ? "transform scale-[1.02] shadow-lg shadow-purple-primary/20" : ""
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-light/30 to-purple-primary/30 transition-all duration-300",
              isHovered ? "bg-gradient-to-r from-purple-light/40 to-purple-primary/40 transform scale-110" : ""
            )}
          >
            <span className="text-xl font-bold">{score}%</span>
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{date}</p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">Passed</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" className="border-purple-primary/20 hover:bg-purple-primary/10">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface RecommendedCardProps {
  title: string
  difficulty: string
  time: string
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
}