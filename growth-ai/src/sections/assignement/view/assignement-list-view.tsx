"use client"

import { CheckCircle2, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card"
import { AssignementsTable } from "../assignement-table"
import { useGetAllAssignement , useCountAssignement } from "@/actions/assignements"

export function AssignmentDashboard() {

  const { assignements } = useGetAllAssignement()
  const { assignementsCount} = useCountAssignement()

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Assignment Dashboard</h1>
        <p className="text-white/70 mt-1">Manage and track all your assignments in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#1A1525] border-purple-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Assignments In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-white">{assignementsCount?.inProgress}</span>
                  <span className="text-base ml-2 text-white/70">assignments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1525] border-purple-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              Assignments Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-white">{assignementsCount?.finished}</span>
                  <span className="text-base ml-2 text-white/70">assignments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Table */}
      <AssignementsTable assignements={assignements} />
    </div>
  )
}
