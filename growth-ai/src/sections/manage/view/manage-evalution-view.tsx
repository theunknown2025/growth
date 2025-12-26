"use client"

import type React from "react"
import { useState, useEffect, useContext } from "react"
import { Calendar, CheckCircle2, FileText, LineChart, MessageSquare, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/ui/card"
import { Button } from "@/shadcn/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs"
import { SimpleTestEvaluationTable } from "../manage-simple-table-view"
import { AuthContext } from "@/sections/auth/context/AuthContext"
import { useGetAllEvaluations, useGetCounterEvaluations } from "@/actions/evaluation"
import { useGetAllAnalysis } from "@/actions/analysis"

export function DashboardContent() {
  const [mounted, setMounted] = useState(false)
  const { user } = useContext(AuthContext) || {}
  const { evaluations } = useGetAllEvaluations()
  const { analysis } = useGetAllAnalysis()
  const { counterevaluations } = useGetCounterEvaluations();

  console.log("counter" , counterevaluations)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="text-white/80 mt-2 text-base">
            Here's your evaluation insights dashboard for{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-purple-primary/20 hover:bg-purple-primary/10 text-white">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#1A1525]/70 backdrop-blur-sm border border-purple-primary/20 p-1 w-full md:w-auto">
          <TabsTrigger
            value="overview"
            className="text-white data-[state=active]:bg-purple-primary data-[state=active]:text-white px-4 py-2"
          >
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {analysis && (
              <>
                <StatCard
                  title="Conversations"
                  value={analysis.conversationCount}
                  icon={<MessageSquare className="h-5 w-5 text-white" />}
                  bgGradient="from-purple-500 to-purple-700"
                  description="Total conversations"
                />
                <StatCard
                  title="Users"
                  value={analysis.usersCount}
                  icon={<Users className="h-5 w-5 text-white" />}
                  bgGradient="from-blue-500 to-blue-700"
                  description="Active users"
                />
                <StatCard
                  title="Simple Tests"
                  value={analysis.simpleTestCount}
                  icon={<FileText className="h-5 w-5 text-white" />}
                  bgGradient="from-green-500 to-green-700"
                  description="Completed tests"
                />
                <StatCard
                  title="Advanced Tests"
                  value={analysis.advancedTestCount}
                  icon={<CheckCircle2 className="h-5 w-5 text-white" />}
                  bgGradient="from-amber-500 to-amber-700"
                  description="In-depth evaluations"
                />
              </>
            )}
          </div>

          {/* Performance Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 border-purple-primary/20 bg-[#1A1525]/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">Performance Trends</CardTitle>
                    <CardDescription className="text-white/70">Monthly evaluation metrics</CardDescription>
                  </div>
                  <LineChart className="h-5 w-5 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
              <div className="h-[300px] bg-[#0F0A19]/50 rounded-md relative overflow-hidden p-4">
                  <div className="absolute top-4 left-6 right-6">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <div className="text-sm text-white/70">Total Tests</div>
                        <div className="text-2xl font-bold text-white">
                          {(analysis?.simpleTestCount ?? 0) + (analysis?.advancedTestCount ?? 0)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-white/70">Completion Rate</div>
                        <div className="text-2xl font-bold text-white">
                          {Math.round(
                            ((analysis?.simpleTestCount ?? 0) + (analysis?.advancedTestCount ?? 0)) /
                              (analysis?.conversationCount ?? 1) *
                              100
                          )}
                          %
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-white/70">Avg. Score</div>
                        <div className="text-2xl font-bold text-white">
                          {Math.round(
                          (((analysis?.simpleTestCount ?? 0) + (analysis?.advancedTestCount ?? 0)) /
                            (analysis?.conversationCount ?? 1)) *
                            10
                          )}
                          /10
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart */}
                    <div className="absolute bottom-0 left-0 right-0 h-[180px] px-4">
                      <div className="flex gap-6 justify-between h-full pt-10">
                      <div className="flex-1">
                        <h3 className="text-sm text-white/70 text-center mb-2">Simple Evaluations</h3>
                        <div className="flex items-end justify-between h-full">
                        {counterevaluations?.simpleTestCount?.map((item, i) => (
                          <div key={i} className="flex flex-col items-center">
                          <div className="text-xs text-white mb-1">{item.count}</div>
                          <div
                            className="w-8 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md"
                            style={{ height: `${Number(item.count) * 15}px` }}
                          ></div>
                          <div className="text-xs text-white/70 mt-2">{item.month}</div>
                          </div>
                        ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm text-white/70 text-center mb-2">Advanced Evaluations</h3>
                        <div className="flex items-end justify-between h-full">
                        {counterevaluations?.advancedTestCount?.map((item, i) => (
                          <div key={i} className="flex flex-col items-center">
                          <div className="text-xs text-white mb-1">{item.count}</div>
                          <div
                            className="w-8 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md"
                            style={{ height: `${Number(item.count) * 15}px` }}
                          ></div>
                          <div className="text-xs text-white/70 mt-2">{item.month}</div>
                          </div>
                        ))}
                        </div>
                      </div>
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-primary/20 bg-[#1A1525]/70 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">Test Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 mb-4">
                    <div className="absolute inset-0 rounded-full border-8 border-purple-600"></div>
                    <div
                      className="absolute inset-0 rounded-full border-8 border-blue-500"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                        clip: "rect(0px, 80px, 160px, 0px)",
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {analysis ? Number(analysis.simpleTestCount) + Number(analysis.advancedTestCount) : 0}
                        </div>
                        <div className="text-xs text-white/70">Total Tests</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      <div>
                        <div className="text-sm font-medium text-white">Simple</div>
                        <div className="text-xs text-white/70">{analysis?.simpleTestCount || 0} tests</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="text-sm font-medium text-white">Advanced</div>
                        <div className="text-xs text-white/70">{analysis?.advancedTestCount || 0} tests</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluation Tables */}
          <div className="w-full">
            {evaluations && <SimpleTestEvaluationTable evaluations={evaluations} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  bgGradient,
  description,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  bgGradient: string
  description: string
}) {
  return (
    <Card className="border-purple-primary/20 bg-[#1A1525]/70 backdrop-blur-sm shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className={`rounded-full p-2.5 bg-gradient-to-br ${bgGradient}`}>{icon}</div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-sm font-medium text-white/90 mt-1">{title}</p>
          <p className="text-xs text-white/60 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricItem({ label, value, isInverted = false }: { label: string; value: number; isInverted?: boolean }) {
  const getColor = () => {
    if (isInverted) {
      if (value <= 10) return "bg-green-500"
      if (value <= 20) return "bg-amber-500"
      return "bg-red-500"
    } else {
      if (value >= 90) return "bg-green-500"
      if (value >= 70) return "bg-amber-500"
      return "bg-red-500"
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-sm font-medium text-white">{value}%</span>
      </div>
      <div className="w-full bg-[#0F0A19] rounded-full h-2">
        <div className={`h-2 rounded-full ${getColor()}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}
