"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card"
import { Users, ClipboardCheck } from "lucide-react"
import { SimpleTestEvaluationTable } from "./manage-simple-table-view"
import { useGetAllEvaluations } from "@/actions/evaluation"

export function ProcessingStats() {

  const { evaluations } = useGetAllEvaluations()

  return (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Processing Dashboard</h1>
          <p className="text-white/70">Manage your tests and create assignments for clients.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-purple-light" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-white">128</div>
                <p className="text-xs text-white/70">+14% from last month</p>
                </CardContent>
            </Card>
            <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Tests</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-purple-light" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-white">342</div>
                <p className="text-xs text-white/70">+23% from last month</p>
                </CardContent>
            </Card>
        </div>
        {evaluations && (
          <SimpleTestEvaluationTable 
            evaluations={evaluations}
          />
        )}
    </div>
  )
}

